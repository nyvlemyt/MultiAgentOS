import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FtsRetriever, ensureIndexed, type MemoryDoc } from './retriever';

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
    expect(r.query('memory levels').length).toBe(0);
    expect(r.query('Mem0 cloud').length).toBe(1);
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
