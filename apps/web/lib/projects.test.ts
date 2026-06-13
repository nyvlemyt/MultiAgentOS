import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb, closeDb, projects } from '@mas/db';
import { setProjectLanguage, PROJECT_LANGUAGES } from './projects';

const MIGRATIONS = resolve(dirname(fileURLToPath(import.meta.url)), '../../../packages/db/migrations');

let dbPath: string;
beforeEach(async () => {
  dbPath = join(tmpdir(), `mas-proj-${randomUUID()}.db`);
  process.env.MAS_DB_PATH = dbPath;
  migrate(getDb(), { migrationsFolder: MIGRATIONS });
  await getDb().insert(projects).values({
    id: 'p1', name: 'P', slug: 'p', path: join(tmpdir(), 'p'), type: 'other',
    createdAt: new Date(), lastActiveAt: new Date(),
  });
});
afterEach(() => {
  closeDb();
  try { unlinkSync(dbPath); } catch { /* ignore */ }
  delete process.env.MAS_DB_PATH;
});

describe('setProjectLanguage', () => {
  it('persists en and returns the updated project', async () => {
    const proj = await setProjectLanguage(getDb(), 'p1', 'en');
    expect(proj?.language).toBe('en');
    const [row] = await getDb().select().from(projects);
    expect(row?.language).toBe('en');
  });

  it('returns null for an unknown project id', async () => {
    const proj = await setProjectLanguage(getDb(), 'nope', 'en');
    expect(proj).toBeNull();
  });

  it('exposes the supported language enum', () => {
    expect(PROJECT_LANGUAGES).toEqual(['fr', 'en']);
  });
});
