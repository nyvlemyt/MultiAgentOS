import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import { getDb, closeDb, projects, missions, tasks, schedules, events } from '@mas/db';
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
    expect(evs.length).toBe(1);
  });
});
