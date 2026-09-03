// packages/memory/src/conveyor/promote-cli.ts
// Testable CLI logic for `pnpm mas promote <fiche-id|path>` and `mas promote --all` (subprocess-free;
// the real @mas/core LLMClient is injected by mas-cli.ts, exactly as distill-cli.ts does it — §11).
// Mirrors distill-cli.ts deliberately: the same cumulative pre-flight budget gate (a corpus-wide
// `--all` over 375 fiches must never become a quota bomb), the same "one bad doc is a visible
// failure, not a stopped batch" rule, and the same zero-cost skip for docs already past the stage.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { basename, join } from 'node:path';
import matter from 'gray-matter';
import { DEFAULT_PROMOTE_TOKEN_CAP, promotePromptEstimate, PROMOTE_ENTRY_STATE } from './promote';
import { promoteFile, type PromoteApplyDeps, type PromoteFileResult } from './promote-apply';

export interface PromoteFailure {
  id: string;
  path: string;
  reason: string;
}

export interface PromoteRunResult {
  /** Ids that reached `active`. */
  promoted: string[];
  /** Ids judged but held at `distilled` (NEEDS_WORK, or an untrusted fiche without approval). */
  held: string[];
  /** Ids archived as `rejected-kept` on a BLOCK verdict (never deleted). */
  rejected: string[];
  /** Paths of fiches flipped to `superseded` by these promotions. */
  superseded: string[];
  /** Fiches that could not be judged or written — visible, never silent. */
  failed: PromoteFailure[];
  /** Fiches that were not promotion candidates (already past `distilled`). Cost nothing. */
  skipped: number;
  /** True when the batch stopped early on the run budget (anti quota-bomb). */
  budgetStopped: boolean;
  /** Candidates not yet processed when the run ended (budget stop or `--limit`). */
  remaining: number;
}

export interface PromoteRunOpts {
  /** Cumulative ceiling for the WHOLE run. Default DEFAULT_PROMOTE_TOKEN_CAP. */
  runCap?: number;
  /** Stop after this many judged fiches (promote a handful, verify, then widen). */
  limit?: number;
}

const emptyResult = (): PromoteRunResult => ({
  promoted: [], held: [], rejected: [], superseded: [], failed: [], skipped: 0,
  budgetStopped: false, remaining: 0,
});

/** Fold one file result into the run buckets. */
function collect(res: PromoteRunResult, r: PromoteFileResult): void {
  switch (r.outcome) {
    case 'promoted':
      res.promoted.push(r.id);
      if (r.superseded) res.superseded.push(r.superseded);
      break;
    case 'held': res.held.push(r.id); break;
    case 'rejected': res.rejected.push(r.id); break;
    case 'skipped': res.skipped += 1; break;
    default: res.failed.push({ id: r.id, path: r.path, reason: r.reason ?? 'unknown failure' });
  }
}

/** `.md` fiches in the store, sorted for deterministic order. Dotfiles and the consolidation log
 * (which carries no frontmatter and is not a fiche) are not candidates. */
function listFiches(dir: string, logPath: string): string[] {
  const logName = basename(logPath);
  return readdirSync(dir)
    .filter((n) => n.endsWith('.md') && !n.startsWith('.') && n !== logName)
    .sort()
    .map((n) => join(dir, n));
}

interface Head {
  path: string;
  lifecycle: string;
  /** Pre-flight cost of judging this fiche, 0 for a non-candidate. */
  cost: number;
}

/** Read just enough of a fiche to know whether it is a candidate and what judging it would cost. */
function head(path: string): Head {
  const parsed = matter(readFileSync(path, 'utf8'));
  const data = parsed.data as Record<string, unknown>;
  const lifecycle = typeof data.lifecycle === 'string' ? data.lifecycle : '';
  if (lifecycle !== PROMOTE_ENTRY_STATE) return { path, lifecycle, cost: 0 };
  return {
    path, lifecycle,
    cost: promotePromptEstimate({
      id: String(data.id ?? ''), title: String(data.id ?? ''),
      docType: String(data.doc_type ?? 'reference'), trust: 'untrusted', body: parsed.content,
    }),
  };
}

/**
 * Judge every promotion candidate in the store, spending a CUMULATIVE run budget. Before each
 * candidate, the estimate of the EXACT prompt the judge will send is added to the running spend;
 * if that would cross the run cap the batch stops cleanly (`budgetStopped`) and `remaining` counts
 * the untouched candidates. Non-candidates are skipped for free, so replaying `--all` over an
 * already-promoted corpus costs nothing. A single fiche's failure is recorded and the batch
 * continues; only the budget or `limit` stops it.
 */
export async function promoteAll(deps: PromoteApplyDeps, opts: PromoteRunOpts = {}): Promise<PromoteRunResult> {
  const res = emptyResult();
  const cap = opts.runCap ?? DEFAULT_PROMOTE_TOKEN_CAP;
  const heads = listFiches(deps.dir, deps.logPath).map(head);
  const candidates = heads.filter((h) => h.lifecycle === PROMOTE_ENTRY_STATE);
  res.skipped = heads.length - candidates.length;

  let spent = 0;
  let judged = 0;
  for (let i = 0; i < candidates.length; i++) {
    if (opts.limit !== undefined && judged >= opts.limit) {
      res.remaining = candidates.length - i;
      return res;
    }
    const cand = candidates[i]!;
    if (spent + cand.cost > cap) {
      res.budgetStopped = true;
      res.remaining = candidates.length - i;
      return res;
    }
    spent += cand.cost;
    judged += 1;
    collect(res, await promoteOneSafely(cand.path, deps));
  }
  return res;
}

/** promoteFile, with an unexpected throw turned into a visible failure rather than a dead batch. */
async function promoteOneSafely(path: string, deps: PromoteApplyDeps): Promise<PromoteFileResult> {
  try {
    return await promoteFile(path, deps);
  } catch (e) {
    const id = basename(path).replace(/\.md$/, '');
    return { path, id, outcome: 'failed', lifecycle: '', reason: (e as Error).message };
  }
}

/** Promote ONE fiche, named either by id or by path. An unknown target is a visible failure. */
export async function promoteTarget(target: string, deps: PromoteApplyDeps): Promise<PromoteRunResult> {
  const res = emptyResult();
  const path = target.endsWith('.md') ? target : join(deps.dir, `${target}.md`);
  if (!existsSync(path)) {
    res.failed.push({ id: basename(path).replace(/\.md$/, ''), path, reason: `fiche not found: ${path}` });
    return res;
  }
  collect(res, await promoteOneSafely(path, deps));
  return res;
}

export function formatPromoteSummary(res: PromoteRunResult): string {
  const base =
    `[mas promote] ${res.promoted.length} promoted, ${res.held.length} held, ` +
    `${res.rejected.length} rejected, ${res.superseded.length} superseded, ` +
    `${res.failed.length} failed, ${res.skipped} skipped.`;
  const head = res.budgetStopped
    ? `${base} Budget cap reached — paused, ${res.remaining} remaining (resume later).`
    : (res.remaining > 0 ? `${base} Stopped on --limit, ${res.remaining} remaining.` : base);
  return [head, ...res.failed.map((f) => `  FAIL ${f.id} — ${f.reason}`)].join('\n');
}

// ---- Argument parsing (pure, so mas-cli.ts stays thin wiring) -------------

export interface PromoteArgs {
  mode: 'one' | 'all' | 'candidates' | 'usage';
  /** Fiche id or path, in `one` mode. */
  target?: string;
  /** Store directory override, in `all` mode. */
  dir?: string;
  limit?: number;
  approveUntrusted?: boolean;
  dryRun?: boolean;
  projectId?: string;
  /** Set when an option is malformed — the caller prints it and exits non-zero. */
  error?: string;
}

/** Read the value that follows a flag, or record why it is unusable. */
function valueAfter(rest: string[], i: number, flag: string): { value?: string; error?: string } {
  const value = rest[i + 1];
  if (value === undefined || value.startsWith('--')) return { error: `${flag} needs a value` };
  return { value };
}

/**
 * Parse `mas promote` arguments. Order-independent, and a malformed `--limit`/`--project` is a
 * hard error rather than a silent full-corpus run (that is the difference between promoting three
 * fiches and judging 375 with Opus).
 */
export function parsePromoteArgs(rest: string[]): PromoteArgs {
  const args: PromoteArgs = { mode: 'usage' };
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i]!;
    if (arg === '--all') { args.mode = 'all'; continue; }
    if (arg === '--candidates') { args.mode = 'candidates'; continue; }
    if (arg === '--approve-untrusted') { args.approveUntrusted = true; continue; }
    if (arg === '--dry-run') { args.dryRun = true; continue; }
    if (arg === '--limit' || arg === '--project') {
      const { value, error } = valueAfter(rest, i, arg);
      if (error) return { ...args, error };
      if (arg === '--project') args.projectId = value;
      else {
        const n = Number(value);
        if (!Number.isInteger(n) || n <= 0) return { ...args, error: `--limit needs a positive integer, got '${value}'` };
        args.limit = n;
      }
      i += 1;
      continue;
    }
    if (arg.startsWith('--')) return { ...args, error: `unknown option ${arg}` };
    // A bare positional is the store dir in --all mode, otherwise the fiche id/path.
    if (args.mode === 'all') args.dir = arg;
    else if (args.mode === 'usage') { args.mode = 'one'; args.target = arg; }
  }
  return args;
}
