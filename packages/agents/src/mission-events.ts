import { randomUUID } from 'node:crypto';
import { and, desc, eq, gte } from 'drizzle-orm';
import { getDb, events } from '@mas/db';

export type Db = ReturnType<typeof getDb>;

// Quota-window TTL — must match RouterLLMClient's default (5 h subscription
// window). Hoisted to one literal (S1192).
const WINDOW_TTL_MS = 5 * 60 * 60 * 1000;

export function logEvent(db: Db, evt: {
  missionId?: string;
  taskId?: string;
  agentId?: string;
  type: string;
  payload?: unknown;
  tokensIn?: number;
  tokensOut?: number;
  cacheRead?: number;
  cacheCreation?: number;
  quotaUnits?: number;
  risk?: 'low' | 'medium' | 'high' | 'blocking';
}) {
  return db.insert(events).values({
    id: `evt_${randomUUID()}`,
    missionId: evt.missionId,
    taskId: evt.taskId,
    agentId: evt.agentId,
    type: evt.type,
    payloadJson: JSON.stringify(evt.payload ?? {}),
    tokensIn: evt.tokensIn ?? 0,
    tokensOut: evt.tokensOut ?? 0,
    cacheRead: evt.cacheRead ?? 0,
    cacheCreation: evt.cacheCreation ?? 0,
    quotaUnits: evt.quotaUnits ?? 0,
    risk: evt.risk ?? 'low',
    createdAt: new Date(),
  });
}

// Router fallback events fire inside a synchronous onRouterEvent callback, so
// the logEvent insert cannot be awaited. Swallow rejections explicitly rather
// than leaving a floating promise (telemetry must never fail a mission).
export function logEventDetached(db: Db, evt: Parameters<typeof logEvent>[1]): void {
  logEvent(db, evt).then(undefined, () => undefined);
}

// Read a finished task's producer output (the `last_message`) from its task_done
// event payload — prompt chaining (plan §2.9), no schema migration. Newest first.
export async function lastMessageFor(db: Db, taskId: string): Promise<string> {
  const [row] = await db
    .select({ payloadJson: events.payloadJson })
    .from(events)
    .where(and(eq(events.taskId, taskId), eq(events.type, 'task_done')))
    .orderBy(desc(events.createdAt))
    .limit(1);
  if (!row) return '';
  const payload = JSON.parse(row.payloadJson) as { lastMessage?: string };
  return payload.lastMessage ?? '';
}

// Restore the router's quota-window block map from persisted `window_blocked`
// events (5b). Without this, selectLLM builds a fresh router per call/restart and
// retries a just-blocked source (one wasted 429). Newest-first so the first row
// seen per source wins (its latest blockedAt). Time-dependent → explicit `now`.
export async function loadBlockedWindows(
  db: Db,
  now: Date,
  ttlMs = WINDOW_TTL_MS,
): Promise<Record<string, number>> {
  const since = new Date(now.getTime() - ttlMs);
  const rows = await db
    .select({ payloadJson: events.payloadJson })
    .from(events)
    .where(and(eq(events.type, 'window_blocked'), gte(events.createdAt, since)))
    .orderBy(desc(events.createdAt));

  const blocked: Record<string, number> = {};
  for (const { payloadJson } of rows) {
    const { source, blockedAt } = JSON.parse(payloadJson) as { source: string; blockedAt: number };
    blocked[source] ??= blockedAt;
  }
  return blocked;
}
