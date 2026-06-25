import type { MemoryQueryOpts, MemoryRetriever, MemoryScope } from './retriever';

/**
 * Retrieval evaluation harness (Phase 9 · 0a renforcée, principle 7). A frozen set
 * of golden queries → expected documents, replayed whenever the engine or the
 * collections change, so FTS→QMD (and arsenal growth) evolve WITHOUT silent
 * regression. A query passes when any of the top-k hits matches an `expect`
 * substring (against id, source, or title). Semantic queries (paraphrase, no
 * keyword overlap) are only meaningful on the QMD backend — they are skipped (not
 * failed) on `fts` so the CI harness stays green without the ~4.4 GB models.
 */

export interface GoldenQuery {
  id: string;
  query: string;
  /** Pass if any top-k hit's id|source|title contains ANY of these substrings (case-insensitive). */
  expect: string[];
  /** Paraphrase with no keyword overlap — only asserted on the qmd backend. */
  semantic?: boolean;
  /** Targets a QMD-only collection (e.g. mas-arsenal, absent from the FTS fallback). */
  qmdOnly?: boolean;
  scope?: MemoryScope | 'all';
  projectId?: string;
  /**
   * Restrict to specific QMD collections — semantic KNOWLEDGE queries scope to
   * `['mas-knowledge']` so they prove paraphrase→knowledge-doc recall in isolation
   * (the exit criterion), not arsenal noise. Arsenal queries stay unscoped (harder).
   */
  collections?: string[];
  /** Top-k window (default 5). */
  k?: number;
  /**
   * Score floor: a row passes only if at least one *matching* hit also clears
   * this score. Guards against silent rank-collapse (a match still surfaces but
   * its confidence has cratered). Omitted ⇒ any matching hit passes (legacy).
   */
  minScore?: number;
}

export type EvalBackend = 'qmd' | 'fts';

export interface EvalCase {
  id: string;
  query: string;
  status: 'pass' | 'fail' | 'skip';
  topHits: string[];
}

export interface EvalReport {
  backend: EvalBackend;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  cases: EvalCase[];
  ok: boolean;
}

function hitMatches(hitKeys: string[], expect: string[]): boolean {
  const hay = hitKeys.join('\n').toLowerCase();
  return expect.some((e) => hay.includes(e.toLowerCase()));
}

export function runRetrievalEval(
  retriever: MemoryRetriever,
  queries: GoldenQuery[],
  backend: EvalBackend,
): EvalReport {
  const cases: EvalCase[] = [];
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  for (const g of queries) {
    if ((g.semantic || g.qmdOnly) && backend === 'fts') {
      cases.push({ id: g.id, query: g.query, status: 'skip', topHits: [] });
      skipped += 1;
      continue;
    }
    const k = g.k ?? 5;
    const opts: MemoryQueryOpts = {
      limit: k,
      scope: g.scope ?? 'all',
      projectId: g.projectId,
      collections: g.collections,
    };
    const hits = retriever.query(g.query, opts);
    const keys = hits.map((h) => `${h.id} ${h.source} ${h.title}`);
    const pass = hits.some(
      (h) =>
        hitMatches([h.id, h.source, h.title], g.expect) &&
        (g.minScore === undefined || h.score >= g.minScore),
    );
    cases.push({
      id: g.id,
      query: g.query,
      status: pass ? 'pass' : 'fail',
      topHits: keys.slice(0, k),
    });
    if (pass) passed += 1;
    else failed += 1;
  }

  return { backend, total: queries.length, passed, failed, skipped, cases, ok: failed === 0 };
}

/** Marker glyph per eval status (extracted — no nested ternary, typescript:S3358). */
function statusMark(status: EvalCase['status']): string {
  if (status === 'pass') return '✓';
  if (status === 'skip') return '·';
  return '✗';
}

/** One-line-per-case report for CLI/CI logs. */
export function formatEvalReport(r: EvalReport): string {
  const lines = [`Retrieval eval [${r.backend}]: ${r.passed} pass, ${r.failed} fail, ${r.skipped} skip`];
  for (const c of r.cases) {
    const mark = statusMark(c.status);
    lines.push(`  ${mark} ${c.id}: "${c.query}"`);
    if (c.status === 'fail') lines.push(`      top: ${c.topHits.join(' | ') || '(none)'}`);
  }
  return lines.join('\n');
}
