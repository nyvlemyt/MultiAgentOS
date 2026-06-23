import { FtsRetriever, ensureIndexed, type MemoryHit } from './retriever';
import { MemoryStore, type RegisterKind } from './registers';

export interface MemoryContext {
  /** System-prompt block, or '' when the project has no memory. */
  text: string;
  projectEntryCount: number;
  globalItems: MemoryHit[];
}

export interface MemoryContextOpts {
  /**
   * Path of a persistent search index (e.g. data/memory/index.db). When set, the
   * index is reused across calls and rebuilt only when corpusHash() changes —
   * avoiding a full re-index on every query. Omit for the in-memory path.
   */
  indexPath?: string;
}

/** §12 cap — never inject more than 5 global memory items per mission call. */
export const MAX_GLOBAL_ITEMS = 5;

const SUMMARY_KINDS: RegisterKind[] = ['decisions', 'learnings', 'blockers'];

/** Retrieve ≤5 relevant global items, persistent index when indexPath is set. */
function retrieveGlobalItems(store: MemoryStore, query: string, indexPath?: string): MemoryHit[] {
  const retriever = indexPath ? new FtsRetriever({ indexPath }) : new FtsRetriever();
  try {
    if (indexPath) ensureIndexed(retriever, store);
    else retriever.index(store.allDocs());
    return retriever.query(query, { scope: 'global', limit: MAX_GLOBAL_ITEMS });
  } finally {
    retriever.close();
  }
}

/**
 * Build the on-demand memory block injected into the Mission Planner / executor
 * system prompt: a per-project summary (recent BDR/LRN/BLK) + ≤5 relevant global
 * items retrieved for the mission query. Returns '' when there is nothing to inject
 * (no auto-injection of empty context — memory-patterns anti-pattern §297).
 */
export function buildMemoryContext(
  store: MemoryStore,
  projectId: string,
  query: string,
  opts: MemoryContextOpts = {},
): MemoryContext {
  const projectLines: string[] = [];
  let projectEntryCount = 0;
  for (const kind of SUMMARY_KINDS) {
    const entries = store.read(projectId, kind);
    projectEntryCount += entries.length;
    for (const e of entries.slice(-3)) projectLines.push(`- [${e.id}] ${e.title}`);
  }

  const globalItems = retrieveGlobalItems(store, query, opts.indexPath);

  if (projectEntryCount === 0 && globalItems.length === 0) {
    return { text: '', projectEntryCount, globalItems };
  }

  const parts: string[] = ['## Project memory (second brain)'];
  if (projectLines.length > 0) {
    parts.push('Prior decisions / learnings / blockers on this project:', ...projectLines);
  }
  if (globalItems.length > 0) {
    parts.push('', 'Relevant global knowledge:');
    for (const g of globalItems) parts.push(`- ${g.title}: ${g.body.slice(0, 160).replace(/\s+/g, ' ').trim()}`);
  }

  return { text: parts.join('\n'), projectEntryCount, globalItems };
}
