import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync, mkdtempSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import { getDb, closeDb, memoryCandidates, events } from '@mas/db';
import { runGatedIntake } from './intake-gate';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = resolve(__dirname, '../../db/migrations');

let dbPath: string;
let intakeDir: string;

beforeEach(() => {
  dbPath = join(tmpdir(), `mas-${randomUUID()}.db`);
  const db = getDb(dbPath);
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  intakeDir = mkdtempSync(join(tmpdir(), 'mas-gate-'));
});
afterEach(() => {
  closeDb();
  unlinkSync(dbPath);
  rmSync(intakeDir, { recursive: true, force: true });
});

describe('runGatedIntake (mas-sec-reviewer gate, §5)', () => {
  it('a note skips the security review and ingests directly', async () => {
    const db = getDb();
    const res = await runGatedIntake(db, { kind: 'note', title: 'n', body: 'b' }, { intakeDir });
    expect(res.kind).toBe('ingested');
    const secEvents = await db.select().from(events).where(eq(events.type, 'sec_review_verdict'));
    expect(secEvents).toHaveLength(0);
  });

  it('a repo ingests ONLY through a logged mas-sec-reviewer PASS', async () => {
    const db = getDb();
    const res = await runGatedIntake(
      db,
      { kind: 'repo', title: 'qmd', body: 'retriever', url: 'https://github.com/tobi/qmd' },
      { intakeDir },
    );
    expect(res.kind).toBe('ingested');
    if (res.kind === 'ingested') expect(existsSync(res.dossierPath)).toBe(true);
    const secEvents = await db.select().from(events).where(eq(events.type, 'sec_review_verdict'));
    expect(secEvents).toHaveLength(1);
    expect(JSON.parse(secEvents[0]!.payloadJson).verdict).toBe('PASS');
  });

  it('executing source code is risk:blocking → ALWAYS pauses for human, nothing ingested', async () => {
    const db = getDb();
    const res = await runGatedIntake(
      db,
      { kind: 'repo', title: 'evil', body: 'run install.sh', url: 'https://x.y/z', execute: true },
      { intakeDir },
    );
    expect(res.kind).toBe('paused_for_human');
    expect(await db.select().from(memoryCandidates)).toHaveLength(0);
    expect(readdirSync(intakeDir)).toHaveLength(0);
    const reqs = await db.select().from(events).where(eq(events.type, 'validation_requested'));
    expect(reqs).toHaveLength(1);
    expect(reqs[0]!.risk).toBe('blocking');
  });
});
