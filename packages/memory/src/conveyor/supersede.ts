// Keyed supersede write-path planning (ADR 0008 clauses 4–5, design spec §5 Brique 6).
// Append-only promotion would mint a duplicate active fiche on every re-ingest of an updated
// source. v1 ships the `source_key`-keyed plan: match the live (active) fiche on source_key →
// flip it to `superseded` + set `superseded_by` + append one consolidation-log line. An id-bearing
// entry is NEVER hard-deleted. These are the PURE planning halves; the on-disk applier (DB flip +
// log append in registers.ts) bolts onto them once a real fiche store + promote flow lands.
import { isLegalTransition } from '../fiche';

export interface ExistingFiche {
  id: string;
  source_key: string;
  lifecycle: string;
  lane?: string;
}

export interface IncomingFiche {
  id: string;
  source_key: string;
  lane?: string;
}

export interface SupersedePlan {
  supersededId: string;
  supersededBy: string;
  /** One line for docs/knowledge/consolidation-log.md: `<date> | supersede | ids=… | lane=… | keeper=… | note=…`. */
  logLine: string;
}

/**
 * Plan a supersede if a currently-active fiche shares the incoming source_key. Returns null for a
 * fresh ADD (no active match), for a self-match (no cycle), or when the only matches are not active
 * (only `active → superseded` is a legal transition). `date` is injected (pure, deterministic).
 */
export function planSupersede(
  existing: ExistingFiche[],
  incoming: IncomingFiche,
  opts: { date: string; keeper: string },
): SupersedePlan | null {
  const target = existing.find(
    (f) => f.source_key === incoming.source_key && f.lifecycle === 'active' && f.id !== incoming.id,
  );
  if (!target) return null;

  const lane = incoming.lane ?? target.lane ?? '?';
  const logLine =
    `${opts.date} | supersede | ids=${target.id},${incoming.id} | lane=${lane} | ` +
    `keeper=${opts.keeper} | note=re-ingest of ${incoming.source_key}`;

  return { supersededId: target.id, supersededBy: incoming.id, logLine };
}

/**
 * Frontmatter transform: flip lifecycle to `superseded` and set `superseded_by`. Guarded by the
 * closed legal-transition table — throws if the current lifecycle cannot legally reach `superseded`.
 * Returns a new object (never mutates the input).
 */
export function markSuperseded(
  frontmatter: Record<string, unknown>,
  supersededBy: string,
): Record<string, unknown> {
  const from = String(frontmatter.lifecycle ?? '');
  if (!isLegalTransition(from, 'superseded')) {
    throw new Error(`illegal lifecycle transition: ${from} → superseded`);
  }
  return { ...frontmatter, lifecycle: 'superseded', superseded_by: supersededBy };
}
