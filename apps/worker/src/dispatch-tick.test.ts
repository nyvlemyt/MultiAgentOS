import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { inArray } from 'drizzle-orm';
import { getDb, closeDb, projects, missions, tasks } from '@mas/db';
import { tick } from './index';

const MIGRATIONS_FOLDER = resolve(dirname(fileURLToPath(import.meta.url)), '../../../packages/db/migrations');

let dbPath: string;
beforeEach(() => {
  process.env.MAS_MOCK_LLM = '1';
  const dir = join(tmpdir(), 'mas-worker-dispatch-tick');
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
  delete process.env.MAS_MAX_CONCURRENT_PER_PROJECT;
  delete process.env.MAS_MAX_GLOBAL_CONCURRENT;
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

describe('worker tick — multi-project dispatch', () => {
  it('advances two projects concurrently in one tick within budget', async () => {
    await seedMission('m1', 'p1');
    await seedMission('m2', 'p2');
    await tick(getDb(), new Date(2026, 5, 15, 3, 0));
    const rows = await getDb().select().from(tasks).where(inArray(tasks.id, ['m1_t1', 'm2_t1']));
    expect(rows.every((t) => t.status === 'done')).toBe(true);
    expect(rows.length).toBe(2);
  });

  it('honors the global concurrency cap in a single tick', async () => {
    process.env.MAS_MAX_GLOBAL_CONCURRENT = '1';
    await seedMission('g1', 'p1');
    await seedMission('g2', 'p2');
    await tick(getDb(), new Date(2026, 5, 15, 3, 0));
    const rows = await getDb().select().from(tasks).where(inArray(tasks.id, ['g1_t1', 'g2_t1']));
    const done = rows.filter((t) => t.status === 'done');
    expect(done.length).toBe(1);
  });
});
