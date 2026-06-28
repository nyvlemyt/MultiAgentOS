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

describe('captureCandidates (the one door — SAS + dead-letter live inside the seam)', () => {
  it('inserts pending rows from a ritual and returns their ids in result.pending', async () => {
    const db = getDb();
    await seedTask();
    const result = await captureCandidates(db, 'task1', [
      { type: 'project', body: 'Decided: FTS5 retriever for the MVP (BDR).' },
      { type: 'feedback', body: 'User prefers eco mode.' },
    ]);
    expect(result.pending).toHaveLength(2);
    expect(result.failed).toHaveLength(0);
    expect(result.rejected).toHaveLength(0);
    const rows = await db.select().from(memoryCandidates).where(eq(memoryCandidates.sourceTaskId, 'task1'));
    expect(rows).toHaveLength(2);
    expect(rows.every((r) => r.status === 'pending')).toBe(true);
  });

  it('is a no-op for an empty ritual (zero LLM, zero rows)', async () => {
    const db = getDb();
    await seedTask();
    const result = await captureCandidates(db, 'task1', []);
    expect(result).toEqual({ pending: [], failed: [], rejected: [] });
  });

  it('persists source_key + trust on the pending row (supersede/security sockets)', async () => {
    const db = getDb();
    await seedTask();
    await captureCandidates(db, 'task1', [
      { type: 'reference', body: 'A distilled note.', sourceKey: 'sha256:k1', trust: 'untrusted' },
    ]);
    const [row] = await db.select().from(memoryCandidates).where(eq(memoryCandidates.sourceTaskId, 'task1'));
    expect(row!.sourceKey).toBe('sha256:k1');
    expect(row!.trust).toBe('untrusted');
  });

  it('SAS rejects zero-content junk at the door — no pending row, reason returned', async () => {
    const db = getDb();
    await seedTask();
    const result = await captureCandidates(db, 'task1', [
      { type: 'project', body: 'A real note.' },
      { type: 'project', body: '   ' }, // empty content → rejected
    ]);
    expect(result.pending).toHaveLength(1);
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0]!.reason).toMatch(/empty|content/i);
    const rows = await db.select().from(memoryCandidates).where(eq(memoryCandidates.sourceTaskId, 'task1'));
    expect(rows).toHaveLength(1); // junk never persisted
  });

  it('SAS rejects when no classification signal can be derived', async () => {
    const db = getDb();
    await seedTask();
    const result = await captureCandidates(db, 'task1', [
      { type: 'project', body: 'text', signals: [] }, // explicit empty signal set
    ]);
    expect(result.pending).toHaveLength(0);
    expect(result.rejected[0]!.reason).toMatch(/signal/i);
  });

  it('dead-letters a failed capture: capture_failed row + reason, never a silent drop', async () => {
    const db = getDb();
    await seedTask();
    const result = await captureCandidates(db, 'task1', [
      { type: 'reference', body: 'https://paywalled.example', captureFailed: { cause: 'paywall_404' } },
    ]);
    expect(result.failed).toHaveLength(1);
    expect(result.pending).toHaveLength(0);
    const [row] = await db.select().from(memoryCandidates).where(eq(memoryCandidates.sourceTaskId, 'task1'));
    expect(row!.status).toBe('capture_failed');
    expect(row!.classifierDecision).toContain('paywall_404');
  });
});
