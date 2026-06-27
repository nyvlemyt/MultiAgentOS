import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getDb, closeDb } from './client';

// client.ts resolves the SQLite path from MAS_DB_PATH (absolute → verbatim,
// relative → resolved against the repo root) and walks up from cwd to find the
// pnpm-workspace.yaml marker. The dispatch/test suites always pass an absolute
// MAS_DB_PATH, so findRepoRoot() and the default-path branch were never exercised.
// These tests drive cwd + env directly. To make findRepoRoot load-bearing (a
// regression resolving against cwd instead of the repo root must FAIL), the
// relative/default cases put the marker at an OUTER dir and chdir into a
// marker-less SUBDIR, then assert the DB lands under the outer root, not the cwd.

const origCwd = process.cwd();
const origEnv = process.env.MAS_DB_PATH;
const cleanups: string[] = [];

afterEach(() => {
  closeDb();
  process.chdir(origCwd);
  if (origEnv === undefined) delete process.env.MAS_DB_PATH;
  else process.env.MAS_DB_PATH = origEnv;
  for (const p of cleanups.splice(0)) rmSync(p, { recursive: true, force: true });
});

function tempDir(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  cleanups.push(dir);
  return dir;
}

/** A temp dir carrying the pnpm-workspace.yaml marker findRepoRoot looks for. */
function markerDir(prefix: string): string {
  const dir = tempDir(prefix);
  writeFileSync(join(dir, 'pnpm-workspace.yaml'), 'packages: []\n');
  return dir;
}

/** A marker-less subdir of `parent`, made the cwd, so cwd ≠ repo root. */
function subCwd(parent: string): string {
  const sub = join(parent, 'sub');
  mkdirSync(sub);
  process.chdir(sub);
  return sub;
}

describe('getDb / closeDb', () => {
  it('uses an absolute MAS_DB_PATH verbatim, independent of cwd', () => {
    const elsewhere = tempDir('mas-elsewhere-');
    const cwdDir = tempDir('mas-cwd-'); // no marker
    process.chdir(cwdDir);
    const p = join(elsewhere, 'abs.db');
    process.env.MAS_DB_PATH = p;
    const db = getDb();
    expect(db).toBeTruthy();
    expect(existsSync(p)).toBe(true);
    // Absolute path is honoured as-is, never re-rooted under the cwd.
    expect(existsSync(join(cwdDir, 'data'))).toBe(false);
  });

  it('returns the same singleton on repeated calls until closeDb resets it', () => {
    const p = join(tempDir('mas-singleton-'), 'db.db');
    process.env.MAS_DB_PATH = p;
    const first = getDb();
    expect(getDb()).toBe(first);
    closeDb();
    const second = getDb();
    expect(second).not.toBe(first);
  });

  it('closeDb is idempotent when no database is open', () => {
    closeDb();
    expect(() => closeDb()).not.toThrow();
  });

  it('resolves a relative MAS_DB_PATH against the repo root, not cwd', () => {
    const outer = markerDir('mas-outer-');
    const sub = subCwd(outer);
    process.env.MAS_DB_PATH = join('data', 'rel.db');
    const db = getDb();
    expect(db).toBeTruthy();
    expect(existsSync(join(outer, 'data', 'rel.db'))).toBe(true); // resolved against the workspace root
    expect(existsSync(join(sub, 'data', 'rel.db'))).toBe(false); // NOT against the cwd
  });

  it('defaults to <repoRoot>/data/mas.db when MAS_DB_PATH is unset', () => {
    const outer = markerDir('mas-default-');
    const sub = subCwd(outer);
    delete process.env.MAS_DB_PATH;
    const db = getDb();
    expect(db).toBeTruthy();
    expect(existsSync(join(outer, 'data', 'mas.db'))).toBe(true);
    expect(existsSync(join(sub, 'data', 'mas.db'))).toBe(false);
  });

  it('ignores a blank MAS_DB_PATH and uses the default path', () => {
    const outer = markerDir('mas-blank-');
    const sub = subCwd(outer);
    process.env.MAS_DB_PATH = '';
    const db = getDb();
    expect(db).toBeTruthy();
    expect(existsSync(join(outer, 'data', 'mas.db'))).toBe(true);
    expect(existsSync(join(sub, 'data', 'mas.db'))).toBe(false);
  });

  it('falls back to the current directory when no workspace marker is found upward', () => {
    const nowhere = tempDir('mas-nomarker-');
    process.chdir(nowhere);
    const cwd = process.cwd();
    delete process.env.MAS_DB_PATH;
    const db = getDb();
    expect(db).toBeTruthy();
    expect(existsSync(join(cwd, 'data', 'mas.db'))).toBe(true);
  });
});
