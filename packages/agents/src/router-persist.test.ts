import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolve, dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { unlinkSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb, closeDb, events } from '@mas/db';
import { RouterLLMClient, loadRoutingConfig } from '@mas/core';
import { loadBlockedWindows, type Db } from './dispatch';

const MIGRATIONS_FOLDER = resolve(dirname(fileURLToPath(import.meta.url)), '../../db/migrations');
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
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

// End-to-end durability seam (backlog DoD): a window blocked before a "restart"
// (persisted event) is still skipped by a FRESH RouterLLMClient hydrated from the
// DB, until the TTL elapses. Bridges loadBlockedWindows (db) → initialBlocked (core).
describe('router persistence — cross-restart seam', () => {
  it('a persisted block hydrates a fresh client as blocked, then frees after TTL', async () => {
    const nowMs = 10_000_000;
    await insertBlocked('gemini-free', nowMs - 60_000, new Date(nowMs - 60_000));

    const initialBlocked = await loadBlockedWindows(db, new Date(nowMs));
    const config = loadRoutingConfig(resolve(REPO_ROOT, 'config/model-routing.json'));

    // Fresh client (simulates a worker restart) hydrated from the DB-backed map.
    const blockedNow = new RouterLLMClient({
      config,
      env: {},
      clients: new Map(),
      initialBlocked,
      now: () => nowMs,
    });
    expect(blockedNow.getWindowState('gemini-free')).toBe('blocked');

    // Past the 5h window, the same persisted state reads fresh.
    const afterTtl = new RouterLLMClient({
      config,
      env: {},
      clients: new Map(),
      initialBlocked,
      now: () => nowMs + WINDOW_TTL_MS + 1,
    });
    expect(afterTtl.getWindowState('gemini-free')).toBe('fresh');
  });
});
