// packages/memory/src/provenance-backfill-cli.ts
// One-shot-but-replayable repair for the 2026-08-10 distillation batch: those fiches carry a
// machine-local ABSOLUTE `derived_from` (the SAS quai path under gitignored data/), which the
// gardien can never resolve. Portable provenance = the fiche's own `source_key` content address
// (ADR 0008 clause 6, amendement 2026-08-10). Idempotent: a fiche already portable (or without
// `derived_from`) passes through byte-identical, so re-running the script is always safe. A fiche
// that CANNOT be repaired (absolute path but no usable source_key) is reported, never skipped
// silently. Usage: `pnpm --filter @mas/memory mem:backfill-provenance [dir]` (default docs/knowledge).
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, posix, resolve, win32 } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { isContentAddress } from './frontmatter-check';

export interface BackfillFileResult {
  /** Full file content after the pass (unchanged input when `changed` is false). */
  out: string;
  changed: boolean;
  /** Set when the fiche needs repair but cannot be repaired (visible, never silent). */
  error?: string;
}

export interface BackfillSummary {
  scanned: number;
  /** Paths rewritten this run (empty on a replay — idempotence). */
  rewritten: string[];
  untouched: number;
  failed: { file: string; reason: string }[];
}

// The corpus is written from two machines (macOS + Windows), so both absolute forms are broken.
function isMachineLocalPath(v: string): boolean {
  return posix.isAbsolute(v) || win32.isAbsolute(v);
}

/** Repair ONE fiche's provenance. Pure (string → string) for testability. */
export function backfillProvenance(raw: string): BackfillFileResult {
  const parsed = matter(raw);
  const fm = parsed.data as Record<string, unknown>;
  const derivedFrom = fm.derived_from;
  if (typeof derivedFrom !== 'string' || !isMachineLocalPath(derivedFrom)) {
    return { out: raw, changed: false };
  }
  const sourceKey = fm.source_key;
  if (typeof sourceKey !== 'string' || !isContentAddress(sourceKey)) {
    return { out: raw, changed: false, error: `derived_from is machine-local but source_key is not a usable content address ('${String(sourceKey)}')` };
  }
  return { out: matter.stringify(parsed.content, { ...fm, derived_from: sourceKey }), changed: true };
}

/** Repair every .md fiche in a directory, writing only what changed. Replayable. */
export function backfillDir(dir: string): BackfillSummary {
  const summary: BackfillSummary = { scanned: 0, rewritten: [], untouched: 0, failed: [] };
  for (const name of readdirSync(dir).filter((n) => n.endsWith('.md') && !n.startsWith('.')).sort((a, b) => a.localeCompare(b))) {
    const file = join(dir, name);
    summary.scanned += 1;
    let result: BackfillFileResult;
    try {
      result = backfillProvenance(readFileSync(file, 'utf8'));
    } catch (e) {
      summary.failed.push({ file, reason: (e as Error).message });
      continue;
    }
    if (result.error) {
      summary.failed.push({ file, reason: result.error });
    } else if (result.changed) {
      writeFileSync(file, result.out, 'utf8');
      summary.rewritten.push(file);
    } else {
      summary.untouched += 1;
    }
  }
  return summary;
}

// pattern from packages/memory/src/frontmatter-check-cli.ts (findRepoRoot walk-up)
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
  const dir = process.argv[2] ? resolve(process.argv[2]) : resolve(findRepoRoot(), 'docs/knowledge');
  const s = backfillDir(dir);
  for (const f of s.failed) console.error(`  FAIL ${f.file}: ${f.reason}`);
  console.log(`[provenance-backfill] dir=${dir} scanned=${s.scanned} rewritten=${s.rewritten.length} untouched=${s.untouched} failed=${s.failed.length}`);
  if (s.failed.length > 0) process.exit(1);
}

// Run main only as a CLI entrypoint (mirror of frontmatter-check-cli.ts).
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
