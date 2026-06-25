import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb, closeDb, projects } from '@mas/db';
import { createReport, listProjectReports, listMissionReports, getReport } from './reports';

const MIGRATIONS = resolve(dirname(fileURLToPath(import.meta.url)), '../../../packages/db/migrations');

let dbPath: string;
beforeEach(async () => {
  dbPath = join(tmpdir(), `mas-rep-${randomUUID()}.db`);
  process.env.MAS_DB_PATH = dbPath;
  migrate(getDb(), { migrationsFolder: MIGRATIONS });
  await getDb().insert(projects).values({
    id: 'p1', name: 'P', slug: 'p', path: join(tmpdir(), 'p'), type: 'other', createdAt: new Date(), lastActiveAt: new Date(),
  });
});
afterEach(() => {
  closeDb();
  try { unlinkSync(dbPath); } catch { /* ignore */ }
});

describe('reports', () => {
  it('creates and fetches a report scoped to its project', async () => {
    const r = await createReport(getDb(), { projectId: 'p1', missionId: 'm1', agentId: 'mission-planner', title: 'T', humanMd: '# hi' });
    const got = await getReport(getDb(), 'p1', r.id);
    expect(got?.title).toBe('T');
    expect(await getReport(getDb(), 'other', r.id)).toBeUndefined();
  });

  it('lists a mission\'s reports newest first', async () => {
    await createReport(getDb(), { projectId: 'p1', missionId: 'm1', title: 'A', createdAt: new Date(1000) });
    const b = await createReport(getDb(), { projectId: 'p1', missionId: 'm1', title: 'B', createdAt: new Date(2000) });
    const list = await listMissionReports(getDb(), 'm1');
    expect(list).toHaveLength(2);
    expect(list[0]!.id).toBe(b.id);
  });

  it('lists all project reports', async () => {
    await createReport(getDb(), { projectId: 'p1', missionId: 'm1', title: 'A' });
    await createReport(getDb(), { projectId: 'p1', kind: 'project', title: 'État projet' });
    expect(await listProjectReports(getDb(), 'p1')).toHaveLength(2);
  });
});
