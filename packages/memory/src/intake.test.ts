import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync, mkdtempSync, rmSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb, closeDb, memoryCandidates } from '@mas/db';
import { intakeSource, IntakeSecurityError } from './intake';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = resolve(__dirname, '../../db/migrations');

let dbPath: string;
let intakeDir: string;

beforeEach(() => {
  dbPath = join(tmpdir(), `mas-${randomUUID()}.db`);
  const db = getDb(dbPath);
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  intakeDir = mkdtempSync(join(tmpdir(), 'mas-intake-'));
});
afterEach(() => {
  closeDb();
  unlinkSync(dbPath);
  rmSync(intakeDir, { recursive: true, force: true });
});

describe('intakeSource (multi-source → dossier + candidate)', () => {
  it('a note produces an intake dossier and a pending candidate, no register write', async () => {
    const db = getDb();
    const res = await intakeSource(db, {
      kind: 'note',
      title: 'Effort mapping insight',
      body: 'project.defaultMode maps to the Claude effort parameter.',
    }, { intakeDir });

    expect(existsSync(res.dossierPath)).toBe(true);
    const dossier = readFileSync(res.dossierPath, 'utf8');
    expect(dossier).toContain('Effort mapping insight');
    expect(dossier).toContain('kind: note');

    const rows = await db.select().from(memoryCandidates);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.status).toBe('pending');
    expect(rows[0]!.body).toContain('effort parameter');
    expect(rows[0]!.sourceKind).toBe('note');
    expect(rows[0]!.dossierPath).toBe(res.dossierPath);
  });

  it('slugifies the dossier filename as <date>-<slug>.md', async () => {
    const db = getDb();
    await intakeSource(db, { kind: 'pattern', title: 'Røuter: façade #2!', body: 'b' }, { intakeDir });
    const files = readdirSync(intakeDir);
    expect(files).toHaveLength(1);
    expect(files[0]).toMatch(/^\d{4}-\d{2}-\d{2}-r-uter-fa-ade-2\.md$/);
  });

  it('REJECTS repo/course sources without an explicit security PASS (§5)', async () => {
    const db = getDb();
    for (const kind of ['repo', 'course'] as const) {
      await expect(
        intakeSource(db, { kind, title: 'x', body: 'y', url: 'https://github.com/a/b' }, { intakeDir }),
      ).rejects.toThrow(IntakeSecurityError);
    }
    expect(await db.select().from(memoryCandidates)).toHaveLength(0);
    expect(readdirSync(intakeDir)).toHaveLength(0);
  });

  it('accepts a repo source when secReviewPass is true', async () => {
    const db = getDb();
    const res = await intakeSource(db, {
      kind: 'repo', title: 'qmd', body: 'BM25+vector retriever', url: 'https://github.com/tobi/qmd',
    }, { intakeDir, secReviewPass: true });
    expect(existsSync(res.dossierPath)).toBe(true);
    expect(await db.select().from(memoryCandidates)).toHaveLength(1);
  });
});
