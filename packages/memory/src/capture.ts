import { randomUUID } from 'node:crypto';
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
}

/** Structured outcome of the one door — the data shape the cockpit Inbox (Brique 5) renders. */
export interface CaptureResult {
  /** Ids of `pending` rows written (admitted candidates). */
  pending: string[];
  /** Ids of `capture_failed` rows written (dead-lettered — visible + relaunchable, never silent). */
  failed: string[];
  /** Candidates rejected at the door by the SAS (zero-signal junk — never persisted). */
  rejected: { reason: string; body: string }[];
}

function deriveSignals(it: CaptureCandidate): string[] {
  if (it.signals) return it.signals;
  const out: string[] = [it.type];
  if (it.sourceKind) out.push(it.sourceKind);
  return out;
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
  const result: CaptureResult = { pending: [], failed: [], rejected: [] };
  if (items.length === 0) return result;

  const rows: (typeof memoryCandidates.$inferInsert)[] = [];
  for (const it of items) {
    const base = {
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

    if (it.captureFailed) {
      const reason = deadLetterReason(it.captureFailed.cause, it.captureFailed.detail);
      rows.push({ ...base, status: 'capture_failed', classifierDecision: reason });
      result.failed.push(base.id);
      continue;
    }

    const verdict = admit({
      body: it.body,
      title: it.title,
      summary: it.summary,
      sourceResolvable: it.sourceResolvable,
      signals: deriveSignals(it),
    });
    if (!verdict.ok) {
      result.rejected.push({ reason: verdict.reason, body: it.body });
      continue;
    }

    rows.push({ ...base, status: 'pending' });
    result.pending.push(base.id);
  }

  if (rows.length > 0) await db.insert(memoryCandidates).values(rows);
  return result;
}
