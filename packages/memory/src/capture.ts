import { randomUUID } from 'node:crypto';
import { and, eq, ne } from 'drizzle-orm';
import { memoryCandidates, type getDb } from '@mas/db';
import { admit, deadLetterReason, type DeadLetterCause } from './conveyor/admission';
import type { Trust } from './conveyor/extractor';

type Db = ReturnType<typeof getDb>;

/**
 * CAPTURE MECHANISM — chosen Phase 4 (recorded as BDR, see CAPTURE_DECISION).
 *
 * The close-out ritual (project-doctrine 5-min / 3-questions) is the primary
 * capture path: explicit, ZERO-LLM, §11-safe by construction. agentmemory's
 * Claude Code hooks (SessionStart/PostToolUse/Stop) are deferred to 4.x as an
 * optional auto-capture source feeding this same `captureCandidates` seam.
 * mem0 ADD-only was rejected: its default OpenAI embeddings → PAYG → §11.
 */
export const CAPTURE_DECISION =
  'Capture = close-out ritual (zero-LLM, §11-safe). agentmemory hooks deferred to 4.x ' +
  'behind the same captureCandidates() API. mem0 ADD-only rejected (OpenAI embeddings → PAYG, §11).';

export type CandidateType = 'user' | 'feedback' | 'project' | 'reference';

export interface CaptureCandidate {
  type: CandidateType;
  body: string;
  /** Intake provenance (Phase 4.5) — 'mission' for ritual captures. */
  sourceKind?: 'note' | 'skill' | 'pattern' | 'repo' | 'course' | 'mission';
  dossierPath?: string;
  /** Brique 6 deltas — supersede/dedup match key + the untrusted-never-auto-promote security tag. */
  sourceKey?: string;
  trust?: Trust;
  /** Admission SAS inputs (capture-contract §a). Defaults derived from type + sourceKind when omitted. */
  title?: string;
  summary?: string;
  sourceResolvable?: boolean;
  signals?: string[];
  /** Dead-letter marker (capture-contract §b): extraction/processing failed → capture_failed, not silent drop. */
  captureFailed?: { cause: DeadLetterCause; detail?: string };
  /** Classifier decision (`register/scope (rule:…)` or `abstain — …`). Persisted on pending rows. */
  classifierDecision?: string;
}

/** Structured outcome of the one door — the data shape the cockpit Inbox (Brique 5) renders. */
export interface CaptureResult {
  /** Ids of `pending` rows written (admitted candidates). */
  pending: string[];
  /** Ids of `capture_failed` rows written (dead-lettered — visible + relaunchable, never silent). */
  failed: string[];
  /** Candidates rejected at the door by the SAS (zero-signal junk — never persisted). */
  rejected: { reason: string; body: string }[];
  /**
   * Ids of already-known rows a candidate matched by source_key and was therefore skipped
   * (capture-contract §idempotence). The skip is visible here, never a silent drop — re-capturing
   * the datalake is replayable without spawning duplicate candidates.
   */
  duplicate: string[];
}

function deriveSignals(it: CaptureCandidate): string[] {
  if (it.signals) return it.signals;
  const out: string[] = [it.type];
  if (it.sourceKind) out.push(it.sourceKind);
  return out;
}

/**
 * Anti-duplicate guard (capture-contract §idempotence). A source_key already seen — in this batch or
 * as a non-dead-lettered row — means "already captured": return the existing id so the caller records
 * a visible skip. A `capture_failed` row is deliberately NOT a match: a past failure must never block
 * a retry. Returns null when the key is new.
 */
async function findDuplicateId(
  db: Db,
  sourceKey: string,
  seenInBatch: Map<string, string>,
): Promise<string | null> {
  const inBatch = seenInBatch.get(sourceKey);
  if (inBatch) return inBatch;
  const [existing] = await db
    .select({ id: memoryCandidates.id })
    .from(memoryCandidates)
    .where(and(eq(memoryCandidates.sourceKey, sourceKey), ne(memoryCandidates.status, 'capture_failed')))
    .limit(1);
  return existing?.id ?? null;
}

type InsertRow = typeof memoryCandidates.$inferInsert;

/** Where the one door sends a single candidate — a row to write, a visible skip, or a door rejection. */
type Routed =
  | { kind: 'row'; row: InsertRow; bucket: 'pending' | 'failed' }
  | { kind: 'rejected'; reason: string; body: string }
  | { kind: 'duplicate'; id: string };

/**
 * The per-candidate policy: dead-letter (always written) → SAS admission → anti-duplicate guard →
 * pending. Order is load-bearing: a `capture_failed` row is written before the dedup check so a past
 * failure never blocks a retry, and junk rejected at the door is never dedup-checked.
 */
async function routeCandidate(
  db: Db,
  base: InsertRow,
  it: CaptureCandidate,
  seenKeys: Map<string, string>,
): Promise<Routed> {
  if (it.captureFailed) {
    const reason = deadLetterReason(it.captureFailed.cause, it.captureFailed.detail);
    return { kind: 'row', row: { ...base, status: 'capture_failed', classifierDecision: reason }, bucket: 'failed' };
  }
  const verdict = admit({
    body: it.body,
    title: it.title,
    summary: it.summary,
    sourceResolvable: it.sourceResolvable,
    signals: deriveSignals(it),
  });
  if (!verdict.ok) return { kind: 'rejected', reason: verdict.reason, body: it.body };
  if (it.sourceKey) {
    const dupId = await findDuplicateId(db, it.sourceKey, seenKeys);
    if (dupId) return { kind: 'duplicate', id: dupId };
    seenKeys.set(it.sourceKey, base.id!);
  }
  return { kind: 'row', row: { ...base, status: 'pending', classifierDecision: it.classifierDecision }, bucket: 'pending' };
}

/**
 * The single capture seam. Every gate (ritual, drop-folder, CLI, and future URL/upload/chat) calls
 * through here, so the Admission SAS (zero-signal junk never becomes pending) and the dead-letter
 * path (failures surface as capture_failed, never a silent disappearance) are a property of the
 * door, not of who knocks (capture-contract §"Why the SAS + dead-letter live inside the callee").
 */
export async function captureCandidates(
  db: Db,
  sourceTaskId: string | null,
  items: CaptureCandidate[],
): Promise<CaptureResult> {
  const result: CaptureResult = { pending: [], failed: [], rejected: [], duplicate: [] };
  if (items.length === 0) return result;

  const rows: InsertRow[] = [];
  const seenKeys = new Map<string, string>(); // source_key → id of the row queued for it this batch
  for (const it of items) {
    const base: InsertRow = {
      id: `cand_${randomUUID()}`,
      sourceTaskId,
      type: it.type,
      body: it.body,
      sourceKind: it.sourceKind,
      dossierPath: it.dossierPath,
      sourceKey: it.sourceKey,
      trust: it.trust,
      createdAt: new Date(),
    };
    const routed = await routeCandidate(db, base, it, seenKeys);
    if (routed.kind === 'rejected') result.rejected.push({ reason: routed.reason, body: routed.body });
    else if (routed.kind === 'duplicate') result.duplicate.push(routed.id);
    else {
      rows.push(routed.row);
      result[routed.bucket].push(base.id!);
    }
  }

  if (rows.length > 0) await db.insert(memoryCandidates).values(rows);
  return result;
}
