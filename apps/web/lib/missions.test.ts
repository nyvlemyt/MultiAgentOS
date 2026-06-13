import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb, closeDb, projects, missions } from '@mas/db';
import { setMissionPriority, topMissionsByPriority } from './missions';

const MIGRATIONS = resolve(dirname(fileURLToPath(import.meta.url)), '../../../packages/db/migrations');

let dbPath: string;
beforeEach(async () => {
  dbPath = join(tmpdir(), `mas-m-${randomUUID()}.db`);
  process.env.MAS_DB_PATH = dbPath;
  migrate(getDb(), { migrationsFolder: MIGRATIONS });
  await getDb().insert(projects).values([
    { id: 'p1', name: 'P1', slug: 'p1', path: join(tmpdir(), 'p1'), type: 'other', createdAt: new Date(), lastActiveAt: new Date() },
    { id: 'p2', name: 'P2', slug: 'p2', path: join(tmpdir(), 'p2'), type: 'other', createdAt: new Date(), lastActiveAt: new Date() },
  ]);
});
afterEach(() => {
  closeDb();
  try { unlinkSync(dbPath); } catch { /* ignore */ }
  delete process.env.MAS_DB_PATH;
});

async function mk(id: string, projectId: string, score: number) {
  await getDb().insert(missions).values({
    id, projectId, title: id, objective: 'o', priorityScore: score,
    createdAt: new Date(), updatedAt: new Date(),
  });
}

describe('setMissionPriority', () => {
  it('persists a clamped 0–100 score', async () => {
    await mk('m1', 'p1', 0);
    const updated = await setMissionPriority(getDb(), 'm1', 150);
    expect(updated!.priorityScore).toBe(100);
    const neg = await setMissionPriority(getDb(), 'm1', -5);
    expect(neg!.priorityScore).toBe(0);
  });
});

describe('topMissionsByPriority', () => {
  it('returns missions sorted by priorityScore desc, optional project filter + limit', async () => {
    await mk('m1', 'p1', 30);
    await mk('m2', 'p1', 90);
    await mk('m3', 'p2', 70);
    const all = await topMissionsByPriority(getDb(), {});
    expect(all.map((m) => m.id)).toEqual(['m2', 'm3', 'm1']);
    const top2 = await topMissionsByPriority(getDb(), { limit: 2 });
    expect(top2.map((m) => m.id)).toEqual(['m2', 'm3']);
    const p1only = await topMissionsByPriority(getDb(), { projectId: 'p1' });
    expect(p1only.map((m) => m.id)).toEqual(['m2', 'm1']);
  });
});
