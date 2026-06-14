import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync, mkdirSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { and, eq } from 'drizzle-orm';
import { getDb, closeDb, projects, missions, tasks, events, validations } from '@mas/db';
import { buildDailyReport, emitDailyReport } from './daily-report';

const MIGRATIONS_FOLDER = resolve(dirname(fileURLToPath(import.meta.url)), '../../db/migrations');
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

let dbPath: string;
beforeEach(async () => {
  const dir = join(tmpdir(), 'mas-daily');
  mkdirSync(dir, { recursive: true });
  dbPath = join(dir, `${randomUUID()}.db`);
  process.env.MAS_DB_PATH = dbPath;
  migrate(getDb(), { migrationsFolder: MIGRATIONS_FOLDER });
  const db = getDb();
  await db.insert(projects).values({
    id: 'p', name: 'p', slug: 'p', path: join(tmpdir(), 'p'), type: 'other',
    createdAt: new Date(), lastActiveAt: new Date(),
  });
  await db.insert(missions).values({
    id: 'm', projectId: 'p', title: 'M', objective: 'o', status: 'dispatched',
    risk: 'low', budgetTokens: 20000, spentTokens: 0, createdAt: new Date(), updatedAt: new Date(),
  });
  await db.insert(tasks).values({
    id: 'm_t1', missionId: 'm', title: 'T', status: 'needs_validation', createdAt: new Date(), updatedAt: new Date(),
  });
});
afterEach(() => {
  closeDb();
  try { unlinkSync(dbPath); } catch { /* ignore */ }
  delete process.env.MAS_DB_PATH;
});

function eventAt(type: string, at: Date, quotaUnits = 0) {
  return getDb().insert(events).values({
    id: `evt_${randomUUID()}`, missionId: 'm', type, payloadJson: '{}',
    tokensIn: 0, tokensOut: 0, cacheRead: 0, cacheCreation: 0, quotaUnits,
    risk: 'low', createdAt: at,
  });
}

describe('buildDailyReport', () => {
  it('counts events/validations and sums quotaUnits within the window', async () => {
    const since = new Date(2026, 5, 15, 0, 0);
    const until = new Date(2026, 5, 16, 0, 0);
    const inside = new Date(2026, 5, 15, 12, 0);
    const outside = new Date(2026, 5, 14, 12, 0);

    await eventAt('mission_executing', inside);
    await eventAt('mission_validated', inside); // same mission 'm' — must not double-count
    await eventAt('mission_blocked', inside);
    await eventAt('task_done', inside, 5);
    await eventAt('task_done', inside, 3);
    await eventAt('task_done', outside, 100); // excluded (out of window)
    await getDb().insert(validations).values({
      id: 'v1', taskId: 'm_t1', requestedByAgent: 'sec', actionSummary: 'x', status: 'pending',
    });

    const r = await buildDailyReport(getDb(), { since, until });
    expect(r.missionsAdvanced).toBe(1);
    expect(r.missionsBlocked).toBe(1);
    expect(r.tasksDone).toBe(2);
    expect(r.validationsPending).toBe(1);
    expect(r.quotaUnits).toBe(8);
  });
});

describe('emitDailyReport', () => {
  it('logs a daily_report event and writes markdown under data/reports', async () => {
    const since = new Date(2026, 5, 15, 0, 0);
    const until = new Date(2026, 5, 16, 0, 0);
    const report = await buildDailyReport(getDb(), { since, until });
    await emitDailyReport(getDb(), report);

    const evs = await getDb().select().from(events).where(eq(events.type, 'daily_report'));
    expect(evs.length).toBe(1);

    const date = until.toISOString().slice(0, 10);
    const reportPath = resolve(REPO_ROOT, `data/reports/${date}.md`);
    expect(existsSync(reportPath)).toBe(true);
    const md = readFileSync(reportPath, 'utf-8');
    expect(md).not.toContain('€');
    expect(md).toContain('quotaUnits');
    rmSync(reportPath, { force: true });
  });

  it('writes only under data/reports, never data/memory', async () => {
    const since = new Date(2026, 5, 15, 0, 0);
    const until = new Date(2026, 5, 16, 0, 0);
    const report = await buildDailyReport(getDb(), { since, until });
    await emitDailyReport(getDb(), report);
    const memoryDay = resolve(REPO_ROOT, `data/memory/${until.toISOString().slice(0, 10)}.md`);
    expect(existsSync(memoryDay)).toBe(false);
    rmSync(resolve(REPO_ROOT, `data/reports/${until.toISOString().slice(0, 10)}.md`), { force: true });
  });
});
