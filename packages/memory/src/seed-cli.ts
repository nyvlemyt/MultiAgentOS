import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { runSeed } from './seed';

// pattern from packages/db/src/seed.ts:30 (findRepoRoot walk-up)
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

function main(): void {
  const repoRoot = findRepoRoot();
  const memoryRoot = process.env.MAS_MEMORY_ROOT ?? resolve(repoRoot, 'data/memory');
  const knowledgeDir = resolve(repoRoot, 'docs/knowledge');
  console.log(`[mem:seed] knowledge: ${knowledgeDir}`);
  console.log(`[mem:seed] target: ${memoryRoot}`);
  const res = runSeed({ memoryRoot, knowledgeDir });
  console.log(`[mem:seed] imported=${res.imported.length} skipped=${res.skipped.length}`);
}

main();
