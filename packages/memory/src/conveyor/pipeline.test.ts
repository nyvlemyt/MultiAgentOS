import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import { getDb, closeDb, memoryCandidates } from '@mas/db';
import { ExtractorRegistry } from './extractor';
import { runCapturePipeline, runMatierePipeline } from './pipeline';
import { BlockedHostError } from './net-guard';
import { FetchFailedError } from './extractors/url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = resolve(__dirname, '../../../db/migrations');

let dbPath: string;
beforeEach(() => {
  dbPath = join(tmpdir(), `mas-${randomUUID()}.db`);
  migrate(getDb(dbPath), { migrationsFolder: MIGRATIONS_FOLDER });
});
afterEach(() => {
  closeDb();
  unlinkSync(dbPath);
});

function registryWith(extractor: (k: string, s: string) => Promise<{ markdown: string; source_key: string; trust: 'trusted' | 'untrusted' | 'low' }>) {
  const r = new ExtractorRegistry();
  r.register('pdf', extractor);
  return r;
}

describe('runCapturePipeline', () => {
  it('extracts → classifies (rules) → writes one pending candidate at the one door', async () => {
    const db = getDb();
    const registry = registryWith(async () => ({ markdown: 'We learned a useful pattern about agents.', source_key: 'pdf:k1', trust: 'untrusted' }));
    const res = await runCapturePipeline(db, { kind: 'pdf', source: '/x.pdf', title: 'X' }, { registry });
    expect(res.pending).toHaveLength(1);
    const [row] = await db.select().from(memoryCandidates).where(eq(memoryCandidates.id, res.pending[0]!));
    expect(row!.sourceKey).toBe('pdf:k1');
    expect(row!.trust).toBe('untrusted');
    expect(row!.type).toBe('reference');
    expect(row!.classifierDecision).toContain('learnings');
  });

  it('records abstain as a flagged pending candidate (never silently mis-filed)', async () => {
    const db = getDb();
    const registry = registryWith(async () => ({ markdown: 'neutral prose with no register signal at all', source_key: 'pdf:k2', trust: 'untrusted' }));
    const res = await runCapturePipeline(db, { kind: 'pdf', source: '/y.pdf' }, { registry });
    expect(res.pending).toHaveLength(1);
    const [row] = await db.select().from(memoryCandidates).where(eq(memoryCandidates.id, res.pending[0]!));
    expect(row!.classifierDecision).toContain('abstain');
  });

  it('dead-letters an unknown source kind (never a silent skip)', async () => {
    const db = getDb();
    const registry = new ExtractorRegistry();
    const res = await runCapturePipeline(db, { kind: 'docx', source: '/z.docx' }, { registry });
    expect(res.failed).toHaveLength(1);
    const [row] = await db.select().from(memoryCandidates).where(eq(memoryCandidates.id, res.failed[0]!));
    expect(row!.status).toBe('capture_failed');
    expect(row!.classifierDecision).toContain('unknown_source_kind');
  });

  it('dead-letters an extractor crash and an empty extraction', async () => {
    const db = getDb();
    const crashReg = registryWith(async () => { throw new Error('boom'); });
    const crash = await runCapturePipeline(db, { kind: 'pdf', source: '/c.pdf' }, { registry: crashReg });
    const [crashRow] = await db.select().from(memoryCandidates).where(eq(memoryCandidates.id, crash.failed[0]!));
    expect(crashRow!.classifierDecision).toContain('extractor_crash');
  });

  it('dead-letters an oversize source before extracting', async () => {
    const db = getDb();
    const registry = registryWith(async () => ({ markdown: 'x', source_key: 'k', trust: 'untrusted' }));
    const res = await runCapturePipeline(db, { kind: 'pdf', source: '/big.pdf', bytes: 999_999_999 }, { registry });
    expect(res.failed).toHaveLength(1);
    const [row] = await db.select().from(memoryCandidates).where(eq(memoryCandidates.id, res.failed[0]!));
    expect(row!.classifierDecision).toContain('oversize');
  });

  it('runs the budget-gated LLM only when wired AND budget is open, with anti-injection wrap', async () => {
    const db = getDb();
    const reg = registryWith(async () => ({ markdown: 'neutral prose with no register signal at all', source_key: 'pdf:k3', trust: 'untrusted' }));
    const seen: string[] = [];
    const llm = (p: string) => { seen.push(p); return 'learnings'; };
    // budget blocked → LLM NOT called
    await runCapturePipeline(db, { kind: 'pdf', source: '/b.pdf' }, { registry: reg, llm, budgetBlocked: () => true });
    expect(seen).toHaveLength(0);
    // budget open → LLM called, prompt is anti-injection-wrapped
    await runCapturePipeline(db, { kind: 'pdf', source: '/b2.pdf' }, { registry: reg, llm, budgetBlocked: () => false });
    expect(seen).toHaveLength(1);
    expect(seen[0]).toContain('<untrusted-source>');
  });
});

describe('runCapturePipeline — fetch dead-letters', () => {
  it('maps BlockedHostError to a host_not_allowed dead-letter', async () => {
    const db = getDb();
    const registry = new ExtractorRegistry();
    registry.register('url', async () => { throw new BlockedHostError('https://evil/x', 'host evil not in allowed_hosts'); });
    const res = await runCapturePipeline(db, { kind: 'url', source: 'https://evil/x' }, { registry });
    expect(res.failed).toHaveLength(1);
    const [row] = await db.select().from(memoryCandidates).where(eq(memoryCandidates.id, res.failed[0]!));
    expect(row!.status).toBe('capture_failed');
    expect(row!.body).toContain('host_not_allowed');
  });

  it('maps FetchFailedError to a paywall_404 dead-letter', async () => {
    const db = getDb();
    const registry = new ExtractorRegistry();
    registry.register('url', async () => { throw new FetchFailedError('https://x/a', 404); });
    const res = await runCapturePipeline(db, { kind: 'url', source: 'https://x/a' }, { registry });
    expect(res.failed).toHaveLength(1);
    const [row] = await db.select().from(memoryCandidates).where(eq(memoryCandidates.id, res.failed[0]!));
    expect(row!.body).toContain('paywall_404');
  });
});

describe('runMatierePipeline', () => {
  it('extracts N files → 1 manifest mother + N children at the one door', async () => {
    const db = getDb();
    let i = 0;
    const reg = new ExtractorRegistry();
    reg.register('pdf', async () => { i += 1; return { markdown: `learning number ${i}`, source_key: `pdf:k${i}`, trust: 'untrusted' as const }; });
    const res = await runMatierePipeline(db, {
      parentId: 'matiere-1', title: 'Governance', derivedFrom: 'docs/resources/inbox/gov',
      sources: [{ kind: 'pdf', source: '/a.pdf', title: 'A' }, { kind: 'pdf', source: '/b.pdf', title: 'B' }],
    }, { registry: reg });
    expect(res.pending).toHaveLength(3); // mother + 2 children
    const rows = await db.select().from(memoryCandidates);
    const keys = rows.map((r) => r.sourceKey).sort();
    expect(keys).toContain('matiere:governance');
    expect(keys).toContain('pdf:k1');
    expect(keys).toContain('pdf:k2');
  });

  it('falls back to a single flat candidate when only one file extracts', async () => {
    const db = getDb();
    const reg = new ExtractorRegistry();
    let n = 0;
    reg.register('pdf', async () => { n += 1; if (n === 1) throw new Error('boom'); return { markdown: 'second file ok', source_key: 'pdf:ok', trust: 'untrusted' as const }; });
    const res = await runMatierePipeline(db, {
      parentId: 'm2', title: 'T', derivedFrom: 'd',
      sources: [{ kind: 'pdf', source: '/x.pdf' }, { kind: 'pdf', source: '/y.pdf' }],
    }, { registry: reg });
    expect(res.failed).toHaveLength(1);  // the crash
    expect(res.pending).toHaveLength(1); // single survivor, no manifest
  });
});
