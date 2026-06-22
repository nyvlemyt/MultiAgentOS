import { FtsRetriever, ensureIndexed, type MemoryHit, type MemoryRetriever, type MemoryScope } from './retriever';
import { MemoryStore, type RegisterKind } from './registers';

export interface MemoryContext {
  /** System-prompt block, or '' when the project has no memory. */
  text: string;
  projectEntryCount: number;
  globalItems: MemoryHit[];
  /** Project-scoped items retrieved by relevance (Phase 9 · 0a renforcée). */
  projectItems: MemoryHit[];
}

export interface MemoryContextOpts {
  /**
   * Path of a persistent search index (e.g. data/memory/index.db). When set, the
   * index is reused across calls and rebuilt only when corpusHash() changes —
   * avoiding a full re-index on every query. Omit for the in-memory path.
   * Ignored when `retriever` is provided.
   */
  indexPath?: string;
  /**
   * Inject the retrieval backend (Phase 9 · 0a renforcée). When set, both the
   * global and the project-relevance recall go through it — e.g. a UnifiedRetriever
   * (QMD primary, FTS fallback). When omitted, an in-process FtsRetriever is built
   * from the store (the Phase-4 default behaviour).
   */
  retriever?: MemoryRetriever;
}

/** §12 cap — never inject more than 5 global memory items per mission call. */
export const MAX_GLOBAL_ITEMS = 5;
/** Project-relevance cap — keep the injected block small (cost discipline, §12). */
export const MAX_PROJECT_ITEMS = 5;

const SUMMARY_KINDS: RegisterKind[] = ['decisions', 'learnings', 'blockers'];

/**
 * Retrieve relevant items for one scope. Uses the injected retriever when present
 * (QMD/Unified); otherwise builds an FtsRetriever from the store (persistent when
 * indexPath is set). Project scope is filtered to `projectId` so a query never
 * leaks another project's memory.
 */
function retrieveItems(
  store: MemoryStore,
  query: string,
  scope: MemoryScope,
  limit: number,
  opts: MemoryContextOpts,
  projectId?: string,
): MemoryHit[] {
  if (opts.retriever) {
    return opts.retriever.query(query, { scope, limit, projectId });
  }
  const retriever = opts.indexPath ? new FtsRetriever({ indexPath: opts.indexPath }) : new FtsRetriever();
  try {
    if (opts.indexPath) ensureIndexed(retriever, store);
    else retriever.index(store.allDocs());
    return retriever.query(query, { scope, limit, projectId });
  } finally {
    retriever.close();
  }
}

/**
 * Build the on-demand memory block injected into the Mission Planner / executor
 * system prompt: per-project memory + ≤5 relevant global items retrieved for the
 * mission query. Project memory is retrieved by RELEVANCE (Phase 9 · 0a renforcée)
 * and falls back to the most recent entries when the query matches nothing — so it
 * is never "only recency". Returns '' when there is nothing to inject (no
 * auto-injection of empty context — memory-patterns anti-pattern §297).
 */
export function buildMemoryContext(
  store: MemoryStore,
  projectId: string,
  query: string,
  opts: MemoryContextOpts = {},
): MemoryContext {
  let projectEntryCount = 0;
  for (const kind of SUMMARY_KINDS) projectEntryCount += store.read(projectId, kind).length;

  const projectItems = retrieveItems(store, query, 'project', MAX_PROJECT_ITEMS, opts, projectId);
  const globalItems = retrieveItems(store, query, 'global', MAX_GLOBAL_ITEMS, opts);

  // Relevance first; if the query matched no project entry, fall back to recency
  // so the block is never empty when the project has memory.
  const projectLines =
    projectItems.length > 0
      ? projectItems.map((p) => `- [${p.id.split('/').pop()}] ${p.title}`)
      : recentProjectLines(store, projectId);

  if (projectEntryCount === 0 && globalItems.length === 0) {
    return { text: '', projectEntryCount, globalItems, projectItems };
  }

  const parts: string[] = ['## Project memory (second brain)'];
  if (projectLines.length > 0) {
    parts.push('Relevant decisions / learnings / blockers on this project:', ...projectLines);
  }
  if (globalItems.length > 0) {
    parts.push('', 'Relevant global knowledge:');
    for (const g of globalItems) parts.push(`- ${g.title}: ${snippet(g.body)}`);
  }

  return { text: parts.join('\n'), projectEntryCount, globalItems, projectItems };
}

/** Most-recent BDR/LRN/BLK lines — recency fallback when relevance finds nothing. */
function recentProjectLines(store: MemoryStore, projectId: string): string[] {
  const lines: string[] = [];
  for (const kind of SUMMARY_KINDS) {
    for (const e of store.read(projectId, kind).slice(-3)) lines.push(`- [${e.id}] ${e.title}`);
  }
  return lines;
}

function snippet(body: string): string {
  return body.slice(0, 160).replace(/\s+/g, ' ').trim();
}
