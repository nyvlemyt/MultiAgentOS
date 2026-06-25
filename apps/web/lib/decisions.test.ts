import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb, closeDb, projects, missions } from '@mas/db';
import { createDecision, listDecisions } from './decisions';

const MIGRATIONS = resolve(dirname(fileURLToPath(import.meta.url)), '../../../packages/db/migrations');

let dbPath: string;
beforeEach(async () => {
  dbPath = join(tmpdir(), `mas-dec-${randomUUID()}.db`);
  process.env.MAS_DB_PATH = dbPath;
  migrate(getDb(), { migrationsFolder: MIGRATIONS });
  await getDb().insert(projects).values({
    id: 'p1', name: 'P', slug: 'p', path: join(tmpdir(), 'p'), type: 'other',
    createdAt: new Date(), lastActiveAt: new Date(),
  });
});
afterEach(() => {
  closeDb();
  try { unlinkSync(dbPath); } catch { /* ignore */ }
  delete process.env.MAS_DB_PATH;
});

describe('createDecision', () => {
  it('logs a manual user decision (source defaults to user)', async () => {
    const d = await createDecision(getDb(), { scope: 'global', title: 'Lock stack' });
    expect(d.source).toBe('user');
    expect(d.title).toBe('Lock stack');
  });
});

describe('listDecisions', () => {
  it('filters last-N global decisions newest-first', async () => {
    for (let i = 0; i < 7; i++) {
      await createDecision(getDb(), { scope: 'global', title: `g${i}`, createdAt: new Date(2026, 0, 1 + i) });
    }
    await createDecision(getDb(), { scope: 'project', projectId: 'p1', title: 'proj-only' });
    const last5 = await listDecisions(getDb(), { scope: 'global', limit: 5 });
    expect(last5).toHaveLength(5);
    expect(last5[0]!.title).toBe('g6');
    expect(last5.some((d) => d.title === 'proj-only')).toBe(false);
  });

  it('filters by projectId', async () => {
    await createDecision(getDb(), { scope: 'project', projectId: 'p1', title: 'a' });
    await createDecision(getDb(), { scope: 'global', title: 'b' });
    const rows = await listDecisions(getDb(), { projectId: 'p1' });
    expect(rows.map((d) => d.title)).toEqual(['a']);
  });

  it('filters by sourceMissionId', async () => {
    await getDb().insert(missions).values({
      id: 'mission_x', projectId: 'p1', title: 'M', objective: 'o',
      createdAt: new Date(), updatedAt: new Date(),
    });
    await createDecision(getDb(), { scope: 'project', projectId: 'p1', title: 'm', sourceMissionId: 'mission_x', source: 'mission' });
    await createDecision(getDb(), { scope: 'global', title: 'other' });
    const rows = await listDecisions(getDb(), { missionId: 'mission_x' });
    expect(rows.map((d) => d.title)).toEqual(['m']);
  });
});
