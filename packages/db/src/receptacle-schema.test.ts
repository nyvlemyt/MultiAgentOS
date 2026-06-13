import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import { getDb, closeDb } from './client';
import { ideas, decisions, missions, projects } from './schema';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = resolve(__dirname, '../migrations');

let dbPath: string;
beforeEach(() => {
  dbPath = join(tmpdir(), `mas-${randomUUID()}.db`);
  migrate(getDb(dbPath), { migrationsFolder: MIGRATIONS_FOLDER });
});
afterEach(() => {
  closeDb();
  unlinkSync(dbPath);
});

describe('Phase 4.5-receptacle migration 0005', () => {
  it('ideas table round-trips', async () => {
    const db = getDb();
    await db.insert(ideas).values({
      id: 'idea1',
      title: 'Add dark mode',
      body: 'users keep asking',
      scope: 'project',
      projectId: null,
      status: 'inbox',
      priorityScore: 0,
      impact: 80,
      urgency: 40,
      effortEst: 30,
      riskScore: 10,
      costEstTokens: 5000,
      sourceDossier: 'docs/intake/2026-06-13-x.md',
      ideaIdLink: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const [row] = await db.select().from(ideas).where(eq(ideas.id, 'idea1'));
    expect(row!.title).toBe('Add dark mode');
    expect(row!.status).toBe('inbox');
    expect(row!.impact).toBe(80);
    expect(row!.sourceDossier).toBe('docs/intake/2026-06-13-x.md');
  });

  it('decisions table round-trips', async () => {
    const db = getDb();
    await db.insert(decisions).values({
      id: 'dec1',
      scope: 'global',
      projectId: null,
      source: 'user',
      sourceMissionId: null,
      sourceTaskId: null,
      title: 'Lock the stack',
      body: 'Next 15 + drizzle, no new frameworks',
      createdAt: new Date(),
    });
    const [row] = await db.select().from(decisions).where(eq(decisions.id, 'dec1'));
    expect(row!.title).toBe('Lock the stack');
    expect(row!.source).toBe('user');
  });

  it('missions gains deadline/milestone/priorityScore; legacy insert defaults priorityScore=0', async () => {
    const db = getDb();
    await db.insert(projects).values({
      id: 'p1', name: 'P', slug: 'p', path: join(tmpdir(), 'p'), type: 'other',
      createdAt: new Date(), lastActiveAt: new Date(),
    });
    const dl = new Date('2026-07-01T00:00:00Z');
    await db.insert(missions).values({
      id: 'm1', projectId: 'p1', title: 'M', objective: 'o',
      deadline: dl, milestone: 'v1',
      createdAt: new Date(), updatedAt: new Date(),
    });
    const [row] = await db.select().from(missions).where(eq(missions.id, 'm1'));
    expect(row!.deadline?.getTime()).toBe(dl.getTime());
    expect(row!.milestone).toBe('v1');
    expect(row!.priorityScore).toBe(0);
  });
});
