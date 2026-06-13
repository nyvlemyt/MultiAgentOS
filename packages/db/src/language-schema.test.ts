import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq, sql } from 'drizzle-orm';
import { getDb, closeDb } from './client';
import { projects } from './schema';

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

describe('Phase 3.5b migration 0006 — projects.language', () => {
  it('defaults new rows to fr', async () => {
    const db = getDb();
    await db.insert(projects).values({
      id: 'p_default',
      name: 'Default',
      slug: 'default',
      path: '/tmp/p',
      type: 'other',
    });
    const [row] = await db.select().from(projects).where(eq(projects.id, 'p_default'));
    expect(row?.language).toBe('fr');
  });

  it('round-trips an en project', async () => {
    const db = getDb();
    await db.insert(projects).values({
      id: 'p_en',
      name: 'English',
      slug: 'english',
      path: '/tmp/e',
      type: 'other',
      language: 'en',
    });
    const [row] = await db.select().from(projects).where(eq(projects.id, 'p_en'));
    expect(row?.language).toBe('en');
  });

  it('backfills legacy rows (inserted without the column) to fr', async () => {
    const db = getDb();
    // Simulate a legacy row written before the column existed: write via raw SQL
    // omitting language; the column default must supply 'fr'.
    db.run(
      sql`INSERT INTO projects (id, name, slug, path, type, createdAt, lastActiveAt) VALUES ('p_legacy', 'Legacy', 'legacy', '/tmp/l', 'other', 0, 0)`,
    );
    const [row] = await db.select().from(projects).where(eq(projects.id, 'p_legacy'));
    expect(row?.language).toBe('fr');
  });
});
