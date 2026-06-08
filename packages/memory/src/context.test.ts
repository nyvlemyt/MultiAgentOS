import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
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
});
