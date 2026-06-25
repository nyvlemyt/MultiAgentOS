/**
 * Reciprocal Rank Fusion — merge several heterogeneous ranked id-lists into one
 * robust order without any LLM. Score(id) = Σ 1/(c + rank_i) over every list the
 * id appears in (rank is 0-based). Higher score = better.
 *
 * Pattern from agentmemory (BM25+vector+graph via RRF, 95.2 % R@5), cited in
 * docs/knowledge/memory-patterns.md. Pure, deterministic, fully unit-testable:
 * ties are broken by id ascending so the output never depends on input order.
 *
 * @param lists ranked id-lists, best-first (e.g. [tagScoreIds, semanticIds]).
 * @param c rank-fusion constant (default 60, the canonical RRF value).
 */
export function rrfFuse(lists: readonly (readonly string[])[], c = 60): string[] {
  const scores = new Map<string, number>();
  for (const list of lists) {
    for (let rank = 0; rank < list.length; rank++) {
      const id = list[rank]!;
      scores.set(id, (scores.get(id) ?? 0) + 1 / (c + rank));
    }
  }
  return [...scores.keys()].sort((a, b) => {
    const diff = scores.get(b)! - scores.get(a)!;
    return diff !== 0 ? diff : a.localeCompare(b);
  });
}
