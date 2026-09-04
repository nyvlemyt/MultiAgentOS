// packages/memory/src/promote-candidates.ts
// P1-8 — the register side of promotion. `captureCandidates` files raw candidates into
// memory_candidates and the classifier stamps each one with a `<register>/<scope> (rule:…)`
// decision, but NOTHING ever consumed those decisions: `promoteCandidate` (registers.ts) had no
// batch caller, so `data/memory/<projectId>/{decisions,learnings,blockers,journal,evals}.md` were
// all still empty while 51 classified rows sat pending in the DB.
//
// This module is that missing caller: read the pending rows, keep only the ones whose decision
// resolves to a REAL register (an `abstain` or a `capture_failed` decision is human-triage work,
// never an automatic file), and hand each to promoteCandidate — which appends through the Memory
// Keeper write-lock (CLAUDE.md §8) and flips the row to `accepted`, making a re-run idempotent.
// `dryRun` previews the exact same routing without a single write.
import { eq } from 'drizzle-orm';
import { memoryCandidates, type getDb } from '@mas/db';
import { GLOBAL_PROJECT, promoteCandidate, type MemoryStore, type RegisterKind } from './registers';
import type { MemoryScope } from './retriever';

type Db = ReturnType<typeof getDb>;

const REGISTERS: ReadonlySet<string> = new Set<RegisterKind>(['decisions', 'learnings', 'blockers', 'journal', 'evals']);
const SCOPES: ReadonlySet<string> = new Set<MemoryScope>(['project', 'global']);

export interface ParsedDecision {
  register: RegisterKind;
  scope: MemoryScope;
}

/**
 * Read a stored classifier decision back into its routing pair. The stored form is
 * `<register>/<scope> (rule:<name>)` — the rule annotation is telemetry and is ignored here.
 * Anything else (`abstain — needs human triage`, `capture_failed: …`, an unknown register or
 * scope) returns null: an unroutable decision is human-triage work, never a silent default.
 */
export function parseClassifierDecision(decision: string | null | undefined): ParsedDecision | null {
  if (!decision) return null;
  const head = decision.split(' ')[0] ?? '';
  const [register, scope] = head.split('/');
  if (!register || !scope) return null;
  if (!REGISTERS.has(register) || !SCOPES.has(scope)) return null;
  return { register: register as RegisterKind, scope: scope as MemoryScope };
}

/** Marker the matière pipeline posts on a child doc — never a title. */
const PART_OF_MARKER = /<!--\s*part_of:[^>]*-->/g;
const NO_TITLE = '(sans titre)';

/**
 * A human-readable title for a register entry. registers.ts `deriveTitle` takes the raw first line,
 * which on an ingested course doc is the pipeline's `<!-- part_of: … -->` marker — 51 register
 * entries titled with an HTML comment is not a real register. This skips the marker and any
 * blank/punctuation-only line, and strips a leading markdown heading marker.
 */
export function candidateTitle(body: string): string {
  const clean = body.replace(PART_OF_MARKER, '');
  for (const line of clean.split('\n')) {
    const text = line.replace(/^#{1,6}\s+/, '').trim();
    if ((text.match(/\p{L}|\p{N}/gu) ?? []).length >= 3) return text.slice(0, 80);
  }
  return NO_TITLE;
}

export interface CandidatePromotion {
  id: string;
  register: RegisterKind;
  projectId: string;
  /** Register entry id minted by the store (LRN-001, BLK-002, …). '(dry-run)' when previewing. */
  entryId: string;
  title: string;
}

export interface CandidateSkip {
  id: string;
  reason: string;
}

export interface CandidatesRunResult {
  promoted: CandidatePromotion[];
  /** Rows deliberately left pending (unroutable decision, or a project scope with no projectId). */
  skipped: CandidateSkip[];
  /** Rows that failed to write — visible, never silent. */
  failed: CandidateSkip[];
  /** Routable rows not reached because of `limit`. */
  remaining: number;
  dryRun: boolean;
}

export interface PromoteCandidatesOpts {
  /** Preview the routing without writing a register or touching a row. */
  dryRun?: boolean;
  /** Stop after this many promotions. */
  limit?: number;
  /** Target project for `scope=project` decisions. Without it, those rows are skipped, not guessed. */
  projectId?: string;
}

const DRY_RUN_ENTRY = '(dry-run)';

interface RoutableRow {
  id: string;
  body: string;
  target: ParsedDecision;
}

/** Split the pending rows into the routable ones and the deliberately-left-pending ones. */
function triage(
  rows: Array<{ id: string; body: string; classifierDecision: string | null }>,
  opts: PromoteCandidatesOpts,
  skipped: CandidateSkip[],
): RoutableRow[] {
  const routable: RoutableRow[] = [];
  for (const row of rows) {
    const target = parseClassifierDecision(row.classifierDecision);
    if (!target) {
      skipped.push({ id: row.id, reason: `decision not routable to a register: '${row.classifierDecision ?? '(none)'}'` });
    } else if (target.scope === 'project' && !opts.projectId) {
      skipped.push({ id: row.id, reason: 'scope=project needs an explicit projectId — not guessed' });
    } else {
      routable.push({ id: row.id, body: row.body, target });
    }
  }
  return routable;
}

/**
 * Promote every pending candidate whose classifier decision resolves to a register. Global-scope
 * decisions land in `_global`; project-scope decisions need an explicit `projectId` (guessing one
 * would file a memory into the wrong project's register). One row's write failure is recorded and
 * the run continues.
 */
export async function promoteClassifiedCandidates(
  db: Db,
  store: MemoryStore,
  opts: PromoteCandidatesOpts,
): Promise<CandidatesRunResult> {
  const res: CandidatesRunResult = { promoted: [], skipped: [], failed: [], remaining: 0, dryRun: opts.dryRun === true };
  const rows = await db.select().from(memoryCandidates).where(eq(memoryCandidates.status, 'pending'));
  const routable = triage(rows, opts, res.skipped);

  for (let i = 0; i < routable.length; i++) {
    if (opts.limit !== undefined && res.promoted.length >= opts.limit) {
      res.remaining = routable.length - i;
      return res;
    }
    const { id, body, target } = routable[i]!;
    const projectId = target.scope === 'global' ? GLOBAL_PROJECT : opts.projectId!;
    const title = candidateTitle(body);
    if (res.dryRun) {
      res.promoted.push({ id, register: target.register, projectId, entryId: DRY_RUN_ENTRY, title });
      continue;
    }
    try {
      const entry = await promoteCandidate(db, id, { projectId, kind: target.register, title }, store);
      res.promoted.push({ id, register: target.register, projectId, entryId: entry.id, title });
    } catch (e) {
      res.failed.push({ id, reason: (e as Error).message });
    }
  }
  return res;
}

/** Count promotions per register, for the summary line. */
function byRegister(promoted: CandidatePromotion[]): string {
  const counts = new Map<string, number>();
  for (const p of promoted) counts.set(p.register, (counts.get(p.register) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([k, n]) => `${k}=${n}`).join(' ');
}

export function formatCandidatesSummary(res: CandidatesRunResult): string {
  const prefix = res.dryRun ? '[mas promote --candidates · DRY-RUN]' : '[mas promote --candidates]';
  const spread = res.promoted.length > 0 ? ` (${byRegister(res.promoted)})` : '';
  const head =
    `${prefix} ${res.promoted.length} promoted${spread}, ` +
    `${res.skipped.length} skipped, ${res.failed.length} failed.` +
    (res.remaining > 0 ? ` Stopped on --limit, ${res.remaining} remaining.` : '');
  // A dry run that only prints counts cannot be reviewed, so it lists each routing. A real run
  // stays quiet: the register files themselves are the record.
  const preview = res.dryRun
    ? res.promoted.map((p) => `  ${p.projectId}/${p.register}  ${p.title}`)
    : [];
  return [head, ...preview, ...res.failed.map((f) => `  FAIL ${f.id} — ${f.reason}`)].join('\n');
}
