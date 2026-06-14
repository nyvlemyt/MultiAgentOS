import { beforeEach, afterEach } from 'vitest';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb, closeDb } from './client';

const MIGRATIONS_FOLDER = resolve(dirname(fileURLToPath(import.meta.url)), '../migrations');

/**
 * Registers a fresh, migrated SQLite database per test via a temp file pointed at
 * by MAS_DB_PATH. Tears it down (close + unlink) after each test. Shared by the
 * @mas/db and @mas/web suites so the temp-db lifecycle lives in one place.
 */
export function setupTempDb(): void {
  let dbPath: string;
  beforeEach(() => {
    dbPath = join(tmpdir(), `mas-${randomUUID()}.db`);
    process.env.MAS_DB_PATH = dbPath;
    migrate(getDb(), { migrationsFolder: MIGRATIONS_FOLDER });
  });
  afterEach(() => {
    closeDb();
    try {
      unlinkSync(dbPath);
    } catch {
      /* ignore */
    }
    delete process.env.MAS_DB_PATH;
  });
}
