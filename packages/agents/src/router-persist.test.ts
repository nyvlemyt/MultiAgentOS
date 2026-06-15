import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolve, dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { unlinkSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb, closeDb, events } from '@mas/db';
import { loadBlockedWindows, type Db } from './dispatch';

const MIGRATIONS_FOLDER = resolve(dirname(fileURLToPath(import.meta.url)), '../../db/migrations');
const WINDOW_TTL_MS = 5 * 60 * 60 * 1000;

let db: Db;
let dbPath: string;

beforeEach(() => {
  dbPath = join(tmpdir(), `mas-${randomUUID()}.db`);
  db = getDb(dbPath);
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
});

afterEach(() => {
  closeDb();
  unlinkSync(dbPath);
});

async function insertBlocked(source: string, blockedAt: number, createdAt: Date): Promise<void> {
  await db.insert(events).values({
    id: `evt_${randomUUID()}`,
    type: 'window_blocked',
    payloadJson: JSON.stringify({ source, blockedAt }),
    createdAt,
  });
}

describe('loadBlockedWindows', () => {
  it('returns only in-TTL sources, dropping expired rows', async () => {
    const now = new Date(10_000_000);
    await insertBlocked('gemini-free', 9_900_000, new Date(now.getTime() - 60_000));
    await insertBlocked('openai', 1_000, new Date(now.getTime() - WINDOW_TTL_MS - 60_000));

    const map = await loadBlockedWindows(db, now);
    expect(map).toEqual({ 'gemini-free': 9_900_000 });
  });

  it('keeps the newest blockedAt when a source has multiple rows', async () => {
    const now = new Date(10_000_000);
    await insertBlocked('gemini-free', 9_800_000, new Date(now.getTime() - 120_000));
    await insertBlocked('gemini-free', 9_950_000, new Date(now.getTime() - 30_000));

    const map = await loadBlockedWindows(db, now);
    expect(map).toEqual({ 'gemini-free': 9_950_000 });
  });
});
