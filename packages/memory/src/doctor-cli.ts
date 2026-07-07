import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { retrievalDoctor } from './retriever';
import { extractionDoctor, formatExtractionDoctorReport, realBinProbe } from './conveyor/extractors/doctor';

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
// is never silently degraded to FTS (Phase 9 · 0a renforcée), and probe the
// capture extraction binaries so a broken python3 (2026-07-07 pyexpat incident)
// is diagnosed here, not mid-capture. Always exits 0: every finding is a
// documented fallback or a printed remedy, never an error.
function main(): void {
  const repoRoot = findRepoRoot();
  const d = retrievalDoctor(repoRoot);
  console.log(`[mem:doctor] ${d.message}`);
  console.log(
    `[mem:doctor] qmd-bin=${d.binFound ? 'ok' : 'absent'} ` +
      `.qmd-index=${d.indexFound ? 'present' : 'absent'} ` +
      `forced-fts=${d.forcedFts} → backend=${d.qmdActive ? 'qmd' : 'fts'}`,
  );
  const e = extractionDoctor(realBinProbe);
  for (const line of formatExtractionDoctorReport(e)) console.log(`[mem:doctor] ${line}`);
  if (!e.allOk) {
    console.log('[mem:doctor] ⚠ capture (pnpm mas capture) dégradée tant que les remèdes ci-dessus ne sont pas appliqués.');
  }
}

main();
