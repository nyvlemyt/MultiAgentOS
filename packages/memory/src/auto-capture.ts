import { randomUUID } from 'node:crypto';
import { and, eq, inArray } from 'drizzle-orm';
import { events, missions, tasks, validations, type getDb } from '@mas/db';
import { captureCandidates, type CaptureCandidate } from './capture';

type Db = ReturnType<typeof getDb>;

export const AUTO_CAPTURE_EVENT = 'auto_capture_fired';

export interface RitualResult {
  skipped: boolean;
  candidateIds: string[];
}

/**
 * Close-out ritual, auto-fired at mission end (ADR 0004 §1). Zero-LLM:
 * candidates derive deterministically from mission/tasks/validations rows and
 * land in memory_candidates (pending) via the captureCandidates() seam — the
 * Memory Keeper write-lock (§8) is untouched; no register is written here.
 * Idempotent: the AUTO_CAPTURE_EVENT row is the replay guard.
 */
export async function runCloseOutRitual(db: Db, missionId: string): Promise<RitualResult> {
  const skipped: RitualResult = { skipped: true, candidateIds: [] };

  const [m] = await db.select().from(missions).where(eq(missions.id, missionId));
  if (!m) return skipped;
  if (m.status !== 'validated' && m.status !== 'blocked' && m.status !== 'archived') {
    return skipped;
  }

  const fired = await db
    .select({ id: events.id })
    .from(events)
    .where(and(eq(events.missionId, missionId), eq(events.type, AUTO_CAPTURE_EVENT)));
  if (fired.length > 0) return skipped;

  const all = await db.select().from(tasks).where(eq(tasks.missionId, missionId));
  const anchor = [...all]
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .at(-1);
  if (!anchor) return skipped;

  const items: CaptureCandidate[] = [];
  const done = all.filter((t) => t.status === 'done').length;
  items.push({
    type: 'project',
    sourceKind: 'mission',
    body: `Mission "${m.title}" ${m.status}: ${done}/${all.length} tasks done, ${m.spentTokens ?? 0} tokens spent.`,
  });

  const decided = await db
    .select()
    .from(validations)
    .where(inArray(validations.taskId, all.map((t) => t.id)));
  for (const v of decided) {
    if (v.status === 'approved' || v.status === 'rejected') {
      items.push({ type: 'project', sourceKind: 'mission', body: `Decided: ${v.status} — ${v.actionSummary}.` });
    }
  }

  if (m.status === 'blocked') {
    items.push({ type: 'project', sourceKind: 'mission', body: `Blocked: mission "${m.title}" ended blocked — needs follow-up.` });
  }

  const { pending: candidateIds } = await captureCandidates(db, anchor.id, items);
  await db.insert(events).values({
    id: `evt_${randomUUID()}`,
    missionId,
    taskId: anchor.id,
    type: AUTO_CAPTURE_EVENT,
    payloadJson: JSON.stringify({ candidates: candidateIds.length }),
    createdAt: new Date(),
  });
  return { skipped: false, candidateIds };
}
