import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MemoryStore, MEMORY_KEEPER_AGENT } from './registers';
import { seedGlobalKnowledge, runSeed } from './seed';
import { FtsRetriever } from './retriever';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE_DIR = resolve(__dirname, '../../..', 'docs/knowledge');

let root: string;
function keeperStore() {
  return new MemoryStore({ root, writerAgent: MEMORY_KEEPER_AGENT });
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'mas-seed-'));
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('seedGlobalKnowledge (persistence bridge)', () => {
  it('imports every docs/knowledge .md (incl. vibeflow/INDEX) with source provenance', () => {
    const res = seedGlobalKnowledge(keeperStore(), KNOWLEDGE_DIR);
    expect(res.imported.length).toBeGreaterThanOrEqual(17);
    expect(res.imported.some((s) => s.endsWith('vibeflow/INDEX.md'))).toBe(true);
    const docs = keeperStore().knowledgeDocs();
    expect(docs.every((d) => d.source.includes('docs/knowledge'))).toBe(true);
  });

  it('is idempotent — re-running creates no duplicate docs', () => {
    seedGlobalKnowledge(keeperStore(), KNOWLEDGE_DIR);
    const after1 = keeperStore().knowledgeDocs().length;
    const res2 = seedGlobalKnowledge(keeperStore(), KNOWLEDGE_DIR);
    expect(res2.skipped.length).toBeGreaterThan(0);
    expect(keeperStore().knowledgeDocs()).toHaveLength(after1);
  });

  it('BRIDGE GATE: every build-time fact is retrievable from runtime memory', () => {
    seedGlobalKnowledge(keeperStore(), KNOWLEDGE_DIR);
    const r = new FtsRetriever();
    r.index(keeperStore().allDocs());
    for (const fact of ['BDR', 'Mem0 cloud', '95% builders', '40% Gartner']) {
      const hits = r.query(fact);
      expect(hits.length, `fact not retrievable: "${fact}"`).toBeGreaterThan(0);
      expect(hits[0]!.source, `fact "${fact}" not traced to knowledge`).toContain('docs/knowledge');
    }
  });

  it('the write path is Keeper-locked (seed via a non-Keeper store throws)', () => {
    const intruder = new MemoryStore({ root, writerAgent: 'mission-planner' });
    expect(() => seedGlobalKnowledge(intruder, KNOWLEDGE_DIR)).toThrow();
  });
});

describe('runSeed (bridge runner — builds the Keeper store internally)', () => {
  it('seeds knowledge into memoryRoot and is idempotent', () => {
    const res = runSeed({ memoryRoot: root, knowledgeDir: KNOWLEDGE_DIR });
    expect(res.imported.length).toBeGreaterThanOrEqual(17);
    const count = keeperStore().knowledgeDocs().length;

    const res2 = runSeed({ memoryRoot: root, knowledgeDir: KNOWLEDGE_DIR });
    expect(res2.imported).toHaveLength(0);
    expect(res2.skipped.length).toBeGreaterThan(0);
    expect(keeperStore().knowledgeDocs()).toHaveLength(count);
  });
});
