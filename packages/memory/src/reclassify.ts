// packages/memory/src/reclassify.ts
// Withdraws the register decisions the provenance gate no longer stands behind.
//
// The gate in classifier.ts fixes every FUTURE capture, but 51 decisions were already stamped into
// memory_candidates.classifier_decision by the June keyword table before the frontier existed
// (docs/backlog/classifieur-faux-positifs-cours.md). A stored decision is data, and
// promoteClassifiedCandidates executes it faithfully — "il lit la décision, il ne la fabrique
// pas" — so leaving those 51 in place would file 51 course documents into the registers no matter
// how correct the classifier now is. This pass is the repair, in the shape the repo already uses
// for durable-value repairs (cf. provenance-backfill-cli.ts): a pure decision function, an
// idempotent batch, a --dry-run, and nothing silent.
//
// Two passes, deliberately separable — one is cosmetic, the other is a lifecycle decision:
//   reclassifyPendingCandidates  withdraws an out-of-domain decision (reversible, no status change);
//   rejectIngestedCandidates     closes the row, because no ingested document is register material.
// Neither ever invents a register.
import { eq } from 'drizzle-orm';
import { memoryCandidates, type getDb } from '@mas/db';
import { INGESTED_ABSTAIN, isIngestedProvenance, type ClassifierInput } from './classifier';
import { parseClassifierDecision } from './promote-candidates';
import type { CandidateSourceKind, CandidateType } from './capture';
import type { Trust } from './conveyor/extractor';

type Db = ReturnType<typeof getDb>;

/** The provenance columns of one candidate row, as SQLite hands them back (nulls, not undefined). */
export interface StoredCandidate {
  id: string;
  type: CandidateType;
  sourceKind: string | null;
  trust: Trust | null;
  classifierDecision: string | null;
}

/** A decision the user made by hand. A human who tagged a document outranks the gate. */
const USER_TAG_RULE = 'rule:user-tag';

/**
 * Rebuild the classifier's provenance view of a stored row. `null` becomes `undefined` on purpose:
 * the gate reads `trust !== undefined`, so passing SQLite's null straight through would read a
 * ritual row (trust null) as conveyor output and withdraw every mission decision too.
 */
function provenanceOf(row: StoredCandidate): ClassifierInput {
  const input: ClassifierInput = { body: '', candidateType: row.type };
  if (row.trust !== null) input.trust = row.trust;
  if (row.sourceKind !== null) input.sourceKind = row.sourceKind as CandidateSourceKind;
  return input;
}

/**
 * The decision that should replace this row's stored one, or null to leave it alone. Pure.
 *
 * Withdraws exactly when all three hold: the stored decision routes to a register, it was not made
 * by an explicit human tag, and the row's own provenance is ingested. Anything else is already
 * either correct or already in triage — which makes a re-run a no-op.
 */
export function revokedDecision(row: StoredCandidate): string | null {
  const decision = row.classifierDecision;
  if (!parseClassifierDecision(decision)) return null;
  if (decision!.includes(USER_TAG_RULE)) return null;
  if (!isIngestedProvenance(provenanceOf(row))) return null;
  return INGESTED_ABSTAIN;
}

export interface ReclassifyChange {
  id: string;
  from: string;
  to: string;
}

export interface ReclassifySummary {
  /** Pending rows examined. */
  scanned: number;
  /** Decisions withdrawn this run (empty on a replay — idempotence). */
  revoked: ReclassifyChange[];
  untouched: number;
  dryRun: boolean;
}

/**
 * Withdraw every out-of-domain decision on the PENDING rows. Accepted rows are deliberately out of
 * scope: their content is already in a register file, so the repair there is a rollback of the
 * register, not a rewrite of a triage column.
 */
export async function reclassifyPendingCandidates(
  db: Db,
  opts: { dryRun?: boolean },
): Promise<ReclassifySummary> {
  const rows = await db.select().from(memoryCandidates).where(eq(memoryCandidates.status, 'pending'));
  const res: ReclassifySummary = { scanned: rows.length, revoked: [], untouched: 0, dryRun: opts.dryRun === true };

  for (const row of rows) {
    const to = revokedDecision(row);
    if (to === null) {
      res.untouched++;
      continue;
    }
    res.revoked.push({ id: row.id, from: row.classifierDecision!, to });
    if (!res.dryRun) {
      await db.update(memoryCandidates).set({ classifierDecision: to }).where(eq(memoryCandidates.id, row.id));
    }
  }
  return res;
}

/** Group the withdrawals by the rule that had made them, so the pass reads as a diagnosis. */
function byFrom(revoked: ReclassifyChange[]): string[] {
  const counts = new Map<string, number>();
  for (const r of revoked) counts.set(r.from, (counts.get(r.from) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([from, n]) => `  ${String(n).padStart(3)} × ${from}`);
}

export function formatReclassifySummary(res: ReclassifySummary): string {
  const prefix = res.dryRun ? '[mas reclassify · DRY-RUN]' : '[mas reclassify]';
  const head =
    `${prefix} ${res.scanned} scanned, ${res.revoked.length} withdrawn, ${res.untouched} untouched.`;
  return [head, ...byFrom(res.revoked)].join('\n');
}

/**
 * Why a closed row was closed. Not an abstain: withdrawing a decision leaves a question open, but
 * the ADR answered it — the registers take no ingested material (ADR 0004 §5, amendement
 * 2026-09-07). Keeping such a row `pending` would claim a human decision is still owed, and 379 of
 * them turn the Memory Center inbox from a signal into permanent noise.
 *
 * `rejected` closes the row as a REGISTER candidate only. The document itself is untouched: it
 * lives in docs/knowledge + the études mirror and stays searchable (mem:eval covers it). The status
 * is one UPDATE away from reversible, and the conveyor's source_key dedup still matches a rejected
 * row — so closing these cannot trigger a re-ingestion loop.
 */
export const INGESTED_REJECTED =
  'rejected — ingested source: not register material; lives in the fiche/études path';

/**
 * True when the row is not a register candidate at all. Pure. Same escape hatch as the withdrawal:
 * an explicitly human-tagged row is genuinely awaiting a promotion, so it stays in the inbox.
 */
export function rejectableAsIngested(row: StoredCandidate): boolean {
  if (row.classifierDecision?.includes(USER_TAG_RULE)) return false;
  return isIngestedProvenance(provenanceOf(row));
}

export interface RejectSummary {
  /** Pending rows examined. */
  scanned: number;
  /** Ids closed this run (empty on a replay — idempotence). */
  rejected: string[];
  /** Rows deliberately left pending (mission provenance, or a human tag). */
  kept: number;
  dryRun: boolean;
}

/** Close every ingested pending row, recording INGESTED_REJECTED as the reason on the row itself. */
export async function rejectIngestedCandidates(
  db: Db,
  opts: { dryRun?: boolean },
): Promise<RejectSummary> {
  const rows = await db.select().from(memoryCandidates).where(eq(memoryCandidates.status, 'pending'));
  const res: RejectSummary = { scanned: rows.length, rejected: [], kept: 0, dryRun: opts.dryRun === true };

  for (const row of rows) {
    if (!rejectableAsIngested(row)) {
      res.kept++;
      continue;
    }
    res.rejected.push(row.id);
    if (!res.dryRun) {
      await db
        .update(memoryCandidates)
        .set({ status: 'rejected', classifierDecision: INGESTED_REJECTED })
        .where(eq(memoryCandidates.id, row.id));
    }
  }
  return res;
}

export function formatRejectSummary(res: RejectSummary): string {
  const prefix = res.dryRun ? '[mas reclassify --reject · DRY-RUN]' : '[mas reclassify --reject]';
  return (
    `${prefix} ${res.scanned} scanned, ${res.rejected.length} closed as non-register material, ` +
    `${res.kept} kept pending.`
  );
}
