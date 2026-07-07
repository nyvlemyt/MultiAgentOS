import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb, closeDb, memoryCandidates } from '@mas/db';
import { ExtractorRegistry } from './extractor';
import { inferKind, captureOne, captureInbox, formatSummary } from './cli';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = resolve(__dirname, '../../../db/migrations');

let dbPath: string;
let inbox: string;
beforeEach(() => {
  dbPath = join(tmpdir(), `mas-${randomUUID()}.db`);
  migrate(getDb(dbPath), { migrationsFolder: MIGRATIONS_FOLDER });
  inbox = mkdtempSync(join(tmpdir(), 'mas-inbox-'));
});
afterEach(() => { closeDb(); unlinkSync(dbPath); rmSync(inbox, { recursive: true, force: true }); });

function fakeRegistry() {
  const r = new ExtractorRegistry();
  r.register('pdf', async (_k, s) => ({ markdown: `learning from ${s}`, source_key: `pdf:${s}`, trust: 'untrusted' as const }));
  return r;
}

describe('inferKind', () => {
  it('maps .pdf to pdf, http(s) to url, else unknown', () => {
    expect(inferKind('/a/b.pdf')).toBe('pdf');
    expect(inferKind('https://x.com/y')).toBe('url');
    expect(inferKind('/a/b.xyz')).toBe('unknown');
  });

  it('routes office documents to the docx/pptx leaves, case-insensitive', () => {
    expect(inferKind('/a/b.docx')).toBe('docx');
    expect(inferKind('/a/b.pptx')).toBe('pptx');
    expect(inferKind('/a/B.DOCX')).toBe('docx');
    expect(inferKind('/a/B.PPTX')).toBe('pptx');
  });
});

describe('inferKind (web/video)', () => {
  it('routes YouTube hosts to the youtube leaf', () => {
    expect(inferKind('https://www.youtube.com/watch?v=abc')).toBe('youtube');
    expect(inferKind('https://youtu.be/abc')).toBe('youtube');
  });
  it('routes other http(s) to the url leaf', () => {
    expect(inferKind('https://help.obsidian.md/bases')).toBe('url');
  });
  it('keeps pdf + unknown routing', () => {
    expect(inferKind('/x/y.pdf')).toBe('pdf');
    expect(inferKind('/x/y.xyz')).toBe('unknown');
  });
});

describe('captureOne', () => {
  it('captures a single pdf path as a pending candidate', async () => {
    const db = getDb();
    const f = join(inbox, 'one.pdf'); writeFileSync(f, 'bytes');
    const res = await captureOne(db, f, { registry: fakeRegistry() });
    expect(res.pending).toHaveLength(1);
  });
});

describe('captureInbox', () => {
  it('treats a subfolder as a matière (manifest) and loose files as singles', async () => {
    const db = getDb();
    writeFileSync(join(inbox, 'loose.pdf'), 'x');
    const sub = join(inbox, 'governance'); mkdirSync(sub);
    writeFileSync(join(sub, 'a.pdf'), 'x'); writeFileSync(join(sub, 'b.pdf'), 'x');
    const res = await captureInbox(db, inbox, { registry: fakeRegistry() });
    // 1 loose single + (1 mother + 2 children) = 4 pending
    expect(res.pending).toHaveLength(4);
    const rows = await db.select().from(memoryCandidates);
    expect(rows.map((r) => r.sourceKey)).toContain('matiere:governance');
  });
});

describe('formatSummary', () => {
  it('renders pending/failed/rejected counts', () => {
    const s = formatSummary({ pending: ['a', 'b'], failed: ['c'], rejected: [{ reason: 'r', body: 'x' }] });
    expect(s).toContain('2 pending');
    expect(s).toContain('1 failed');
    expect(s).toContain('1 rejected');
  });
});
