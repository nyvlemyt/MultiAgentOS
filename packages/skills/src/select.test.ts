import { describe, it, expect, vi } from 'vitest';
import { SkillRouter } from './router.js';
import { mergeSkillMetas } from './merge.js';
import { selectLibrarySkills, type RankFn, type ArsenalRetriever } from './select.js';
import type { SkillMeta } from './types.js';

function meta(over: Partial<SkillMeta> & { id: string }): SkillMeta {
  return {
    name: over.id,
    description: '',
    domain: 'planning',
    summary: `summary of ${over.id}`,
    tags: [],
    path: `/fake/${over.id}/SKILL.md`,
    ...over,
  };
}

describe('mergeSkillMetas (router library merge)', () => {
  it('includes both library + orchestrator ids and dedups, orchestrator wins on collision', () => {
    const orchestrator: SkillMeta[] = [
      meta({ id: 'mas-mission-planner', domain: 'planning', summary: 'ORCH planner' }),
      meta({ id: 'shared', domain: 'security', summary: 'ORCH shared' }),
    ];
    const library: SkillMeta[] = [
      meta({ id: 'accessibility', domain: 'code-review', cluster: 'skill:core-eval' }),
      meta({ id: 'shared', domain: 'planning', summary: 'LIB shared', cluster: 'cyber:x' }),
    ];

    const merged = mergeSkillMetas(orchestrator, library);
    const ids = merged.map((m) => m.id).sort((a, b) => a.localeCompare(b));
    expect(ids).toEqual(['accessibility', 'mas-mission-planner', 'shared']);

    const sharedEntry = merged.find((m) => m.id === 'shared');
    expect(sharedEntry).toEqual(orchestrator[1]);
    expect(sharedEntry?.summary).toBe('ORCH shared');
  });
});

// Synthetic arsenal for selectLibrarySkills unit tests.
function arsenal(): SkillMeta[] {
  const list: SkillMeta[] = [];
  for (let i = 0; i < 20; i++) {
    list.push(
      meta({
        id: `sec-${String(i).padStart(2, '0')}`,
        domain: 'security',
        cluster: 'skill:core-security',
        tags: ['skill:core-security', 'security'],
        summary: `security skill ${i}`,
      }),
    );
  }
  list.push(meta({ id: 'sec-auth', domain: 'security', cluster: 'skill:core-security', tags: ['skill:core-security', 'auth', 'login'], summary: 'auth login hardening' }));
  for (let i = 0; i < 5; i++) {
    list.push(meta({ id: `cyber-${i}`, domain: 'planning', cluster: 'cyber:forensics', tags: ['cyber:forensics'], summary: `cyber skill ${i}` }));
  }
  list.push(meta({ id: 'plan-misc', domain: 'planning', cluster: 'skill:misc', tags: ['skill:misc'], summary: 'planning misc' }));
  return list;
}

const SEC_TASK = { id: 't1', title: 'Review login security', description: 'audit auth and login flows' };

describe('selectLibrarySkills — stage 1 deterministic', () => {
  it('domain scope filters to that domain, respects top-K, stable sort, hint boosts', async () => {
    const router = new SkillRouter(arsenal());
    const res = await selectLibrarySkills({
      task: { ...SEC_TASK, skillsHint: ['sec-auth'] },
      scope: { domain: 'security' },
      router,
      k: 15,
      n: 5,
    });

    expect(res.degraded).toBe(true);
    expect(res.skillIds.length).toBeLessThanOrEqual(5);
    // Only security-domain skills are eligible (cyber/misc excluded).
    for (const id of res.skillIds) expect(id.startsWith('sec-')).toBe(true);
    // The hinted + tag-matching skill ranks first.
    expect(res.skillIds[0]).toBe('sec-auth');
    expect(res.rationale).toContain('security');
  });

  it('is fully deterministic across repeated calls', async () => {
    const router = new SkillRouter(arsenal());
    const params = { task: SEC_TASK, scope: { domain: 'security' as const }, router };
    const a = await selectLibrarySkills(params);
    const b = await selectLibrarySkills(params);
    expect(a.skillIds).toEqual(b.skillIds);
  });
});

describe('selectLibrarySkills — stage 1 cluster scope', () => {
  it('clusterPrefix scope (no domain) includes only matching clusters, excludes core-security', async () => {
    const router = new SkillRouter(arsenal());
    const res = await selectLibrarySkills({
      task: { id: 't2', title: 'forensics triage', description: 'disk forensics' },
      scope: { clusterPrefix: 'cyber:' },
      router,
    });
    for (const id of res.skillIds) expect(id.startsWith('cyber-')).toBe(true);
    expect(res.skillIds).not.toContain('sec-auth');
  });
});

describe('selectLibrarySkills — stage 2 bounded LLM rank', () => {
  it('uses the mocked RankFn order and receives <= K candidates', async () => {
    const router = new SkillRouter(arsenal());
    let seenCount = -1;
    const rank: RankFn = (args) => {
      seenCount = args.candidates.length;
      // Reverse the shortlist's first N to prove the LLM order is honored.
      return args.candidates.slice(0, args.n).map((c) => c.id).reverse();
    };
    const llm = vi.fn(rank);

    const res = await selectLibrarySkills({
      task: SEC_TASK,
      scope: { domain: 'security' },
      router,
      llm,
      k: 15,
      n: 5,
    });

    expect(res.degraded).toBe(false);
    expect(llm).toHaveBeenCalledTimes(1);
    expect(seenCount).toBeLessThanOrEqual(15);
    expect(res.skillIds.length).toBeLessThanOrEqual(5);

    // Order must match the mock's returned (reversed) order, filtered to the shortlist.
    const deterministic = await selectLibrarySkills({ task: SEC_TASK, scope: { domain: 'security' }, router, k: 15, n: 5 });
    const expected = deterministic.skillIds.slice().reverse();
    // deterministic.skillIds is top-N already (5); reversed is the mock output.
    expect(res.skillIds).toEqual(expected);
  });

  it('ignores hallucinated ids returned by the RankFn', async () => {
    const router = new SkillRouter(arsenal());
    const llm: RankFn = () => ['does-not-exist', 'sec-auth', 'also-fake'];
    const res = await selectLibrarySkills({ task: SEC_TASK, scope: { domain: 'security' }, router, llm });
    expect(res.skillIds).toEqual(['sec-auth']);
    expect(res.degraded).toBe(false);
  });
});

describe('selectLibrarySkills — arsenal retriever (source b RRF fusion)', () => {
  const router = new SkillRouter(arsenal());
  const base = { task: SEC_TASK, scope: { domain: 'security' as const }, router, k: 15, n: 5 };

  it('surfaces a tag-missed skill that the semantic retriever ranks first', async () => {
    // sec-19 has no auth/login tag → low tag-score; the retriever ranks it #1.
    const retriever: ArsenalRetriever = {
      query: () => [{ id: 'sec-19', score: 0.99 }],
    };
    const fused = await selectLibrarySkills({ ...base, retriever });
    const plain = await selectLibrarySkills(base);
    expect(fused.skillIds).toContain('sec-19');
    expect(plain.skillIds).not.toContain('sec-19');
    // degraded tracks llm-rank absence only — unchanged by retriever presence.
    expect(fused.degraded).toBe(true);
  });

  it('surfaces a tag-missed skill via the REAL qmd id shape (mas-arsenal/skill/<slug>.md)', async () => {
    // Integration shape: the live QmdRetriever emits ids `mas-arsenal/skill/<slug>.md`
    // (collection/<root-relative path>), NOT bare slugs. The union must normalize
    // these back to the router slug before fusing, else known.get() never matches and
    // the semantic branch is silently dead (ADR 0007 Decision 1).
    const retriever: ArsenalRetriever = {
      query: () => [{ id: 'mas-arsenal/skill/sec-19.md', score: 0.99 }],
    };
    const fused = await selectLibrarySkills({ ...base, retriever });
    const plain = await selectLibrarySkills(base);
    expect(fused.skillIds).toContain('sec-19');
    expect(plain.skillIds).not.toContain('sec-19');
    expect(fused.degraded).toBe(true);
  });

  it('drops non-skill arsenal hits (agent/rule/command stubs have no skill counterpart)', async () => {
    // The mission-llm adapter queries the whole mas-arsenal collection; an agent stub
    // whose slug collides with a skill slug must NOT surface that skill.
    const retriever: ArsenalRetriever = {
      query: () => [{ id: 'mas-arsenal/agent/sec-19.md', score: 0.99 }],
    };
    const res = await selectLibrarySkills({ ...base, retriever });
    const plain = await selectLibrarySkills(base);
    expect(res.skillIds).toEqual(plain.skillIds);
  });

  it('omitted retriever ⇒ byte-identical to source-a only', async () => {
    const withUndef = await selectLibrarySkills({ ...base, retriever: undefined });
    const plain = await selectLibrarySkills(base);
    expect(withUndef.skillIds).toEqual(plain.skillIds);
    expect(withUndef.degraded).toBe(plain.degraded);
  });

  it('throwing retriever ⇒ falls back to source-a, degraded unchanged', async () => {
    const throwing: ArsenalRetriever = {
      query: () => {
        throw new Error('qmd offline');
      },
    };
    const res = await selectLibrarySkills({ ...base, retriever: throwing });
    const plain = await selectLibrarySkills(base);
    expect(res.skillIds).toEqual(plain.skillIds);
    expect(res.degraded).toBe(true);
  });
});

describe('selectLibrarySkills — degradation', () => {
  const router = new SkillRouter(arsenal());
  const base = { task: SEC_TASK, scope: { domain: 'security' as const }, router, k: 15, n: 5 };

  it('llm absent → deterministic top-N + degraded', async () => {
    const res = await selectLibrarySkills(base);
    expect(res.degraded).toBe(true);
    expect(res.skillIds).toHaveLength(5);
  });

  it('llm throws → degrades to deterministic top-N', async () => {
    const throwing: RankFn = () => {
      throw new Error('boom');
    };
    const res = await selectLibrarySkills({ ...base, llm: throwing });
    const det = await selectLibrarySkills(base);
    expect(res.degraded).toBe(true);
    expect(res.skillIds).toEqual(det.skillIds);
  });

  it('llm throws budget_exceeded → degrades to deterministic top-N', async () => {
    const budget: RankFn = () => {
      throw new Error('budget_exceeded: window cap reached');
    };
    const res = await selectLibrarySkills({ ...base, llm: budget });
    const det = await selectLibrarySkills(base);
    expect(res.degraded).toBe(true);
    expect(res.skillIds).toEqual(det.skillIds);
  });
});
