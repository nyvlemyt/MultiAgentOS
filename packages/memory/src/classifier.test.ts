import { describe, it, expect, vi } from 'vitest';
import { classifyCandidate } from './classifier';

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
      expect(d.register).toBe(register);
      expect(d.method).toBe('rule');
    }
    expect(llm).not.toHaveBeenCalled();
  });

  it('source kind skill/pattern → learnings without LLM; repo/course scope to global', async () => {
    const llm = vi.fn(neverLLM);
    const skill = await classifyCandidate(
      { body: '[intake:skill] caveman — compress prose.', sourceKind: 'skill', projectId: 'proj' },
      { llm },
    );
    expect(skill).toMatchObject({ register: 'learnings', method: 'rule' });
    const repo = await classifyCandidate(
      { body: '[intake:repo] qmd — BM25+vector retriever.', sourceKind: 'repo' },
      { llm },
    );
    expect(repo).toMatchObject({ register: 'learnings', scope: 'global', method: 'rule' });
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
    expect(fb.scope).toBe('global');
    const noProj = await classifyCandidate({ body: 'Decided: X.' }, { llm });
    expect(noProj.scope).toBe('global');
  });
});
