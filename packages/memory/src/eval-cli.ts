import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { MemoryStore, MEMORY_KEEPER_AGENT } from './registers';
import { FtsRetriever, QmdRetriever, type MemoryRetriever } from './retriever';
import { runRetrievalEval, formatEvalReport, type EvalBackend, type GoldenQuery } from './eval';

// pattern from packages/memory/src/seed-cli.ts (findRepoRoot walk-up)
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

function buildLiveRetriever(repoRoot: string, backend: EvalBackend): MemoryRetriever {
  if (backend === 'qmd') {
    // No collection restriction — the gold set spans mas-knowledge + mas-arsenal.
    return new QmdRetriever({ cwd: repoRoot, mode: 'query' });
  }
  const memoryRoot = process.env['MAS_MEMORY_ROOT'] ?? resolve(repoRoot, 'data/memory');
  const store = new MemoryStore({ root: memoryRoot, writerAgent: MEMORY_KEEPER_AGENT });
  const fts = new FtsRetriever();
  fts.index(store.allDocs());
  return fts;
}

function resolveBackend(repoRoot: string): EvalBackend {
  const env = process.env['MAS_RETRIEVAL_BACKEND'];
  if (env === 'fts') return 'fts';
  if (env === 'qmd') return 'qmd';
  return QmdRetriever.available(repoRoot) ? 'qmd' : 'fts';
}

function main(): void {
  const repoRoot = findRepoRoot();
  const goldenPath = resolve(repoRoot, 'packages/memory/src/golden-queries.json');
  const golden = JSON.parse(readFileSync(goldenPath, 'utf8')) as GoldenQuery[];
  const backend = resolveBackend(repoRoot);

  const retriever = buildLiveRetriever(repoRoot, backend);
  const report = runRetrievalEval(retriever, golden, backend);
  console.log(formatEvalReport(report));

  if (!report.ok) {
    console.error(`[mem:eval] FAILED — ${report.failed} golden quer${report.failed === 1 ? 'y' : 'ies'} regressed.`);
    process.exit(1);
  }
  console.log(`[mem:eval] OK — ${report.passed} passed, ${report.skipped} skipped (backend=${backend}).`);
}

main();
