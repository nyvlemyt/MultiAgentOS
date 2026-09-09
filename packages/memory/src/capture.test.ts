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
    expect(result).toEqual({ pending: [], failed: [], rejected: [], duplicate: [] });
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

  it('persists classifierDecision on a pending row', async () => {
    const db = getDb();
    await seedTask();
    const res = await captureCandidates(db, 'task1', [
      { type: 'reference', body: 'A governance note about agents.', classifierDecision: 'learnings/global (rule:kw-learning)' },
    ]);
    expect(res.pending).toHaveLength(1);
    const [row] = await db.select().from(memoryCandidates).where(eq(memoryCandidates.id, res.pending[0]!));
    expect(row!.classifierDecision).toBe('learnings/global (rule:kw-learning)');
    expect(row!.status).toBe('pending');
  });
});

describe('captureCandidates — anti-duplicate guard (source_key idempotence, visible skips)', () => {
  it('skips a candidate whose source_key already exists — idempotent replay, no second row', async () => {
    const db = getDb();
    await seedTask();
    const first = await captureCandidates(db, 'task1', [
      { type: 'reference', body: 'Lecture 1 notes.', sourceKey: 'sha256:dup' },
    ]);
    expect(first.pending).toHaveLength(1);
    const second = await captureCandidates(db, 'task1', [
      { type: 'reference', body: 'Lecture 1 notes (re-captured).', sourceKey: 'sha256:dup' },
    ]);
    expect(second.pending).toHaveLength(0);
    expect(second.duplicate).toEqual([first.pending[0]]); // points to the existing row — the skip is visible
    const rows = await db.select().from(memoryCandidates).where(eq(memoryCandidates.sourceKey, 'sha256:dup'));
    expect(rows).toHaveLength(1); // never a second row — re-capturing the datalake is replayable
  });

  it('a modified doc (different source_key) is a fresh candidate, not a duplicate', async () => {
    const db = getDb();
    await seedTask();
    await captureCandidates(db, 'task1', [{ type: 'reference', body: 'v1', sourceKey: 'sha256:v1' }]);
    const res = await captureCandidates(db, 'task1', [{ type: 'reference', body: 'v2', sourceKey: 'sha256:v2' }]);
    expect(res.pending).toHaveLength(1);
    expect(res.duplicate).toHaveLength(0);
  });

  it('dedups within a single batch — first inserts, the rest point to it', async () => {
    const db = getDb();
    await seedTask();
    const res = await captureCandidates(db, 'task1', [
      { type: 'reference', body: 'same', sourceKey: 'sha256:batch' },
      { type: 'reference', body: 'same again', sourceKey: 'sha256:batch' },
    ]);
    expect(res.pending).toHaveLength(1);
    expect(res.duplicate).toEqual([res.pending[0]]);
    const rows = await db.select().from(memoryCandidates).where(eq(memoryCandidates.sourceKey, 'sha256:batch'));
    expect(rows).toHaveLength(1);
  });

  it('a past dead-letter never blocks a retry — same source_key is still admitted to pending', async () => {
    const db = getDb();
    await seedTask();
    const failed = await captureCandidates(db, 'task1', [
      { type: 'reference', body: 'https://x', sourceKey: 'sha256:retry', captureFailed: { cause: 'paywall_404' } },
    ]);
    expect(failed.failed).toHaveLength(1);
    const retry = await captureCandidates(db, 'task1', [
      { type: 'reference', body: 'recovered content', sourceKey: 'sha256:retry' },
    ]);
    expect(retry.pending).toHaveLength(1); // the capture_failed row must not count as a duplicate
    expect(retry.duplicate).toHaveLength(0);
  });

  it('candidates without a source_key are never deduped (the ritual path is key-less)', async () => {
    const db = getDb();
    await seedTask();
    const res = await captureCandidates(db, 'task1', [
      { type: 'project', body: 'identical ritual note' },
      { type: 'project', body: 'identical ritual note' },
    ]);
    expect(res.pending).toHaveLength(2);
    expect(res.duplicate).toHaveLength(0);
  });

  it('a dead-letter is always written — never skipped as a duplicate (visible + relaunchable)', async () => {
    const db = getDb();
    await seedTask();
    await captureCandidates(db, 'task1', [{ type: 'reference', body: 'a', sourceKey: 'sha256:dl' }]);
    const res = await captureCandidates(db, 'task1', [
      { type: 'reference', body: 'b', sourceKey: 'sha256:dl', captureFailed: { cause: 'extractor_crash' } },
    ]);
    expect(res.failed).toHaveLength(1); // dead-letter still written despite the existing pending key
    expect(res.duplicate).toHaveLength(0);
  });
});
