import { randomUUID } from 'node:crypto';
import { getDb } from '@mas/db/client';
import { events, tasks } from '@mas/db/schema';
import { bus, type WorkerEvent } from './sse-bus.js';
import { eq } from 'drizzle-orm';

const TICK_MS = 5_000;
const POLL_MS = 2_000;

async function tick() {
  const db = getDb();
  const evt: WorkerEvent = {
    id: `evt_${randomUUID()}`,
    type: 'tick',
    payload: { source: 'worker', at: new Date().toISOString() },
    createdAt: new Date().toISOString(),
  };
  bus.publish(evt);
  await db.insert(events).values({
    id: evt.id,
    type: evt.type,
    payloadJson: JSON.stringify(evt.payload),
    tokensIn: 0,
    tokensOut: 0,
    cacheRead: 0,
    cacheCreation: 0,
    costCents: 0,
    risk: 'low',
    createdAt: new Date(),
  });
}

async function pollTasks() {
  const db = getDb();
  const pending = await db.select().from(tasks).where(eq(tasks.status, 'todo')).limit(1);
  if (pending.length > 0) {
    console.log(`[worker] ${pending.length} pending task(s) — Phase 1 will pick these up.`);
  }
}

async function main() {
  console.log('[worker] alive');
  setInterval(() => {
    tick().catch((e) => console.error('[worker:tick]', e));
  }, TICK_MS);
  setInterval(() => {
    pollTasks().catch((e) => console.error('[worker:poll]', e));
  }, POLL_MS);
}

main().catch((e) => {
  console.error('[worker] fatal', e);
  process.exit(1);
});
