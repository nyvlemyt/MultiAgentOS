import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { MemoryStore, MEMORY_KEEPER_AGENT } from '@mas/memory';

// pattern from packages/db/src/client.ts:12 (findRepoRoot walk-up)
function findRepoRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 10; i++) {
    if (existsSync(resolve(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

export function memoryRoot(): string {
  return process.env.MAS_MEMORY_ROOT ?? resolve(findRepoRoot(), 'data/memory');
}

/** Read-only view of the store (no writer identity — cannot mutate). */
export function readStore(): MemoryStore {
  return new MemoryStore({ root: memoryRoot() });
}

/**
 * Memory Keeper-owned store. CLAUDE.md §8: the only path allowed to mutate
 * data/memory/. The /memory API routes are the UI surface of the Keeper.
 */
export function keeperStore(): MemoryStore {
  return new MemoryStore({ root: memoryRoot(), writerAgent: MEMORY_KEEPER_AGENT });
}
