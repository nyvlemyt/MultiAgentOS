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

describe('memory_candidates intake-provenance columns (Phase 4.5 migration)', () => {
  it('applies clean and round-trips the four provenance fields', async () => {
    const db = getDb();
    await db.insert(memoryCandidates).values({
      id: 'c1',
      sourceTaskId: null,
      type: 'reference',
      body: '[intake:repo] qmd',
      status: 'pending',
      sourceKind: 'repo',
      dossierPath: 'docs/intake/2026-06-12-qmd.md',
      classifierDecision: 'rule:source-kind:repo',
      autoFiled: false,
      createdAt: new Date(),
    });
    const [row] = await db.select().from(memoryCandidates).where(eq(memoryCandidates.id, 'c1'));
    expect(row!.sourceKind).toBe('repo');
    expect(row!.dossierPath).toBe('docs/intake/2026-06-12-qmd.md');
    expect(row!.classifierDecision).toBe('rule:source-kind:repo');
    expect(row!.autoFiled).toBe(false);
  });

  it('legacy inserts (no provenance) still work — columns are nullable/backfilled', async () => {
    const db = getDb();
    await db.insert(memoryCandidates).values({
      id: 'c2', sourceTaskId: null, type: 'project', body: 'legacy', status: 'pending',
      createdAt: new Date(),
    });
    const [row] = await db.select().from(memoryCandidates).where(eq(memoryCandidates.id, 'c2'));
    expect(row!.sourceKind).toBeNull();
    expect(row!.autoFiled).toBe(false);
  });
});
