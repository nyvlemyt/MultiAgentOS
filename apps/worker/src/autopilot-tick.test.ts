import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq, inArray } from 'drizzle-orm';
import { getDb, closeDb, projects, missions, tasks, schedules, events, budgets } from '@mas/db';
import { seedDispatchableMission } from '@mas/agents';
import { tick, maybeEmitDailyReport } from './index';

const MIGRATIONS_FOLDER = resolve(dirname(fileURLToPath(import.meta.url)), '../../../packages/db/migrations');

let dbPath: string;
beforeEach(async () => {
  process.env.MAS_MOCK_LLM = '1';
  const dir = join(tmpdir(), 'mas-worker-tick');
  mkdirSync(dir, { recursive: true });
  dbPath = join(dir, `${randomUUID()}.db`);
  process.env.MAS_DB_PATH = dbPath;
  migrate(getDb(), { migrationsFolder: MIGRATIONS_FOLDER });
});
afterEach(() => {
  closeDb();
  try { unlinkSync(dbPath); } catch { /* ignore */ }
  delete process.env.MAS_DB_PATH;
  delete process.env.MAS_MOCK_LLM;
});

async function seedAutopilot(missionId: string, taskRisk: 'low' | 'high'): Promise<void> {
  const db = getDb();
  const pid = `proj_${missionId}`;
  await db.insert(projects).values({
    id: pid, name: pid, slug: pid, path: join(tmpdir(), pid), type: 'other',
    autonomy: 'autopilot', createdAt: new Date(), lastActiveAt: new Date(),
  });
  await db.insert(schedules).values({
    id: `sch_${missionId}`, projectId: pid, windowStart: '00:00', windowEnd: '23:59', enabled: true,
  });
  await db.insert(missions).values({
    id: missionId, projectId: pid, title: 'M', objective: 'o', status: 'dispatched',
    risk: 'low', budgetTokens: 20000, spentTokens: 0, createdAt: new Date(), updatedAt: new Date(),
  });
  await db.insert(tasks).values({
    id: `${missionId}_t1`, missionId, title: 'T', description: 'do it', status: 'todo',
    risk: taskRisk, createdAt: new Date(), updatedAt: new Date(),
  });
}

describe('worker tick — autopilot', () => {
  it('advances a low-risk autopilot mission inside its window', async () => {
    await seedAutopilot('m_low', 'low');
    await tick(getDb(), new Date(2026, 5, 15, 3, 0));
    const [t] = await getDb().select().from(tasks).where(eq(tasks.id, 'm_low_t1'));
    expect(t?.status).toBe('done');
  });

  it('leaves a high-risk autopilot mission paused (gate intact)', async () => {
    await seedAutopilot('m_high', 'high');
    await tick(getDb(), new Date(2026, 5, 15, 3, 0));
    const [t] = await getDb().select().from(tasks).where(eq(tasks.id, 'm_high_t1'));
    expect(t?.status).not.toBe('done');
  });
});

describe('worker maybeEmitDailyReport — once per day', () => {
  it('emits on first call and is idempotent for the same day', async () => {
    const now = new Date(2026, 5, 15, 3, 0);
    await maybeEmitDailyReport(getDb(), now);
    await maybeEmitDailyReport(getDb(), now);
    const evs = await getDb().select().from(events).where(eq(events.type, 'daily_report'));
    expect(evs).toHaveLength(1);
  });
});

describe('worker tick — multi-project dispatch (Phase 8a)', () => {
  it('advances two projects concurrently in one tick within budget', async () => {
    await seedDispatchableMission('m1', 'p1');
    await seedDispatchableMission('m2', 'p2');
    await tick(getDb(), new Date(2026, 5, 15, 3, 0));
    const rows = await getDb().select().from(tasks).where(inArray(tasks.id, ['m1_t1', 'm2_t1']));
    expect(rows).toHaveLength(2);
    expect(rows.every((t) => t.status === 'done')).toBe(true);
  });

  it('halts dispatch and emits budget_exceeded when the day cap is reached', async () => {
    const db = getDb();
    await db.insert(budgets).values({
      id: 'bud_day', scope: 'global', period: 'day', tokensCap: 100, tokensSpent: 0,
    });
    // Prior LLM spend today already at the cap.
    await db.insert(events).values({
      id: 'evt_spend', type: 'task_done', tokensIn: 60, tokensOut: 40,
      cacheRead: 0, cacheCreation: 0, quotaUnits: 0, risk: 'low', createdAt: new Date(),
    });
    await seedDispatchableMission('b1', 'pb');

    await tick(getDb(), new Date(2026, 5, 15, 3, 0));

    const [t] = await getDb().select().from(tasks).where(eq(tasks.id, 'b1_t1'));
    expect(t?.status).not.toBe('done');
    const evs = await getDb().select().from(events).where(eq(events.type, 'budget_exceeded'));
    expect(evs).toHaveLength(1);
  });

  it('counts a concurrent running task as reserved spend and halts dispatch', async () => {
    const db = getDb();
    await db.insert(budgets).values({
      id: 'bud_day2', scope: 'global', period: 'day', tokensCap: 1000, tokensSpent: 0,
    });
    // A sibling agent already running elsewhere reserves 2000 tokens > cap.
    await seedDispatchableMission('busy', 'pbusy');
    await db.update(tasks).set({ status: 'running', budgetTokens: 2000 }).where(eq(tasks.id, 'busy_t1'));
    // A fresh dispatchable mission: zero logged spend, but the reservation blocks it.
    await seedDispatchableMission('fresh', 'pfresh');

    await tick(getDb(), new Date(2026, 5, 15, 3, 0));

    const [t] = await getDb().select().from(tasks).where(eq(tasks.id, 'fresh_t1'));
    expect(t?.status).toBe('todo');
    const evs = await getDb().select().from(events).where(eq(events.type, 'budget_exceeded'));
    expect(evs).toHaveLength(1);
  });

  it('honors the global concurrency cap in a single tick', async () => {
    process.env.MAS_MAX_GLOBAL_CONCURRENT = '1';
    try {
      await seedDispatchableMission('g1', 'p1');
      await seedDispatchableMission('g2', 'p2');
      await tick(getDb(), new Date(2026, 5, 15, 3, 0));
      const rows = await getDb().select().from(tasks).where(inArray(tasks.id, ['g1_t1', 'g2_t1']));
      expect(rows.filter((t) => t.status === 'done')).toHaveLength(1);
    } finally {
      delete process.env.MAS_MAX_GLOBAL_CONCURRENT;
    }
  });
});
