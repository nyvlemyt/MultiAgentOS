import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildArsenalStubs } from './arsenal';

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

function main(): void {
  const repoRoot = findRepoRoot();
  const res = buildArsenalStubs(repoRoot);
  console.log(`[arsenal:build] outDir: ${res.outDir}`);
  console.log(
    `[arsenal:build] written=${res.written} ` +
      `skills=${res.byType.skill} agents=${res.byType.agent} ` +
      `rules=${res.byType.rule} commands=${res.byType.command}`,
  );
  console.log('[arsenal:build] now run: qmd update -c mas-arsenal && qmd embed');
}

main();
