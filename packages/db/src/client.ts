import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as schema from './schema.js';

function findRepoRoot(): string {
  // walk up from this file looking for pnpm-workspace.yaml
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 10; i++) {
    if (existsSync(resolve(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

const DEFAULT_DB_PATH = process.env.MAS_DB_PATH
  ? resolve(process.env.MAS_DB_PATH)
  : resolve(findRepoRoot(), 'data/mas.db');

let _db: BetterSQLite3Database<typeof schema> | undefined;
let _sqlite: Database.Database | undefined;

export function getDb(dbPath: string = DEFAULT_DB_PATH) {
  if (_db) return _db;
  mkdirSync(dirname(dbPath), { recursive: true });
  _sqlite = new Database(dbPath);
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
