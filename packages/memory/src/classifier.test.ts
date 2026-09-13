import { describe, it, expect, vi } from 'vitest';
import { classifyByRulesOnly, classifyCandidate } from './classifier';

const neverLLM = () => {
  throw new Error('LLM must not be called on a deterministic rule hit');
};

describe('classifyCandidate — deterministic rules first (ADR 0004 §5)', () => {
  it('keyword "decided" → decisions register, zero LLM calls', async () => {
    const llm = vi.fn(neverLLM);
    const d = await classifyCandidate(
      { body: 'Decided: approved high-risk task "apply diff".', projectId: 'proj' },
      { llm },
    );
    expect(d).toMatchObject({ register: 'decisions', scope: 'project', method: 'rule' });
    expect(llm).not.toHaveBeenCalled();
  });

  it('keyword "learned/TIL" → learnings; "blocked" → blockers; "benchmark" → evals', async () => {
    const llm = vi.fn(neverLLM);
    const cases: Array<[string, string]> = [
      ['TIL: drizzle migrations are append-only.', 'learnings'],
      ['Blocked: mission ended blocked — needs follow-up.', 'blockers'],
      ['Benchmark: FTS5 returns in 4ms on 10k docs.', 'evals'],
    ];
    for (const [body, register] of cases) {
      const d = await classifyCandidate({ body, projectId: 'proj' }, { llm });
      expect(d!.register).toBe(register);
      expect(d!.method).toBe('rule');
    }
    expect(llm).not.toHaveBeenCalled();
  });

  it('an explicit user tag always wins over keywords', async () => {
    const llm = vi.fn(neverLLM);
    const d = await classifyCandidate(
      {
        body: 'Decided: this looks like a decision but the user filed it as a learning.',
        projectId: 'proj',
        userTag: { register: 'learnings', scope: 'global' },
      },
      { llm },
    );
    expect(d).toMatchObject({ register: 'learnings', scope: 'global', method: 'rule' });
    expect(llm).not.toHaveBeenCalled();
  });

  it('mission summary "Mission ... validated" → journal (rule)', async () => {
    const llm = vi.fn(neverLLM);
    const d = await classifyCandidate(
      { body: 'Mission "Polish feed" validated: 5/5 tasks done, 1300 tokens spent.', projectId: 'proj' },
      { llm },
    );
    expect(d).toMatchObject({ register: 'journal', scope: 'project', method: 'rule' });
  });

  it('abstain → exactly one logged light-LLM call', async () => {
    const llm = vi.fn(async () => 'learnings');
    const logged: unknown[] = [];
    const d = await classifyCandidate(
      { body: 'Quelques pensées diverses sans signal clair.', projectId: 'proj' },
      { llm, onLlmFallback: (info) => logged.push(info) },
    );
    expect(llm).toHaveBeenCalledTimes(1);
    expect(d).toMatchObject({ register: 'learnings', method: 'llm' });
    expect(logged).toHaveLength(1);
  });

  it('abstain with an unparseable LLM answer falls back to journal', async () => {
    const llm = vi.fn(async () => 'no idea, sorry');
    const d = await classifyCandidate({ body: 'zzz aaa', projectId: 'proj' }, { llm });
    expect(d).toMatchObject({ register: 'journal', method: 'llm' });
  });

  it('scope defaults: projectId → project; none or feedback type → global', async () => {
    const llm = vi.fn(neverLLM);
    const fb = await classifyCandidate(
      { body: 'TIL user prefers eco mode.', candidateType: 'feedback', projectId: 'proj' },
      { llm },
    );
    expect(fb!.scope).toBe('global');
    const noProj = await classifyCandidate({ body: 'Decided: X.' }, { llm });
    expect(noProj!.scope).toBe('global');
  });
});

// ─── Provenance gate (2026-09-07, docs/backlog/classifieur-faux-positifs-cours.md) ───
// The 5 keyword rules were calibrated on MISSION prose ("Decided to…", "We learned that…") and
// then reused verbatim on the ingestion conveyor, which serves COURSE prose. The registry words
// are also the taught domain's words, so 51 of 51 classified course documents were mis-filed.
// These tests pin the frontier the table never had: the mission table only sees mission candidates.
describe('provenance gate — the mission table only judges mission candidates', () => {
  const neverCalled = vi.fn(neverLLM);

  it('an ingested course support about Deep Learning abstains (the 43 kw-learning false positives)', () => {
    expect(
      classifyByRulesOnly({
        body: '| DEEP | LEARNING | (cid:136) MASTER | 1 |\nCours 3 — réseaux convolutifs.',
        candidateType: 'reference',
        trust: 'untrusted',
      }),
    ).toBeNull();
  });

  it('an ingested DevOps lab sheet saying "don\'t stay blocked" abstains (the 7 kw-blocker false positives)', () => {
    expect(
      classifyByRulesOnly({
        body: "TD part 01 - Docker - Devops\nCheckpoint: do a commit and call us to check your results (don't stay blocked).",
        candidateType: 'reference',
        trust: 'untrusted',
      }),
    ).toBeNull();
  });

  it('an ingested English "Score Report" abstains (the 1 kw-eval false positive)', () => {
    expect(
      classifyByRulesOnly({ body: 'Score Report — English proficiency.', candidateType: 'reference', trust: 'untrusted' }),
    ).toBeNull();
  });

  it('the SAME words still classify when the candidate comes from a mission (the 5 rules are untouched)', () => {
    expect(
      classifyByRulesOnly({ body: 'We learned that drizzle migrations are append-only.', candidateType: 'project', sourceKind: 'mission' }),
    ).toMatchObject({ register: 'learnings', rule: 'kw-learning' });
    expect(
      classifyByRulesOnly({ body: 'Blocked: mission ended blocked — needs follow-up.', candidateType: 'project', sourceKind: 'mission' }),
    ).toMatchObject({ register: 'blockers', rule: 'kw-blocker' });
    expect(
      classifyByRulesOnly({ body: 'Benchmark: FTS5 returns in 4ms on 10k docs.', candidateType: 'project', sourceKind: 'mission' }),
    ).toMatchObject({ register: 'evals', rule: 'kw-eval' });
  });

  it('an extractor trust stamp alone marks the body as ingested, whatever its type', () => {
    expect(classifyByRulesOnly({ body: 'We learned a useful pattern.', trust: 'untrusted' })).toBeNull();
    expect(classifyByRulesOnly({ body: 'We learned a useful pattern.', trust: 'trusted' })).toBeNull();
    expect(classifyByRulesOnly({ body: 'We learned a useful pattern.', trust: 'low' })).toBeNull();
  });

  it.each(['skill', 'pattern', 'repo', 'course'] as const)(
    'an intake of kind %s no longer routes to a register — the registers take no ingested material',
    (sourceKind) => {
      expect(classifyByRulesOnly({ body: '[intake] some third-party material.', sourceKind })).toBeNull();
    },
  );

  it('a human note keeps the mission table, so ADR 0004 §7 auto-file still works', () => {
    expect(
      classifyByRulesOnly({ body: 'TIL: eco mode halves prose tokens.', sourceKind: 'note', candidateType: 'project' }),
    ).toMatchObject({ register: 'learnings', rule: 'kw-learning' });
  });

  it('an explicit user tag still wins on an ingested body — the human escape hatch', () => {
    expect(
      classifyByRulesOnly({
        body: '| DEEP | LEARNING | MASTER |',
        candidateType: 'reference',
        trust: 'untrusted',
        userTag: { register: 'learnings', scope: 'global' },
      }),
    ).toMatchObject({ register: 'learnings', rule: 'user-tag' });
  });

  it('classifyCandidate abstains on an ingested body without burning a single LLM call', async () => {
    expect(
      await classifyCandidate(
        { body: '| DEEP | LEARNING | MASTER |', candidateType: 'reference', trust: 'untrusted' },
        { llm: neverCalled },
      ),
    ).toBeNull();
    expect(neverCalled).not.toHaveBeenCalled();
  });
});
