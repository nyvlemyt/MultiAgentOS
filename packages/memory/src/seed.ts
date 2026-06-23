import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { MemoryStore, MEMORY_KEEPER_AGENT } from './registers';

export interface SeedResult {
  imported: string[];
  skipped: string[];
}

function walkMd(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...walkMd(full));
    else if (e.name.endsWith('.md')) out.push(full);
  }
  return out;
}

/**
 * PERSISTENCE BRIDGE (CLAUDE.md §13, ADR 0003). Idempotently import every
 * docs/knowledge/*.md (incl. vibeflow/INDEX.md) into data/memory/_global/knowledge/
 * with `source:` provenance, so build-time knowledge flows into runtime memory.
 * Re-running skips files already present — no duplicates.
 */
export function seedGlobalKnowledge(store: MemoryStore, knowledgeDir: string): SeedResult {
  const imported: string[] = [];
  const skipped: string[] = [];
  for (const file of walkMd(knowledgeDir).sort((a, b) => a.localeCompare(b))) {
    const rel = relative(knowledgeDir, file).replaceAll(/[/\\]/g, '/');
    const source = `docs/knowledge/${rel}`;
    if (store.hasKnowledge(source)) {
      skipped.push(source);
      continue;
    }
    store.writeKnowledge(source, readFileSync(file, 'utf8'));
    imported.push(source);
  }
  return { imported, skipped };
}

export interface RunSeedOpts {
  /** Root of the memory store, e.g. data/memory. */
  memoryRoot: string;
  /** Directory of build-time knowledge to import, e.g. docs/knowledge. */
  knowledgeDir: string;
}

/**
 * Bridge runner: construct a Keeper-identity MemoryStore and seed it. The store
 * is built here (not passed in) so callers (CLI, worker bootstrap) cannot smuggle
 * a non-Keeper writer past the §8 lock.
 */
export function runSeed({ memoryRoot, knowledgeDir }: RunSeedOpts): SeedResult {
  const store = new MemoryStore({ root: memoryRoot, writerAgent: MEMORY_KEEPER_AGENT });
  return seedGlobalKnowledge(store, knowledgeDir);
}
