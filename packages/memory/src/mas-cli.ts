// `pnpm mas capture <path|url>`, `mas capture --html [file|-]` and `mas capture --inbox [dir]`. Builds
// the real registry (markitdown + pdftotext + Defuddle + yt-dlp) and the temp-free DB; the testable
// logic lives in conveyor/cli.ts. Default path is zero-LLM (rules-only) → §11-safe. The url/youtube
// leaves egress only through net-guard, seeded from config/permissions.json#allowed_hosts (§5).
// Pattern from packages/memory/src/doctor-cli.ts.
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { lookup } from 'node:dns/promises';
import { getDb } from '@mas/db';
import { ExtractorRegistry } from './conveyor/extractor';
import { makePdfExtractor } from './conveyor/extractors/pdf';
import { makeHtmlExtractor } from './conveyor/extractors/html';
import { makeUrlExtractor } from './conveyor/extractors/url';
import { makeYoutubeExtractor, realYoutubeRunner } from './conveyor/extractors/youtube';
import { captureHtmlBlob, captureInbox, captureOne, formatSummary } from './conveyor/cli';
import type { PipelineDeps } from './conveyor/pipeline';
import type { NetGuardDeps } from './conveyor/net-guard';

const USAGE = 'usage: mas capture <path|url> | mas capture --html [file|-] | mas capture --inbox [dir]';

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

const resolveHost = async (host: string): Promise<string[]> => (await lookup(host, { all: true })).map((a) => a.address);

function loadAllowedHosts(root: string): string[] {
  try {
    const cfg = JSON.parse(readFileSync(resolve(root, 'config/permissions.json'), 'utf8')) as { allowed_hosts?: string[] };
    return cfg.allowed_hosts ?? [];
  } catch {
    return [];
  }
}

function buildDeps(root: string): PipelineDeps {
  const guard: NetGuardDeps = { allowedHosts: loadAllowedHosts(root), resolve: resolveHost };
  const registry = new ExtractorRegistry();
  registry.register('pdf', makePdfExtractor());
  registry.register('html', makeHtmlExtractor());
  registry.register('url', makeUrlExtractor({ ...guard, fetch }));
  registry.register('youtube', makeYoutubeExtractor(realYoutubeRunner, guard));
  return { registry }; // no llm/budget → rules-only, §11-safe
}

async function main(): Promise<void> {
  const [cmd, ...rest] = process.argv.slice(2);
  if (cmd !== 'capture' || rest.length === 0) {
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }
  const root = findRepoRoot();
  const db = getDb();
  const deps = buildDeps(root);
  if (rest[0] === '--html') {
    const arg = rest[1];
    const fromStdin = !arg || arg === '-';
    const blob = fromStdin ? readFileSync(0, 'utf8') : readFileSync(resolve(arg), 'utf8');
    const title = fromStdin ? 'pasted-html' : basename(arg);
    console.log(formatSummary(await captureHtmlBlob(db, blob, title, deps)));
    return;
  }
  if (rest[0] === '--inbox') {
    const dir = rest[1] ?? resolve(root, 'docs/resources/inbox');
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
