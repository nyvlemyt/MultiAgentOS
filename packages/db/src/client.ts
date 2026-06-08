import { createRequire } from 'node:module';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import type BetterSqlite3 from 'better-sqlite3';
import * as schema from './schema';

const require_ = createRequire(import.meta.url);
type DatabaseCtor = new (filename: string, options?: BetterSqlite3.Options) => BetterSqlite3.Database;
const Database: DatabaseCtor = require_('better-sqlite3');

function findRepoRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 10; i++) {
    if (existsSync(resolve(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

function resolveDbPath(): string {
  const envPath = process.env.MAS_DB_PATH;
  if (envPath && envPath.length > 0) {
    return isAbsolute(envPath) ? envPath : resolve(findRepoRoot(), envPath);
  }
  return resolve(findRepoRoot(), 'data/mas.db');
}

let _db: BetterSQLite3Database<typeof schema> | undefined;
let _sqlite: BetterSqlite3.Database | undefined;

export function getDb(dbPath?: string) {
  if (_db) return _db;
  const p = dbPath ?? resolveDbPath();
  mkdirSync(dirname(p), { recursive: true });
  _sqlite = new Database(p);
  _sqlite.pragma('journal_mode = WAL');
  _sqlite.pragma('foreign_keys = ON');
  _db = drizzle(_sqlite, { schema });
  return _db;
}

export function closeDb() {
  _sqlite?.close();
  _db = undefined;
  _sqlite = undefined;
}

export { schema };
