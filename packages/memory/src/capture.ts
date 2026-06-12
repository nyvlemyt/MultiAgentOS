import { randomUUID } from 'node:crypto';
import { memoryCandidates, type getDb } from '@mas/db';

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
}

/**
 * Write ritual-produced candidates into the memory_candidates inbox (status=pending).
 * These await Memory Keeper triage on the /memory page before promotion to a register.
 */
export async function captureCandidates(
  db: Db,
  sourceTaskId: string | null,
  items: CaptureCandidate[],
): Promise<string[]> {
  if (items.length === 0) return [];
  const rows = items.map((it) => ({
    id: `cand_${randomUUID()}`,
    sourceTaskId,
    type: it.type,
    body: it.body,
    status: 'pending' as const,
    createdAt: new Date(),
  }));
  await db.insert(memoryCandidates).values(rows);
  return rows.map((r) => r.id);
}
