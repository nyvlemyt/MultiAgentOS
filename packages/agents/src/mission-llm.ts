import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  claudeCodeLLM,
  createRouterLLM,
  mockLLM,
  type AutonomyLevel,
  type LLMClient,
  type ProjectLanguage,
  type RouterEvent,
} from '@mas/core';
import {
  scanOrchestratorSkills,
  loadLibraryIndex,
  mergeSkillMetas,
  SkillRouter,
} from '@mas/skills';
import {
  MemoryStore,
  buildMemoryContext,
  createRetriever,
  QMD_MEMORY_COLLECTIONS,
  type MemoryContext,
  type MemoryRetriever,
  type RetrievalBackend,
} from '@mas/memory';
import { type Db, loadBlockedWindows, logEventDetached } from './mission-events';

// Project row shape shared by the raw and delegated execution paths.
export type ExecProject = {
  id: string;
  path: string | null;
  autonomy: string | null;
  sessionId: string | null;
  defaultModel: string | null;
  defaultMode: string | null;
  language: ProjectLanguage | null;
};

// Lazy read-only memory store (no writerAgent — injection only reads, never writes;
// §8 keeps the Memory Keeper as the sole writer). Resolves data/memory at the repo
// root; degrades to an empty context under a bundler, like the skill router above.
let _memoryStore: MemoryStore | undefined;
let _memRetriever: MemoryRetriever | undefined;

// UnifiedRetriever (QMD primary, FTS fallback) over a store. createRetriever degrades
// to FTS when QMD isn't configured (no .qmd / no binary) — retrieval never crashes
// (Phase 9 · 0a exit criterion). `backend` lets the injected-store path force FTS.
function buildRetriever(store: MemoryStore, repoRoot: string, backend: RetrievalBackend): MemoryRetriever {
  return createRetriever({
    cwd: repoRoot,
    corpus: store,
    indexPath: store.indexPath(),
    collections: QMD_MEMORY_COLLECTIONS,
    backend,
  });
}

export function memoryContextFor(projectId: string | undefined, query: string): MemoryContext {
  const empty: MemoryContext = { text: '', projectEntryCount: 0, globalItems: [], projectItems: [] };
  if (!projectId) return empty;
  try {
    const __dirname = fileURLToPath(new URL('.', import.meta.url));
    const repoRoot = resolve(__dirname, '../../..');
    const envRoot = process.env.MAS_MEMORY_ROOT;
    if (envRoot) {
      // Injected custom store (tests/dev) has no QMD index → force FTS over it.
      const envStore = new MemoryStore({ root: envRoot });
      return buildMemoryContext(envStore, projectId, query, { retriever: buildRetriever(envStore, repoRoot, 'fts') });
    }
    if (!_memoryStore) {
      _memoryStore = new MemoryStore({ root: resolve(repoRoot, 'data/memory') });
    }
    // Worker default: QMD when the local .qmd index is present, else FTS (auto).
    _memRetriever ??= buildRetriever(_memoryStore, repoRoot, 'auto');
    return buildMemoryContext(_memoryStore, projectId, query, { retriever: _memRetriever });
  } catch {
    return empty;
  }
}

// Lazy singleton — deferred so Next.js static analysis doesn't eval import.meta.url at bundle time.
let _skillRouterInstance: SkillRouter | undefined;
export function getSkillRouter(): SkillRouter {
  if (!_skillRouterInstance) {
    try {
      const __dirname = fileURLToPath(new URL('.', import.meta.url));
      const repoRoot = resolve(__dirname, '../../..');
      const merged = mergeSkillMetas(
        scanOrchestratorSkills(repoRoot),
        loadLibraryIndex(repoRoot),
      );
      _skillRouterInstance = new SkillRouter(merged);
    } catch {
      // Under a bundler (Next webpack RSC) import.meta.url is not a file: URL,
      // so fileURLToPath rejects it (TypeError: ... Received an instance of URL).
      // Skill-summary injection is a best-effort prompt enhancement, not required
      // for correctness — degrade to an empty router rather than crash the run.
      // Native execution (apps/worker, tsx) resolves the path fine and gets full
      // injection. Moving the inline-Next run path to the worker is tracked in
      // docs/backlog/run-inline-execution-in-next.md.
      _skillRouterInstance = new SkillRouter([]);
    }
  }
  return _skillRouterInstance;
}

// LLM selection. MAS_MOCK_LLM=1 short-circuits the real Agent SDK with a
// deterministic, zero-cost mock (e2e smoke, offline dev, token budget). The §5
// risk gate fires BEFORE any LLM call (executeNextTask), so gate behavior is
// identical either way. Both branches go through @mas/core factories — no raw
// SDK client is instantiated here (CLAUDE.md §11). The real path also keeps the
// vi.mock('@mas/core') seam in dispatch.test.ts working unchanged.
export function selectLLM(opts: {
  cwd?: string;
  autonomyLevel?: AutonomyLevel;
  sessionId?: string;
  onRouterEvent?: (evt: RouterEvent) => void;
  initialBlocked?: Record<string, number>;
  onBlock?: (sourceId: string, blockedAt: number) => void;
}) {
  if (process.env.MAS_MOCK_LLM === '1') return mockLLM();
  const { onRouterEvent, initialBlocked, onBlock, ...claudeOpts } = opts;
  // Phase 3.5 (ADR 0002): the router takes over only when config/model-routing.json
  // enables at least one non-default source; otherwise current behavior unchanged.
  try {
    const __dirname = fileURLToPath(new URL('.', import.meta.url));
    const repoRoot = resolve(__dirname, '../../..');
    const router = createRouterLLM({
      configPath: process.env.MAS_ROUTING_CONFIG ?? resolve(repoRoot, 'config/model-routing.json'),
      envPath: process.env.MAS_ENV_LOCAL ?? resolve(repoRoot, '.env.local'),
      claudeOpts,
      onEvent: onRouterEvent,
      initialBlocked,
      onBlock,
    });
    if (router) return router;
  } catch {
    // Bundler path (import.meta.url not a file: URL) — same degradation as
    // getSkillRouter above: fall through to the plain Claude client.
  }
  return claudeCodeLLM(claudeOpts);
}

// Build a mission-scoped LLM client with the standard router/window plumbing,
// shared by the executor and the review phase so the seam (MAS_MOCK_LLM / vi.mock)
// behaves identically everywhere. Time-dependent (loadBlockedWindows) → explicit now.
export async function buildMissionLLM(
  db: Db,
  missionId: string,
  taskId: string | undefined,
  proj: ExecProject | undefined,
  now: Date,
): Promise<LLMClient> {
  const initialBlocked = await loadBlockedWindows(db, now);
  return selectLLM({
    cwd: proj?.path ?? undefined,
    autonomyLevel: (proj?.autonomy ?? 'assisted') as AutonomyLevel,
    sessionId: proj?.sessionId ?? undefined,
    onRouterEvent: (evt) =>
      logEventDetached(db, { missionId, taskId, type: 'provider_fallback', payload: evt }),
    initialBlocked,
    onBlock: (source, at) =>
      logEventDetached(db, { missionId, taskId, type: 'window_blocked', payload: { source, blockedAt: at } }),
  });
}
