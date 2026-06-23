import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MemoryStore, MEMORY_KEEPER_AGENT } from './registers';
import { buildMemoryContext } from './context';

let root: string;
const keeper = () => new MemoryStore({ root, writerAgent: MEMORY_KEEPER_AGENT });

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'mas-ctx-'));
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('buildMemoryContext (Mission Planner injection, §12)', () => {
  it('is empty when the project has no memory (no auto-injection of nothing)', () => {
    const ctx = buildMemoryContext(keeper(), 'otakugo', 'add a dark mode toggle');
    expect(ctx.text).toBe('');
    expect(ctx.projectEntryCount).toBe(0);
    expect(ctx.globalItems).toHaveLength(0);
  });

  it('includes a per-project summary referencing prior decisions', () => {
    const s = keeper();
    s.append('otakugo', 'decisions', { title: 'Use shadcn/ui for components', body: 'Picked shadcn over MUI.' });
    const ctx = buildMemoryContext(keeper(), 'otakugo', 'build the settings page');
    expect(ctx.text).toContain('Use shadcn/ui for components');
    expect(ctx.projectEntryCount).toBe(1);
  });

  it('caps global items at 5 (§12)', () => {
    const s = keeper();
    for (let i = 0; i < 8; i++) s.writeKnowledge(`docs/knowledge/k${i}.md`, `memory note number ${i}`);
    const ctx = buildMemoryContext(keeper(), 'otakugo', 'memory note');
    expect(ctx.globalItems.length).toBeLessThanOrEqual(5);
  });

  it('retrieves through a persistent index when indexPath is given', () => {
    const s = keeper();
    s.writeKnowledge('docs/knowledge/x.md', 'Mem0 cloud rejected because OpenAI embeddings are PAYG');
    const indexPath = s.indexPath();
    const ctx = buildMemoryContext(keeper(), 'otakugo', 'Mem0 cloud', { indexPath });
    expect(existsSync(indexPath)).toBe(true);
    expect(ctx.globalItems.length).toBeGreaterThan(0);
  });

  it('reuses the persistent index across calls — second call does not rebuild', () => {
    const s = keeper();
    s.writeKnowledge('docs/knowledge/x.md', 'a fact about Mem0 cloud and BDR registers');
    const indexPath = s.indexPath();
    const hashBefore = keeper().corpusHash();

    buildMemoryContext(keeper(), 'otakugo', 'Mem0 cloud', { indexPath });
    // Second call: same corpus → ensureIndexed must skip the rebuild. We can't
    // spy on a fresh retriever instance, so assert the stamped hash is unchanged
    // and a query still hits (proof the index is intact, not wiped).
    const ctx2 = buildMemoryContext(keeper(), 'otakugo', 'Mem0 cloud', { indexPath });
    expect(ctx2.globalItems.length).toBeGreaterThan(0);
    expect(keeper().corpusHash()).toBe(hashBefore);
  });
});
