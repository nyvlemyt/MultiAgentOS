import { describe, it, expect } from 'vitest';
import { FtsRetriever, type MemoryDoc } from './retriever';

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
