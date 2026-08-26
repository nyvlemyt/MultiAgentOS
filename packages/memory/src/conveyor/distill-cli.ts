// packages/memory/src/conveyor/distill-cli.ts
// Testable CLI logic for `pnpm mas distill <sas-doc-path>` and `mas distill --all` (subprocess-free;
// the real @mas/core LLMClient is injected by mas-cli.ts). A SAS doc = a captured raw-markdown file
// (SAS quai under gitignored data/); its CONTENT HASH — the source_key — is the fiche's `derived_from`
// (portable provenance, ADR 0008 clause 6 amendement 2026-08-10; a quai path is machine-local and
// never gardien-resolvable). Each doc → distill() → one fiche at `distilled` written under
// docs/knowledge/ via writeDistilledFiche. Batch checks the budget BEFORE each doc and PAUSES with
// budget_exceeded (never a silent quota bomb), mirroring the spec §5 rule.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { distill, distillPromptEstimate, DEFAULT_DISTILL_TOKEN_CAP, type DistillInput } from './distill';
import { writeDistilledFiche, writeRejectedKeptFiche } from './distill-apply';

/** Below this many useful characters, a SAS doc is an extraction husk, not a document — it is
 * kept as `rejected-kept` (archive-never-delete) without spending an LLM call on it. */
export const FRAGMENT_MIN_CHARS = 200;

/** Parent/child marker posted by the matière pipeline (pipeline.ts) on each child doc. */
const PART_OF_RE = /<!-- part_of: (.+?) order: (\d+) -->\n?/;

/** macOS mixes NFC/NFD in filenames and content — compare titles on one normal form only. */
function nfc(s: string): string {
  return s.normalize('NFC');
}

/** Doc body without the part_of marker — what "useful characters" means for the fragment gate. */
function sasBody(rawMarkdown: string): string {
  const m = PART_OF_RE.exec(rawMarkdown);
  return m ? rawMarkdown.slice(0, m.index) + rawMarkdown.slice(m.index + m[0].length) : rawMarkdown;
}

// One directory scan per quai dir (not per doc): mother manifests keyed by their NFC H1 title.
const motherCache = new Map<string, Map<string, string>>();
function mothersIn(dir: string): Map<string, string> {
  const cached = motherCache.get(dir);
  if (cached) return cached;
  const map = new Map<string, string>();
  if (existsSync(dir)) {
    for (const f of readdirSync(dir).filter((n) => n.endsWith('.md') && !n.startsWith('.'))) {
      const raw = readFileSync(join(dir, f), 'utf8');
      if (!raw.includes('## Contents')) continue;
      const h1 = firstH1(raw);
      if (h1) map.set(nfc(h1), raw);
    }
  }
  motherCache.set(dir, map);
  return map;
}

/** Title of child `order` as listed in the mother manifest of `partOf`, when both exist. */
function manifestTitle(dir: string, partOf: string, order: number): string | null {
  const raw = mothersIn(dir).get(nfc(partOf));
  if (!raw) return null;
  for (const line of raw.split('\n')) {
    if (!line.startsWith(`${order}. `)) continue;
    const dash = line.indexOf('—');
    if (dash !== -1) return line.slice(dash + 1).trim();
  }
  return null;
}

export interface DistillCliDeps {
  /** The single LLM injection point (@mas/core). mas-cli.ts passes claudeCodeLLM; tests pass a stub. */
  llm: import('@mas/core').LLMClient;
  /** Where distilled fiches land (docs/knowledge). */
  outDir: string;
  /** Consolidation-log path (supersede-pending lines). */
  logPath: string;
  /** Injected date (deterministic). */
  date: string;
  keeper: string;
  /** Per-run token cap. Default DEFAULT_DISTILL_TOKEN_CAP. */
  tokenCap?: number;
}

export interface DistillFailure {
  path: string;
  reason: string;
}

export interface DistillRunResult {
  /** Absolute paths of the distilled fiches written. */
  distilled: string[];
  /** Docs that failed to distill (malformed output, etc.) — visible, never silent. */
  failed: DistillFailure[];
  /** Extraction husks kept as rejected-kept fiches without an LLM call (fragment gate). */
  rejectedKept?: string[];
  /** Docs skipped because a distilled fiche already exists (idempotent re-run). */
  skipped: number;
  /** True when the batch stopped early on a budget cap (anti quota-bomb). */
  budgetStopped: boolean;
  /** Docs not yet processed when the run ended (budget stop or single-doc). */
  remaining: number;
}

// STRUCTURE.md §5 charset: lowercase, strip diacritics, [a-z0-9-] only, collapse repeats, trim '-'.
// split/filter/join on a single char class — no anchored quantifier for S5852 (mirror of manifest.ts).
function kebab(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).join('-');
}

function firstH1(body: string): string | null {
  for (const line of body.split('\n')) {
    const m = /^#\s+(\S.*)$/.exec(line);
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

/**
 * Build a DistillInput from a captured SAS doc file. `source_key` is a content hash (idempotent
 * across re-ingests) and ALSO fills `derived_from`: the SAS quai lives under gitignored data/, so a
 * file path there is machine-local and never gardien-resolvable — the content address is the portable
 * provenance (ADR 0008 clause 6, amendement 2026-08-10). id/slug is `resource-<title>-<hash[:8]>` per
 * STRUCTURE.md §5 (kebab, immutable). Untrusted by default (ingested source, ADR 0008 trust invariant).
 */
export function sasDocToInput(path: string): DistillInput {
  const rawMarkdown = readFileSync(path, 'utf8');
  const hash = createHash('sha256').update(rawMarkdown).digest('hex');
  const pm = PART_OF_RE.exec(rawMarkdown);
  const partOf = pm ? pm[1]! : undefined;
  const order = pm ? Number(pm[2]) : undefined;
  // Title chain: own H1 → mother-manifest line (children of a matière have no H1 — the 281
  // degenerate resource-cand-* ids all came from this gap) → "part_of — document N" → filename.
  let title = firstH1(sasBody(rawMarkdown));
  if (!title && partOf !== undefined && order !== undefined) {
    const inherited = manifestTitle(dirname(path), partOf, order);
    title = `${partOf} — ${inherited ?? `document ${order}`}`;
  }
  title ??= basename(path).replace(/\.md$/, '');
  const stem = kebab(title) || `doc-${hash.slice(0, 8)}`;
  const id = `resource-${stem}-${hash.slice(0, 8)}`;
  const sourceKey = `sha256:${hash}`;
  return {
    id, sourceKey, derivedFrom: sourceKey, trust: 'untrusted', title, rawMarkdown,
    ...(partOf !== undefined ? { partOf } : {}),
    ...(order !== undefined ? { order } : {}),
  };
}

/** True when a distilled fiche for this id already exists under outDir (idempotent skip). */
function alreadyDistilled(outDir: string, id: string): boolean {
  return existsSync(join(outDir, `${id}.md`));
}

/** Distil a single already-built input; write on success, capture the failure reason on error.
 * `sasPath` is reporting-only (derived_from is now a content address, not a path). */
async function distillOne(sasPath: string, input: DistillInput, deps: DistillCliDeps, res: DistillRunResult): Promise<void> {
  try {
    const fiche = await distill(input, { llm: deps.llm, tokenCap: deps.tokenCap });
    const { written } = writeDistilledFiche(deps.outDir, deps.logPath, fiche, { date: deps.date, keeper: deps.keeper });
    res.distilled.push(written);
  } catch (e) {
    res.failed.push({ path: sasPath, reason: (e as Error).message });
  }
}

const emptyResult = (): DistillRunResult => ({ distilled: [], failed: [], rejectedKept: [], skipped: 0, budgetStopped: false, remaining: 0 });

/** Distil one SAS doc by path. */
export async function distillPath(path: string, deps: DistillCliDeps): Promise<DistillRunResult> {
  const res = emptyResult();
  await distillOne(path, sasDocToInput(path), deps, res);
  return res;
}

/** List `.md` SAS docs in a directory (skips dotfiles), sorted for deterministic order. */
function listSasDocs(dir: string): string[] {
  return readdirSync(dir).filter((n) => n.endsWith('.md') && !n.startsWith('.')).sort().map((n) => join(dir, n));
}

/**
 * Distil every not-yet-distilled SAS doc in a directory, spending a CUMULATIVE run budget. Before each
 * doc, the estimate of the EXACT prompt distill() will send is added to the running spend; if that
 * would exceed the run cap, the batch stops cleanly (budgetStopped) and `remaining` counts the
 * untouched docs — never burning past the cap (spec §5 anti quota-bomb: a 50-PDF drop can't run away).
 * A single doc's malformed output is recorded as a failure and the batch continues; only the budget
 * stops the batch. `skipped` docs (already distilled) cost nothing.
 */
export async function distillAll(dir: string, deps: DistillCliDeps): Promise<DistillRunResult> {
  const res = emptyResult();
  const cap = deps.tokenCap ?? DEFAULT_DISTILL_TOKEN_CAP;
  const docs = listSasDocs(dir);
  let spent = 0;

  for (let i = 0; i < docs.length; i++) {
    const input = sasDocToInput(docs[i]!);
    if (alreadyDistilled(deps.outDir, input.id)) {
      res.skipped += 1;
      continue;
    }
    // Fragment gate: an extraction husk (no own title AND almost no content) is archived
    // rejected-kept, zero LLM spend. A titled doc is a document, however short.
    const gateBody = sasBody(input.rawMarkdown);
    if (!firstH1(gateBody) && gateBody.trim().length < FRAGMENT_MIN_CHARS) {
      const { written } = writeRejectedKeptFiche(deps.outDir, deps.logPath, input, { date: deps.date, keeper: deps.keeper });
      (res.rejectedKept ??= []).push(written);
      continue;
    }
    // Cumulative pre-flight: stop here (before the call) if this doc would push the run over the cap.
    const cost = distillPromptEstimate(input);
    if (spent + cost > cap) {
      res.budgetStopped = true;
      res.remaining = docs.length - i;
      return res;
    }
    spent += cost;
    await distillOne(docs[i]!, input, deps, res);
  }
  return res;
}

export function formatDistillSummary(res: DistillRunResult): string {
  const rejectedKept = res.rejectedKept ?? [];
  const rejected = rejectedKept.length > 0 ? ` ${rejectedKept.length} rejected-kept (fragments).` : '';
  const base = `[mas distill] ${res.distilled.length} distilled, ${res.failed.length} failed, ${res.skipped} skipped.${rejected}`;
  const head = res.budgetStopped ? `${base} Budget cap reached — paused, ${res.remaining} remaining (resume later).` : base;
  const failures = res.failed.map((f) => `  FAIL ${f.path} — ${f.reason}`);
  return [head, ...failures].join('\n');
}
