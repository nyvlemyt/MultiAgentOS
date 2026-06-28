import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import { getDb, closeDb } from './client';
import { memoryCandidates } from './schema';

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

describe('memory_candidates Brique 1 deltas (source_key + trust + capture_failed)', () => {
  it('round-trips source_key and trust', async () => {
    const db = getDb();
    await db.insert(memoryCandidates).values({
      id: 'b1', sourceTaskId: null, type: 'reference', body: 'raw', status: 'pending',
      sourceKey: 'sha256:deadbeef', trust: 'untrusted', createdAt: new Date(),
    });
    const [row] = await db.select().from(memoryCandidates).where(eq(memoryCandidates.id, 'b1'));
    expect(row!.sourceKey).toBe('sha256:deadbeef');
    expect(row!.trust).toBe('untrusted');
  });
  it('accepts the new capture_failed status', async () => {
    const db = getDb();
    await db.insert(memoryCandidates).values({
      id: 'b2', sourceTaskId: null, type: 'reference', body: 'x', status: 'capture_failed',
      createdAt: new Date(),
    });
    const [row] = await db.select().from(memoryCandidates).where(eq(memoryCandidates.id, 'b2'));
    expect(row!.status).toBe('capture_failed');
  });
  it('legacy inserts without source_key/trust still work (nullable)', async () => {
    const db = getDb();
    await db.insert(memoryCandidates).values({
      id: 'b3', sourceTaskId: null, type: 'project', body: 'legacy', status: 'pending',
      createdAt: new Date(),
    });
    const [row] = await db.select().from(memoryCandidates).where(eq(memoryCandidates.id, 'b3'));
    expect(row!.sourceKey).toBeNull();
    expect(row!.trust).toBeNull();
  });
});
