import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import { getDb, closeDb, memoryCandidates, tasks, missions, projects } from '@mas/db';
import { captureCandidates } from './capture';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = resolve(__dirname, '../../db/migrations');

let dbPath: string;
beforeEach(() => {
  dbPath = join(tmpdir(), `mas-${randomUUID()}.db`);
  const db = getDb(dbPath);
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
});
afterEach(() => {
  closeDb();
  unlinkSync(dbPath);
});

async function seedTask() {
  const db = getDb();
  await db.insert(projects).values({
    id: 'proj', name: 'P', slug: 'p', path: join(tmpdir(), 'p'), type: 'other',
    createdAt: new Date(), lastActiveAt: new Date(),
  });
  await db.insert(missions).values({
    id: 'm1', projectId: 'proj', title: 't', objective: 'o', status: 'executing', risk: 'low',
    budgetTokens: 1000, spentTokens: 0, createdAt: new Date(), updatedAt: new Date(),
  });
  await db.insert(tasks).values({
    id: 'task1', missionId: 'm1', title: 't', description: 'd', status: 'done', risk: 'low',
    dependsOnJson: '[]', skillsJson: '[]', budgetTokens: 100, spentTokens: 0,
    createdAt: new Date(), updatedAt: new Date(),
  });
}

describe('captureCandidates (close-out ritual → memory_candidates)', () => {
  it('inserts pending candidate rows from a ritual and returns their ids', async () => {
    const db = getDb();
    await seedTask();
    const ids = await captureCandidates(db, 'task1', [
      { type: 'project', body: 'Decided: FTS5 retriever for the MVP (BDR).' },
      { type: 'feedback', body: 'User prefers eco mode.' },
    ]);
    expect(ids).toHaveLength(2);
    const rows = await db.select().from(memoryCandidates).where(eq(memoryCandidates.sourceTaskId, 'task1'));
    expect(rows).toHaveLength(2);
    expect(rows.every((r) => r.status === 'pending')).toBe(true);
  });

  it('is a no-op for an empty ritual (zero LLM, zero rows)', async () => {
    const db = getDb();
    await seedTask();
    const ids = await captureCandidates(db, 'task1', []);
    expect(ids).toHaveLength(0);
  });
});
