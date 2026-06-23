import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { retrievalDoctor } from './retriever';

// pattern from packages/memory/src/eval-cli.ts (findRepoRoot walk-up)
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

// `pnpm mem:doctor` — surface the retrieval backend explicitly so a fresh clone
// is never silently degraded to FTS (Phase 9 · 0a renforcée). Always exits 0: a
// missing QMD is a documented fallback, not an error.
function main(): void {
  const repoRoot = findRepoRoot();
  const d = retrievalDoctor(repoRoot);
  console.log(`[mem:doctor] ${d.message}`);
  console.log(
    `[mem:doctor] qmd-bin=${d.binFound ? 'ok' : 'absent'} ` +
      `.qmd-index=${d.indexFound ? 'present' : 'absent'} ` +
      `forced-fts=${d.forcedFts} → backend=${d.qmdActive ? 'qmd' : 'fts'}`,
  );
}

main();
