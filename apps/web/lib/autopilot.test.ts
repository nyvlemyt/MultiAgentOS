import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb, closeDb, projects, missions, tasks, validations, events } from '@mas/db';
import { listPendingValidations, latestDailyReport, getBudgetPause } from './autopilot';

const MIGRATIONS = resolve(dirname(fileURLToPath(import.meta.url)), '../../../packages/db/migrations');

let dbPath: string;
beforeEach(async () => {
  dbPath = join(tmpdir(), `mas-ap-${randomUUID()}.db`);
  process.env.MAS_DB_PATH = dbPath;
  migrate(getDb(), { migrationsFolder: MIGRATIONS });
  const db = getDb();
  await db.insert(projects).values({
    id: 'p', name: 'p', slug: 'p', path: join(tmpdir(), 'p'), type: 'other', createdAt: new Date(), lastActiveAt: new Date(),
  });
  await db.insert(missions).values({
    id: 'm', projectId: 'p', title: 'M', objective: 'o', status: 'dispatched', budgetTokens: 1, spentTokens: 0, createdAt: new Date(), updatedAt: new Date(),
  });
  await db.insert(tasks).values({
    id: 'm_t1', missionId: 'm', title: 'High task', status: 'needs_validation', risk: 'high', createdAt: new Date(), updatedAt: new Date(),
  });
});
afterEach(() => {
  closeDb();
  try { unlinkSync(dbPath); } catch { /* ignore */ }
  delete process.env.MAS_DB_PATH;
});

describe('listPendingValidations', () => {
  it('returns pending validations joined to their task title', async () => {
    await getDb().insert(validations).values({
      id: 'v1', taskId: 'm_t1', requestedByAgent: 'sec', actionSummary: 'Run high-risk task', status: 'pending',
    });
    const rows = await listPendingValidations(getDb());
    expect(rows).toHaveLength(1);
    expect(rows[0]?.taskTitle).toBe('High task');
    expect(rows[0]?.missionId).toBe('m');
  });

  it('ignores decided validations', async () => {
    await getDb().insert(validations).values({
      id: 'v2', taskId: 'm_t1', requestedByAgent: 'sec', actionSummary: 'x', status: 'approved',
    });
    expect(await listPendingValidations(getDb())).toHaveLength(0);
  });
});

describe('latestDailyReport', () => {
  it('returns null when no daily_report event exists', async () => {
    expect(await latestDailyReport(getDb())).toBeNull();
  });

  it('returns the most recent daily_report payload', async () => {
    const older = { since: '', until: '', missionsAdvanced: 1, missionsBlocked: 0, tasksDone: 2, validationsPending: 0, quotaUnits: 5 };
    const newer = { since: '', until: '', missionsAdvanced: 3, missionsBlocked: 1, tasksDone: 9, validationsPending: 2, quotaUnits: 42 };
    await getDb().insert(events).values({
      id: 'e_old', type: 'daily_report', payloadJson: JSON.stringify(older), risk: 'low', createdAt: new Date(2026, 0, 1),
    });
    await getDb().insert(events).values({
      id: 'e_new', type: 'daily_report', payloadJson: JSON.stringify(newer), risk: 'low', createdAt: new Date(2026, 0, 2),
    });
    const r = await latestDailyReport(getDb());
    expect(r?.quotaUnits).toBe(42);
    expect(r?.tasksDone).toBe(9);
  });
});

describe('getBudgetPause', () => {
  it('returns null when no budget_exceeded event exists today', async () => {
    expect(await getBudgetPause(getDb())).toBeNull();
  });

  it('ignores a budget_exceeded event from a previous day', async () => {
    await getDb().insert(events).values({
      id: 'e_old_pause', type: 'budget_exceeded', payloadJson: JSON.stringify({ window: 'day' }),
      risk: 'low', createdAt: new Date(2020, 0, 1),
    });
    expect(await getBudgetPause(getDb())).toBeNull();
  });

  it('returns the newest pause today with window + remaining', async () => {
    const now = new Date();
    await getDb().insert(events).values({
      id: 'e_pause_old', type: 'budget_exceeded',
      payloadJson: JSON.stringify({ window: 'day', day: { remaining: 0 } }),
      risk: 'low', createdAt: new Date(now.getTime() - 60_000),
    });
    await getDb().insert(events).values({
      id: 'e_pause_new', type: 'budget_exceeded',
      payloadJson: JSON.stringify({ window: 'month', month: { remaining: 1234 } }),
      risk: 'low', createdAt: now,
    });
    const pause = await getBudgetPause(getDb());
    expect(pause?.window).toBe('month');
    expect(pause?.remaining).toBe(1234);
  });

  it('defaults to the day window on a malformed payload', async () => {
    await getDb().insert(events).values({
      id: 'e_pause_bad', type: 'budget_exceeded', payloadJson: 'not-json',
      risk: 'low', createdAt: new Date(),
    });
    const pause = await getBudgetPause(getDb());
    expect(pause?.window).toBe('day');
    expect(pause?.remaining).toBeUndefined();
  });
});
