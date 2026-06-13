import { beforeEach, afterEach } from 'vitest';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb, closeDb } from '@mas/db';

/**
 * Test-only helper (not exported from the package index): fresh temp SQLite DB
 * per test, migrated, deleted afterwards. Deduplicates the per-suite
 * beforeEach/afterEach boilerplate.
 */
export function useTestDb(migrationsFolder: string): void {
  let dbPath: string;
  beforeEach(() => {
    dbPath = join(tmpdir(), `mas-${randomUUID()}.db`);
    migrate(getDb(dbPath), { migrationsFolder });
  });
  afterEach(() => {
    closeDb();
    unlinkSync(dbPath);
  });
}
