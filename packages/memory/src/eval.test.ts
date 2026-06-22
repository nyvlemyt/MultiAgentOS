import { describe, it, expect } from 'vitest';
import { FtsRetriever, type MemoryDoc } from './retriever';
import { runRetrievalEval, formatEvalReport, type GoldenQuery } from './eval';

// A self-contained fixture corpus so the CI harness runs WITHOUT QMD's ~4.4 GB
// models. The semantic/arsenal golden set (golden-queries.json) is the local QMD
// proof; this test is the CI regression gate for the harness + FTS recall.
const corpus: MemoryDoc[] = [
  { id: '_global/KN-mem', scope: 'global', source: 'docs/knowledge/memory-patterns.md', title: 'memory-patterns', body: 'Three levels of memory: storage, recall, judgment. Close-out ritual avoids forgetting.' },
  { id: '_global/KN-tok', scope: 'global', source: 'docs/knowledge/token-strategy.md', title: 'token-strategy', body: 'Prompt caching and budget caps control token cost per request.' },
  { id: 'otakugo/BDR-001', scope: 'project', source: 'data/memory/otakugo/decisions.md', title: 'dark mode toggle', body: 'Chose a dark mode toggle on the settings page using shadcn.' },
  { id: 'webapp/BDR-001', scope: 'project', source: 'data/memory/webapp/decisions.md', title: 'auth flow', body: 'Webapp uses passwordless auth flow.' },
];

const golden: GoldenQuery[] = [
  { id: 'kw-memory', query: 'memory storage recall judgment', expect: ['memory-patterns'], scope: 'global' },
  { id: 'kw-token', query: 'token cost prompt caching', expect: ['token-strategy'], scope: 'global' },
  { id: 'proj-otakugo', query: 'dark mode toggle settings', expect: ['otakugo/'], scope: 'project', projectId: 'otakugo' },
  { id: 'sem-only', query: 'a paraphrase with no overlap', expect: ['nothing'], semantic: true },
];

function ftsOver(docs: MemoryDoc[]): FtsRetriever {
  const r = new FtsRetriever();
  r.index(docs);
  return r;
}

describe('runRetrievalEval (harness, principle 7)', () => {
  it('passes every keyword-fair golden query on the FTS backend', () => {
    const report = runRetrievalEval(ftsOver(corpus), golden, 'fts');
    expect(report.ok).toBe(true);
    expect(report.passed).toBe(3);
  });

  it('skips semantic queries on the FTS backend (not failed)', () => {
    const report = runRetrievalEval(ftsOver(corpus), golden, 'fts');
    expect(report.skipped).toBe(1);
    expect(report.cases.find((c) => c.id === 'sem-only')!.status).toBe('skip');
  });

  it('does not leak another project for a project-scoped golden query', () => {
    const report = runRetrievalEval(ftsOver(corpus), golden, 'fts');
    const proj = report.cases.find((c) => c.id === 'proj-otakugo')!;
    expect(proj.status).toBe('pass');
    expect(proj.topHits.every((h) => !h.includes('webapp/'))).toBe(true);
  });

  it('reports a failure when an expected doc is missing', () => {
    const bad: GoldenQuery[] = [{ id: 'miss', query: 'memory', expect: ['does-not-exist'], scope: 'global' }];
    const report = runRetrievalEval(ftsOver(corpus), bad, 'fts');
    expect(report.ok).toBe(false);
    expect(report.failed).toBe(1);
  });

  it('formats a one-line-per-case report', () => {
    const report = runRetrievalEval(ftsOver(corpus), golden, 'fts');
    const txt = formatEvalReport(report);
    expect(txt).toContain('Retrieval eval [fts]');
    expect(txt).toContain('kw-memory');
  });
});
