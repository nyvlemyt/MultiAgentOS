import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import { getDb, closeDb, projects, missions, tasks, schedules, type Schedule } from '@mas/db';
import { isWithinWindow, selectAutopilotMissions, runAutopilotTick } from './autopilot';
import { seedAgentsRoster } from './testing';

const MIGRATIONS_FOLDER = resolve(dirname(fileURLToPath(import.meta.url)), '../../db/migrations');

function schedule(over: Partial<Schedule> = {}): Schedule {
  return {
    id: 's', projectId: 'p', kind: 'autopilot',
    windowStart: '02:00', windowEnd: '06:00',
    daysJson: '[0,1,2,3,4,5,6]', maxRisk: 'low', enabled: true,
    lastRunAt: null, createdAt: new Date(),
    ...over,
  } as Schedule;
}

describe('isWithinWindow', () => {
  it('true inside a same-day window on an allowed day', () => {
    // 2026-06-15 is a Monday (day 1), 03:30 local.
    const now = new Date(2026, 5, 15, 3, 30);
    expect(isWithinWindow(schedule({ daysJson: '[1]' }), now)).toBe(true);
  });

  it('false outside the window', () => {
    const now = new Date(2026, 5, 15, 8, 0);
    expect(isWithinWindow(schedule(), now)).toBe(false);
  });

  it('false on a day not in daysJson', () => {
    const now = new Date(2026, 5, 15, 3, 30); // Monday
    expect(isWithinWindow(schedule({ daysJson: '[0]' }), now)).toBe(false);
  });

  it('handles a window that wraps past midnight (22:00–02:00)', () => {
    const late = new Date(2026, 5, 15, 23, 0);
    const early = new Date(2026, 5, 16, 1, 0);
    const outside = new Date(2026, 5, 15, 12, 0);
    const w = schedule({ windowStart: '22:00', windowEnd: '02:00' });
    expect(isWithinWindow(w, late)).toBe(true);
    expect(isWithinWindow(w, early)).toBe(true);
    expect(isWithinWindow(w, outside)).toBe(false);
  });
});

let dbPath: string;
beforeEach(async () => {
  process.env.MAS_MOCK_LLM = '1';
  const dir = join(tmpdir(), 'mas-autopilot');
  mkdirSync(dir, { recursive: true });
  dbPath = join(dir, `${randomUUID()}.db`);
  process.env.MAS_DB_PATH = dbPath;
  migrate(getDb(), { migrationsFolder: MIGRATIONS_FOLDER });
  await seedAgentsRoster();
});
afterEach(() => {
  closeDb();
  try { unlinkSync(dbPath); } catch { /* ignore */ }
  delete process.env.MAS_DB_PATH;
  delete process.env.MAS_MOCK_LLM;
});

async function seedAutopilotMission(opts: {
  projectId: string; missionId: string; taskRisk: 'low' | 'medium' | 'high' | 'blocking';
  inWindow: boolean; autonomy?: 'autopilot' | 'autonomous';
}): Promise<void> {
  const db = getDb();
  await db.insert(projects).values({
    id: opts.projectId, name: opts.projectId, slug: opts.projectId,
    path: join(tmpdir(), opts.projectId), type: 'other',
    autonomy: opts.autonomy ?? 'autopilot', createdAt: new Date(), lastActiveAt: new Date(),
  });
  await db.insert(schedules).values({
    id: `sch_${opts.projectId}`, projectId: opts.projectId,
    windowStart: opts.inWindow ? '00:00' : '23:58',
    windowEnd: opts.inWindow ? '23:59' : '23:59',
    enabled: true,
  });
  await db.insert(missions).values({
    id: opts.missionId, projectId: opts.projectId, title: 'M', objective: 'o',
    status: 'dispatched', risk: 'low', budgetTokens: 20000, spentTokens: 0,
    createdAt: new Date(), updatedAt: new Date(),
  });
  await db.insert(tasks).values({
    id: `${opts.missionId}_t1`, missionId: opts.missionId, title: 'T', description: 'do it',
    status: 'todo', risk: opts.taskRisk, createdAt: new Date(), updatedAt: new Date(),
  });
}

describe('selectAutopilotMissions', () => {
  it('selects autopilot-project missions with an active schedule', async () => {
    await seedAutopilotMission({ projectId: 'p1', missionId: 'm1', taskRisk: 'low', inWindow: true });
    const ms = await selectAutopilotMissions(getDb(), new Date(2026, 5, 15, 12, 0));
    expect(ms.map((m) => m.id)).toEqual(['m1']);
  });

  it('excludes non-autopilot projects', async () => {
    await seedAutopilotMission({ projectId: 'p2', missionId: 'm2', taskRisk: 'low', inWindow: true, autonomy: 'autonomous' });
    const ms = await selectAutopilotMissions(getDb(), new Date(2026, 5, 15, 12, 0));
    expect(ms).toHaveLength(0);
  });
});

describe('runAutopilotTick — never runs high-risk unsupervised', () => {
  it('auto-advances a low-risk task in-window', async () => {
    await seedAutopilotMission({ projectId: 'p1', missionId: 'm1', taskRisk: 'low', inWindow: true });
    const res = await runAutopilotTick(getDb(), new Date(2026, 5, 15, 12, 0));
    expect(res.ran).toContain('m1');
    const [t] = await getDb().select().from(tasks).where(eq(tasks.id, 'm1_t1'));
    expect(t?.status).toBe('done');
  });

  it('skips a high-risk task and never executes it (stays gated)', async () => {
    await seedAutopilotMission({ projectId: 'p1', missionId: 'm1', taskRisk: 'high', inWindow: true });
    const res = await runAutopilotTick(getDb(), new Date(2026, 5, 15, 12, 0));
    expect(res.skippedHighRisk).toContain('m1');
    expect(res.ran).not.toContain('m1');
    const [t] = await getDb().select().from(tasks).where(eq(tasks.id, 'm1_t1'));
    expect(t?.status).not.toBe('done');
    expect(t?.status).not.toBe('running');
  });

  it('runs nothing out of window', async () => {
    await seedAutopilotMission({ projectId: 'p1', missionId: 'm1', taskRisk: 'low', inWindow: false });
    const res = await runAutopilotTick(getDb(), new Date(2026, 5, 15, 12, 0));
    expect(res.ran).toHaveLength(0);
    expect(res.skippedHighRisk).toHaveLength(0);
  });
});
