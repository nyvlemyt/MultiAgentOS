// `pnpm mas capture <path|url>` and `pnpm mas capture --inbox [dir]`. Builds the real registry
// (markitdown + pdftotext) and the temp-free DB; the testable logic lives in conveyor/cli.ts.
// Default path is zero-LLM (rules-only) → §11-safe. Pattern from packages/memory/src/doctor-cli.ts.
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { getDb } from '@mas/db';
import { ExtractorRegistry } from './conveyor/extractor';
import { makePdfExtractor } from './conveyor/extractors/pdf';
import { captureInbox, captureOne, formatSummary } from './conveyor/cli';
import type { PipelineDeps } from './conveyor/pipeline';

const USAGE = 'usage: mas capture <path|url> | mas capture --inbox [dir]';

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

function buildDeps(): PipelineDeps {
  const registry = new ExtractorRegistry();
  registry.register('pdf', makePdfExtractor());
  return { registry }; // no llm/budget → rules-only, §11-safe
}

async function main(): Promise<void> {
  const [cmd, ...rest] = process.argv.slice(2);
  if (cmd !== 'capture' || rest.length === 0) {
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }
  const db = getDb();
  const deps = buildDeps();
  if (rest[0] === '--inbox') {
    const dir = rest[1] ?? resolve(findRepoRoot(), 'docs/resources/inbox');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    console.log(formatSummary(await captureInbox(db, dir, deps)));
    return;
  }
  console.log(formatSummary(await captureOne(db, rest[0]!, deps)));
}

try {
  await main();
} catch (e) {
  console.error(`[mas capture] ${(e as Error).message}`);
  process.exitCode = 1;
}
