import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb, closeDb, projects, missions, tasks } from '@mas/db';
import { selectForTick, runDispatchTick, type DispatchTickConfig } from './dispatch-tick';

const MIGRATIONS_FOLDER = resolve(dirname(fileURLToPath(import.meta.url)), '../../db/migrations');

type Row = { id: string; projectId: string; createdAt: Date };

function row(id: string, projectId: string, ms: number): Row {
  return { id, projectId, createdAt: new Date(ms) };
}

describe('selectForTick — pure selection', () => {
  it('applies the per-project cap, overflow → project_cap', () => {
    const missionsIn = [row('a', 'p1', 1), row('b', 'p1', 2), row('c', 'p1', 3)];
    const config: DispatchTickConfig = { maxConcurrentPerProject: 1, maxGlobalConcurrent: 10 };
    const { selected, skipped } = selectForTick(missionsIn, config);
    expect(selected.map((m) => m.id)).toEqual(['a']);
    expect(skipped).toEqual([
      { missionId: 'b', projectId: 'p1', reason: 'project_cap' },
      { missionId: 'c', projectId: 'p1', reason: 'project_cap' },
    ]);
  });

  it('applies the global cap after the per-project cap, overflow → global_cap', () => {
    const missionsIn = [
      row('a', 'p1', 1),
      row('b', 'p2', 2),
      row('c', 'p3', 3),
    ];
    const config: DispatchTickConfig = { maxConcurrentPerProject: 1, maxGlobalConcurrent: 2 };
    const { selected, skipped } = selectForTick(missionsIn, config);
    expect(selected.map((m) => m.id)).toEqual(['a', 'b']);
    expect(skipped).toEqual([{ missionId: 'c', projectId: 'p3', reason: 'global_cap' }]);
  });

  it('orders deterministically by createdAt then id', () => {
    const missionsIn = [
      row('z', 'p2', 5),
      row('a', 'p1', 5),
      row('m', 'p3', 1),
    ];
    const config: DispatchTickConfig = { maxConcurrentPerProject: 5, maxGlobalConcurrent: 5 };
    const { selected } = selectForTick(missionsIn, config);
    expect(selected.map((m) => m.id)).toEqual(['m', 'a', 'z']);
  });
});

describe('runDispatchTick — integration (mock LLM)', () => {
  let dbPath: string;
  beforeEach(() => {
    process.env.MAS_MOCK_LLM = '1';
    const dir = join(tmpdir(), 'mas-dispatch-tick');
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

  async function seedMission(missionId: string, projectId: string): Promise<void> {
    const db = getDb();
    await db.insert(projects).values({
      id: projectId, name: projectId, slug: projectId, path: join(tmpdir(), projectId),
      type: 'other', autonomy: 'autonomous', createdAt: new Date(), lastActiveAt: new Date(),
    }).onConflictDoNothing();
    await db.insert(missions).values({
      id: missionId, projectId, title: 'M', objective: 'o', status: 'dispatched',
      risk: 'low', budgetTokens: 20000, spentTokens: 0, createdAt: new Date(), updatedAt: new Date(),
    });
    await db.insert(tasks).values({
      id: `${missionId}_t1`, missionId, title: 'T', description: 'do it', status: 'todo',
      risk: 'low', createdAt: new Date(), updatedAt: new Date(),
    });
  }

  it('advances one mission per project across two projects', async () => {
    await seedMission('m1', 'p1');
    await seedMission('m2', 'p2');
    const result = await runDispatchTick(getDb(), { maxConcurrentPerProject: 1, maxGlobalConcurrent: 4 });
    expect(result.advanced.map((a) => a.missionId).sort((a, b) => a.localeCompare(b))).toEqual(['m1', 'm2']);
    expect(result.skipped).toEqual([]);
  });

  it('caps per project: 3 missions, perProjectCap 1 → 1 advanced, 2 skipped project_cap', async () => {
    await seedMission('a1', 'p1');
    await seedMission('a2', 'p1');
    await seedMission('a3', 'p1');
    const result = await runDispatchTick(getDb(), { maxConcurrentPerProject: 1, maxGlobalConcurrent: 4 });
    expect(result.advanced.length).toBe(1);
    expect(result.skipped.length).toBe(2);
    expect(result.skipped.every((s) => s.reason === 'project_cap')).toBe(true);
  });
});
