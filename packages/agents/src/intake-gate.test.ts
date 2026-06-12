import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { eq } from 'drizzle-orm';
import { getDb, memoryCandidates, events } from '@mas/db';
import { MemoryStore, MEMORY_KEEPER_AGENT } from '@mas/memory';
import { runGatedIntake } from './intake-gate';
import { useTestDb } from './testing';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = resolve(__dirname, '../../db/migrations');

let intakeDir: string;

useTestDb(MIGRATIONS_FOLDER);
beforeEach(() => {
  intakeDir = mkdtempSync(join(tmpdir(), 'mas-gate-'));
});
afterEach(() => {
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

describe('auto-file for trusted sources (ADR 0004 §7)', () => {
  let memRoot: string;
  beforeEach(() => {
    memRoot = mkdtempSync(join(tmpdir(), 'mas-trust-'));
  });
  afterEach(() => {
    rmSync(memRoot, { recursive: true, force: true });
  });

  it('an allowlisted source is Keeper-promoted automatically (no manual triage)', async () => {
    const db = getDb();
    const store = new MemoryStore({ root: memRoot, writerAgent: MEMORY_KEEPER_AGENT });
    const res = await runGatedIntake(
      db,
      { kind: 'note', title: 'TIL eco', body: 'TIL: eco mode halves prose tokens.' },
      { intakeDir, trust: { trustedSources: ['TIL eco'] }, store },
    );
    expect(res.kind).toBe('ingested');
    if (res.kind === 'ingested') expect(res.autoFiled).toBe(true);
    const rows = await db.select().from(memoryCandidates);
    expect(rows[0]!.status).toBe('accepted');
    expect(rows[0]!.autoFiled).toBe(true);
    expect(rows[0]!.classifierDecision).toMatch(/^rule:/);
    expect(store.read('_global', 'learnings')).toHaveLength(1);
  });

  it('an unlisted source lands in the inbox (pending), nothing promoted', async () => {
    const db = getDb();
    const store = new MemoryStore({ root: memRoot, writerAgent: MEMORY_KEEPER_AGENT });
    const res = await runGatedIntake(
      db,
      { kind: 'note', title: 'random', body: 'TIL: something.' },
      { intakeDir, trust: { trustedSources: ['https://only-this.example'] }, store },
    );
    expect(res.kind).toBe('ingested');
    if (res.kind === 'ingested') expect(res.autoFiled).toBe(false);
    const rows = await db.select().from(memoryCandidates);
    expect(rows[0]!.status).toBe('pending');
    expect(store.read('_global', 'learnings')).toHaveLength(0);
  });

  it('a trusted source whose classification abstains stays in the inbox (zero LLM)', async () => {
    const db = getDb();
    const store = new MemoryStore({ root: memRoot, writerAgent: MEMORY_KEEPER_AGENT });
    const res = await runGatedIntake(
      db,
      // note kind + no keyword → rules abstain
      { kind: 'note', title: 'misc', body: 'quelques pensées diverses.' },
      { intakeDir, trust: { trustedSources: ['misc'] }, store },
    );
    expect(res.kind).toBe('ingested');
    if (res.kind === 'ingested') expect(res.autoFiled).toBe(false);
    const rows = await db.select().from(memoryCandidates);
    expect(rows[0]!.status).toBe('pending');
  });

  it('auto-file goes through the Keeper write-lock — a non-keeper store cannot promote', async () => {
    const db = getDb();
    const intruder = new MemoryStore({ root: memRoot, writerAgent: 'mission-planner' });
    const res = await runGatedIntake(
      db,
      { kind: 'note', title: 'TIL eco', body: 'TIL: eco mode halves prose tokens.' },
      { intakeDir, trust: { trustedSources: ['TIL eco'] }, store: intruder },
    );
    expect(res.kind).toBe('ingested');
    if (res.kind === 'ingested') expect(res.autoFiled).toBe(false);
    const rows = await db.select().from(memoryCandidates);
    expect(rows[0]!.status).toBe('pending'); // promotion refused, candidate intact
    // The refusal must be visible in /trace, not swallowed (Checker finding).
    const errs = await db.select().from(events).where(eq(events.type, 'auto_file_error'));
    expect(errs).toHaveLength(1);
  });
});
