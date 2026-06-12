import { FtsRetriever, type MemoryHit } from './retriever';
import { MemoryStore, type RegisterKind } from './registers';

export interface MemoryContext {
  /** System-prompt block, or '' when the project has no memory. */
  text: string;
  projectEntryCount: number;
  globalItems: MemoryHit[];
}

/** §12 cap — never inject more than 5 global memory items per mission call. */
export const MAX_GLOBAL_ITEMS = 5;

const SUMMARY_KINDS: RegisterKind[] = ['decisions', 'learnings', 'blockers'];

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
): MemoryContext {
  const projectLines: string[] = [];
  let projectEntryCount = 0;
  for (const kind of SUMMARY_KINDS) {
    const entries = store.read(projectId, kind);
    projectEntryCount += entries.length;
    for (const e of entries.slice(-3)) projectLines.push(`- [${e.id}] ${e.title}`);
  }

  const retriever = new FtsRetriever();
  retriever.index(store.allDocs());
  const globalItems = retriever.query(query, { scope: 'global', limit: MAX_GLOBAL_ITEMS });
  retriever.close();

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
