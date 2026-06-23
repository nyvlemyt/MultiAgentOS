import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  FtsRetriever,
  QmdRetriever,
  UnifiedRetriever,
  createRetriever,
  retrievalDoctor,
  ensureIndexed,
  type MemoryDoc,
  type MemoryHit,
  type MemoryRetriever,
} from './retriever';

const docs: MemoryDoc[] = [
  {
    id: 'BDR-001',
    scope: 'project',
    source: 'data/memory/otakugo/decisions.md',
    title: 'Capture mechanism = close-out ritual',
    body: 'Chose the close-out ritual over agentmemory hooks and Mem0 cloud because Mem0 cloud needs OpenAI embeddings (PAYG, forbidden §11).',
  },
  {
    id: 'KN-memory-patterns',
    scope: 'global',
    source: 'data/memory/_global/knowledge/memory-patterns.md',
    title: 'memory-patterns',
    body: 'Three levels of memory: storage, recall, judgment. 40% Gartner adoption per Structurer AVANT.',
  },
  {
    id: 'LRN-001',
    scope: 'project',
    source: 'data/memory/otakugo/learnings.md',
    title: 'Vitest config quirk',
    body: 'Unrelated note about test runner configuration and node environment.',
  },
];

describe('FtsRetriever', () => {
  it('returns a hit for an exact term match', () => {
    const r = new FtsRetriever();
    r.index(docs);
    const hits = r.query('Mem0 cloud');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]!.id).toBe('BDR-001');
  });

  it('ranks the more relevant document first (BM25)', () => {
    const r = new FtsRetriever();
    r.index(docs);
    const hits = r.query('memory levels storage');
    expect(hits[0]!.id).toBe('KN-memory-patterns');
  });

  it('respects the limit option', () => {
    const r = new FtsRetriever();
    r.index(docs);
    const hits = r.query('memory', { limit: 1 });
    expect(hits).toHaveLength(1);
  });

  it('filters by scope', () => {
    const r = new FtsRetriever();
    r.index(docs);
    const hits = r.query('memory', { scope: 'global' });
    expect(hits.every((h) => h.scope === 'global')).toBe(true);
  });

  it('does not throw on FTS special characters in the query', () => {
    const r = new FtsRetriever();
    r.index(docs);
    expect(() => r.query('"40% Gartner" (per AVANT) - test')).not.toThrow();
    expect(r.query('40% Gartner').length).toBeGreaterThan(0);
  });

  it('re-indexing replaces the previous corpus', () => {
    const r = new FtsRetriever();
    r.index(docs);
    r.index([docs[0]!]);
    expect(r.query('memory levels')).toHaveLength(0);
    expect(r.query('Mem0 cloud')).toHaveLength(1);
  });
});

describe('FtsRetriever — persistent index (Phase 9 · 0a)', () => {
  let dir: string;
  let indexPath: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'mas-fts-'));
    indexPath = join(dir, 'index.db');
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('persists the index across reopen — no re-index needed to query', () => {
    const a = new FtsRetriever({ indexPath });
    a.index(docs, 'hash-1');
    a.close();

    const b = new FtsRetriever({ indexPath });
    expect(b.query('Mem0 cloud').length).toBeGreaterThan(0);
    b.close();
  });

  it('records the corpus hash and exposes it via indexedHash()', () => {
    const a = new FtsRetriever({ indexPath });
    expect(a.indexedHash()).toBeNull();
    a.index(docs, 'hash-1');
    expect(a.indexedHash()).toBe('hash-1');
    a.close();

    const b = new FtsRetriever({ indexPath });
    expect(b.indexedHash()).toBe('hash-1');
    b.close();
  });

  it('ensureIndexed skips when the corpus hash is unchanged', () => {
    const corpus = { corpusHash: () => 'hash-1', allDocs: () => docs };
    const a = new FtsRetriever({ indexPath });
    a.index(docs, corpus.corpusHash());
    a.close();

    const b = new FtsRetriever({ indexPath });
    expect(ensureIndexed(b, corpus)).toBe(false);
    expect(b.query('Mem0 cloud').length).toBeGreaterThan(0);
    b.close();
  });

  it('ensureIndexed rebuilds when the corpus hash changes', () => {
    const a = new FtsRetriever({ indexPath });
    a.index([docs[0]!], 'hash-1');
    a.close();

    const corpus = { corpusHash: () => 'hash-2', allDocs: () => docs };
    const b = new FtsRetriever({ indexPath });
    expect(ensureIndexed(b, corpus)).toBe(true);
    expect(b.indexedHash()).toBe('hash-2');
    expect(b.query('memory levels storage').length).toBeGreaterThan(0);
    b.close();
  });

  it('ensureIndexed builds a fresh empty index on first use', () => {
    const corpus = { corpusHash: () => 'hash-fresh', allDocs: () => docs };
    const r = new FtsRetriever({ indexPath });
    expect(ensureIndexed(r, corpus)).toBe(true);
    expect(r.indexedHash()).toBe('hash-fresh');
    r.close();
  });
});

describe('FtsRetriever — projectId filter (Phase 9 · 0a renforcée)', () => {
  const pdocs: MemoryDoc[] = [
    { id: 'otakugo/BDR-001', scope: 'project', source: 'data/memory/otakugo/decisions.md', title: 'dark mode toggle', body: 'chose a dark mode toggle for the settings page' },
    { id: 'webapp/BDR-001', scope: 'project', source: 'data/memory/webapp/decisions.md', title: 'webapp dark mode', body: 'webapp also gets a dark mode toggle decision' },
  ];

  it('restricts project hits to one project', () => {
    const r = new FtsRetriever();
    r.index(pdocs);
    const hits = r.query('dark mode toggle', { scope: 'project', projectId: 'otakugo' });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((h) => h.id.startsWith('otakugo/'))).toBe(true);
  });

  it('does not leak another project', () => {
    const r = new FtsRetriever();
    r.index(pdocs);
    const hits = r.query('dark mode toggle', { scope: 'project', projectId: 'webapp' });
    expect(hits.every((h) => h.id.startsWith('webapp/'))).toBe(true);
  });
});

// A fake `qmd` binary that prints a fixed --json result and exits 0 on `status`.
const QMD_FIXTURE = JSON.stringify([
  { docid: '#1', score: 0.9, file: 'qmd://mas-memory/otakugo/decisions.md', line: 1, title: 'dark mode', snippet: 'chose dark mode' },
  { docid: '#2', score: 0.8, file: 'qmd://mas-knowledge/memory-patterns.md', line: 1, title: 'memory-patterns', snippet: 'three levels of memory' },
  { docid: '#3', score: 0.7, file: 'qmd://mas-memory/webapp/decisions.md', line: 1, title: 'auth', snippet: 'auth flow decision' },
  { docid: '#4', score: 0.6, file: 'qmd://mas-arsenal/skill/agent-eval.md', line: 1, title: 'agent-eval', snippet: 'eval skill' },
]);

function writeFakeQmd(dir: string, body: string, withIndex = true): string {
  const bin = join(dir, 'qmd-fake');
  // Banner line before JSON exercises the defensive parser (parseQmdJson).
  writeFileSync(bin, `#!/bin/sh\nif [ "$1" = "status" ]; then exit 0; fi\necho "Gathering information"\ncat <<'EOF'\n${body}\nEOF\n`, 'utf8');
  chmodSync(bin, 0o755);
  if (withIndex) mkdirSync(join(dir, '.qmd'), { recursive: true });
  return bin;
}

describe('QmdRetriever (Phase 9 · 0a renforcée)', () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'mas-qmd-'));
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('available() is true with a .qmd index and a working binary', () => {
    const bin = writeFakeQmd(dir, QMD_FIXTURE);
    expect(QmdRetriever.available(dir, bin)).toBe(true);
  });

  it('available() is false without a .qmd index', () => {
    const bin = writeFakeQmd(dir, QMD_FIXTURE, false);
    expect(QmdRetriever.available(dir, bin)).toBe(false);
  });

  it('maps qmd:// paths to scope/project and parses through a banner line', () => {
    const bin = writeFakeQmd(dir, QMD_FIXTURE);
    const r = new QmdRetriever({ cwd: dir, bin });
    const hits = r.query('memory', { limit: 10 });
    expect(hits.length).toBe(4);
    const memHit = hits.find((h) => h.id === 'mas-memory/otakugo/decisions.md')!;
    expect(memHit.scope).toBe('project');
    expect(memHit.source).toBe('data/memory/otakugo/decisions.md');
    const knHit = hits.find((h) => h.id.startsWith('mas-knowledge/'))!;
    expect(knHit.scope).toBe('global');
  });

  it('filters by scope=global', () => {
    const bin = writeFakeQmd(dir, QMD_FIXTURE);
    const r = new QmdRetriever({ cwd: dir, bin });
    const hits = r.query('memory', { scope: 'global', limit: 10 });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((h) => h.scope === 'global')).toBe(true);
  });

  it('filters by projectId', () => {
    const bin = writeFakeQmd(dir, QMD_FIXTURE);
    const r = new QmdRetriever({ cwd: dir, bin });
    const hits = r.query('memory', { scope: 'project', projectId: 'otakugo', limit: 10 });
    expect(hits.map((h) => h.id)).toEqual(['mas-memory/otakugo/decisions.md']);
  });

  it('restricts to allow-listed collections', () => {
    const bin = writeFakeQmd(dir, QMD_FIXTURE);
    const r = new QmdRetriever({ cwd: dir, bin, collections: ['mas-arsenal'] });
    const hits = r.query('eval', { limit: 10 });
    expect(hits.map((h) => h.id)).toEqual(['mas-arsenal/skill/agent-eval.md']);
  });
});

describe('UnifiedRetriever (QMD primary, FTS fallback)', () => {
  const throwing: MemoryRetriever = {
    query() {
      throw new Error('qmd down');
    },
  };
  const empty: MemoryRetriever = { query: () => [] };

  it('falls back to FTS when the primary throws', () => {
    const fts = new FtsRetriever();
    fts.index(docs);
    let fellBack = false;
    const u = new UnifiedRetriever(throwing, fts, () => {
      fellBack = true;
    });
    const hits = u.query('Mem0 cloud');
    expect(hits.length).toBeGreaterThan(0);
    expect(fellBack).toBe(true);
  });

  it('does NOT fall back on an empty (but valid) primary result', () => {
    const fts = new FtsRetriever();
    fts.index(docs);
    let fellBack = false;
    const u = new UnifiedRetriever(empty, fts, () => {
      fellBack = true;
    });
    const hits: MemoryHit[] = u.query('Mem0 cloud');
    expect(hits).toHaveLength(0);
    expect(fellBack).toBe(false);
  });
});

describe('createRetriever (backend selection, ADR 0003 amendment)', () => {
  const corpus = { corpusHash: () => 'h', allDocs: () => docs };

  it('returns an FTS retriever when backend=fts', () => {
    const r = createRetriever({ cwd: '/nonexistent', corpus, backend: 'fts' });
    expect(r.query('Mem0 cloud').length).toBeGreaterThan(0);
  });

  it('degrades to FTS when QMD is unavailable (auto)', () => {
    let warned = false;
    const r = createRetriever({ cwd: '/nonexistent', corpus, backend: 'qmd', onFallback: () => { warned = true; } });
    expect(r.query('Mem0 cloud').length).toBeGreaterThan(0);
    expect(warned).toBe(true);
  });
});

describe('retrievalDoctor (boot diagnostic, never silent)', () => {
  let dir: string;
  let savedEnv: string | undefined;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'mas-doctor-'));
    savedEnv = process.env['MAS_RETRIEVAL_BACKEND'];
    delete process.env['MAS_RETRIEVAL_BACKEND'];
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
    if (savedEnv === undefined) delete process.env['MAS_RETRIEVAL_BACKEND'];
    else process.env['MAS_RETRIEVAL_BACKEND'] = savedEnv;
  });

  it('reports qmd active with a binary and a .qmd index', () => {
    const bin = writeFakeQmd(dir, QMD_FIXTURE);
    const d = retrievalDoctor(dir, bin);
    expect(d.qmdActive).toBe(true);
    expect(d.message).toContain('QMD détecté');
  });

  it('tells the user to run pnpm qmd:setup when QMD is absent', () => {
    const d = retrievalDoctor(dir, join(dir, 'no-such-bin'));
    expect(d.qmdActive).toBe(false);
    expect(d.binFound).toBe(false);
    expect(d.message).toContain('pnpm qmd:setup');
  });

  it('distinguishes installed-but-unindexed (binary present, no .qmd)', () => {
    const bin = writeFakeQmd(dir, QMD_FIXTURE, false);
    const d = retrievalDoctor(dir, bin);
    expect(d.qmdActive).toBe(false);
    expect(d.binFound).toBe(true);
    expect(d.indexFound).toBe(false);
    expect(d.message).toContain('index absent');
  });

  it('honors MAS_RETRIEVAL_BACKEND=fts as a forced fallback', () => {
    const bin = writeFakeQmd(dir, QMD_FIXTURE);
    process.env['MAS_RETRIEVAL_BACKEND'] = 'fts';
    const d = retrievalDoctor(dir, bin);
    expect(d.qmdActive).toBe(false);
    expect(d.forcedFts).toBe(true);
  });
});
