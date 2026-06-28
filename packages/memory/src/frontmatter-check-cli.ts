import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { checkBody, checkFiche, type CheckResult, type FicheTier } from './frontmatter-check';

// CLI wrapper for the Brique 1d gardien. Default = tier1 over the whole tracked
// corpus (docs/resources/** + docs/knowledge/**) so the backfilled legacy base
// stays green; `--strict` opts into the full backbone contract. Explicit file
// args check only those files. Exits 1 on any error; warnings never fail.

const ROOTS = ['docs/resources', 'docs/knowledge'];
// Absolute path, never PATH-resolved (Sonar S4036): present on the macOS dev box
// and the Linux CI runner alike.
const GIT = '/usr/bin/git';

// pattern from packages/memory/src/doctor-cli.ts (findRepoRoot walk-up)
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

function trackedMarkdown(repoRoot: string): string[] {
  const out = execFileSync(GIT, ['ls-files', '-z', ...ROOTS], { cwd: repoRoot, encoding: 'utf8' });
  return out.split('\0').filter((p) => p.endsWith('.md'));
}

// knownPaths = every tracked doc path ∪ every fiche id/slug, so a relation may
// resolve by path OR by identity (STRUCTURE.md §7).
function buildKnownPaths(repoRoot: string, files: string[]): Set<string> {
  const known = new Set<string>(files);
  for (const file of files) {
    try {
      const { data } = matter(readFileSync(resolve(repoRoot, file), 'utf8'));
      if (typeof data.id === 'string') known.add(data.id);
      if (typeof data.slug === 'string') known.add(data.slug);
    } catch {
      // Parse failures are reported in the main check loop.
    }
  }
  return known;
}

function checkFile(repoRoot: string, file: string, known: Set<string>, tier: FicheTier): CheckResult {
  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(readFileSync(resolve(repoRoot, file), 'utf8'));
  } catch (err) {
    return { errors: [`frontmatter unparseable: ${err instanceof Error ? err.message : String(err)}`], warnings: [] };
  }
  const fm = checkFiche(parsed.data as Record<string, unknown>, { knownPaths: known, tier });
  const body = checkBody(parsed.content, { knownPaths: known, tier });
  return { errors: [...fm.errors, ...body.errors], warnings: [...fm.warnings, ...body.warnings] };
}

// Explicit file args are selected by watched-ROOT prefix, NOT by corpus (git
// ls-files) membership: the PostToolUse hook validates a file the instant it is
// written — before it is tracked — so a brand-new fiche must still be checked.
// Out-of-scope or non-markdown paths are ignored. No args → the whole corpus (CI).
export function resolveTargets(repoRoot: string, args: string[], corpus: string[]): string[] {
  if (args.length === 0) return corpus;
  return args
    .map((a) => relative(repoRoot, resolve(process.cwd(), a)))
    .filter((p) => p.endsWith('.md') && ROOTS.some((root) => p.startsWith(`${root}/`)));
}

function main(): void {
  const argv = process.argv.slice(2);
  const tier: FicheTier = argv.includes('--strict') ? 'strict' : 'tier1';
  const fileArgs = argv.filter((a) => !a.startsWith('--'));

  const repoRoot = findRepoRoot();
  const corpus = trackedMarkdown(repoRoot);
  const known = buildKnownPaths(repoRoot, corpus);
  const targets = resolveTargets(repoRoot, fileArgs, corpus);

  let errorCount = 0;
  let warnCount = 0;
  for (const file of targets) {
    const { errors, warnings } = checkFile(repoRoot, file, known, tier);
    for (const w of warnings) {
      console.warn(`  WARN ${file}: ${w}`);
      warnCount++;
    }
    for (const e of errors) {
      console.error(`  ERROR ${file}: ${e}`);
      errorCount++;
    }
  }

  const scope = fileArgs.length ? `${targets.length} file(s)` : `${corpus.length} docs`;
  console.log(`[frontmatter-gardien] tier=${tier} scanned=${scope} errors=${errorCount} warnings=${warnCount}`);
  if (errorCount > 0) {
    console.error(`[frontmatter-gardien] FAIL — fix the fiche contract above (or re-run the tier-1 backfill).`);
    process.exit(1);
  }
}

// Run main only as a CLI entrypoint, so importing resolveTargets in tests (and
// the PostToolUse hook wrapper) does not execute the whole gardien.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
