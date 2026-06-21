import type { SkillMeta, Domain } from './types.js';
import type { SkillRouter } from './router.js';

/**
 * Ranks a bounded shortlist of skill candidates. MUST receive only the L1
 * summaries of the already-shortlisted (≤K) candidates — never the full arsenal.
 * Returns an ordered list of selected skill ids (≤N). May be sync or async.
 */
export type RankFn = (args: {
  task: { id: string; title: string; description: string };
  candidates: { id: string; summary: string }[];
  n: number;
}) => Promise<string[]> | string[];

export interface DomainScope {
  domain?: Domain;
  clusterPrefix?: string;
}

export interface SelectParams {
  task: { id: string; title: string; description: string; skillsHint?: string[] };
  /** Derived from the agent — which slice of the arsenal is in scope. */
  scope: DomainScope;
  router: SkillRouter;
  /** Optional bounded LLM ranker; absent ⇒ stage 2 skipped (deterministic). */
  llm?: RankFn;
  /** Shortlist size (stage 1). */
  k?: number;
  /** Final selection size (stage 2 / degraded). */
  n?: number;
}

export interface SelectResult {
  skillIds: string[];
  rationale: string;
  degraded: boolean;
}

const DEFAULT_K = 15;
const DEFAULT_N = 5;

// Stage-1 scoring weights. Hint membership is the strongest signal (the planner
// explicitly asked for it), then tag overlap, then a small same-cluster nudge.
const W_HINT = 10;
const W_TAG = 3;
const W_CLUSTER = 1;

/** Lowercase word tokens from free text (title+description), deduped. */
function tokenize(text: string): Set<string> {
  const out = new Set<string>();
  for (const w of text.toLowerCase().split(/[^a-z0-9]+/)) {
    if (w.length > 1) out.add(w);
  }
  return out;
}

function scopePasses(skill: SkillMeta, scope: DomainScope): boolean {
  if (!scope.domain && !scope.clusterPrefix) return true;
  const byDomain = scope.domain !== undefined && skill.domain === scope.domain;
  const byCluster =
    scope.clusterPrefix !== undefined &&
    (skill.cluster?.startsWith(scope.clusterPrefix) ?? false);
  return byDomain || byCluster;
}

function scoreSkill(
  skill: SkillMeta,
  taskTokens: Set<string>,
  hints: Set<string>,
): number {
  const skillTokens = new Set(skill.tags.map((t) => t.toLowerCase()));
  let tagOverlap = 0;
  for (const t of skillTokens) if (taskTokens.has(t)) tagOverlap++;

  const hinted =
    hints.has(skill.id.toLowerCase()) ||
    skill.tags.some((t) => hints.has(t.toLowerCase()));

  // Cluster affinity: any task token appearing in the skill's cluster slug.
  const cluster = skill.cluster?.toLowerCase();
  const clusterAffinity = cluster && [...taskTokens].some((t) => cluster.includes(t)) ? 1 : 0;

  return (hinted ? W_HINT : 0) + tagOverlap * W_TAG + clusterAffinity * W_CLUSTER;
}

function buildRationale(scope: DomainScope, degraded: boolean): string {
  const parts: string[] = [];
  if (scope.domain) parts.push(`domain=${scope.domain}`);
  if (scope.clusterPrefix) parts.push(`cluster~${scope.clusterPrefix}`);
  if (parts.length === 0) parts.push('full arsenal');
  parts.push(degraded ? 'deterministic (no/failed llm rank)' : 'llm-ranked');
  return parts.join(', ');
}

async function rankWithLlm(
  llm: RankFn,
  task: SelectParams['task'],
  shortlist: SkillMeta[],
  n: number,
): Promise<string[] | undefined> {
  const candidates = shortlist.map((s) => ({ id: s.id, summary: s.summary }));
  try {
    const ranked = await llm({
      task: { id: task.id, title: task.title, description: task.description },
      candidates,
      n,
    });
    const allowed = new Set(shortlist.map((s) => s.id));
    const seen = new Set<string>();
    const valid: string[] = [];
    for (const id of ranked) {
      if (allowed.has(id) && !seen.has(id)) {
        seen.add(id);
        valid.push(id);
      }
      if (valid.length >= n) break;
    }
    return valid;
  } catch {
    // Any ranker failure (incl. an Error whose message includes "budget_exceeded")
    // degrades to the deterministic shortlist rather than spending more tokens.
    return undefined;
  }
}

/**
 * Two-stage skill selection over the cold-library arsenal.
 *
 * Stage 1 (0 tokens): scope-filter `router.all()`, score against the task,
 * stable-sort, keep the top-K shortlist.
 * Stage 2 (bounded): pass ONLY the K shortlisted L1 summaries to `llm`, keep
 * top-N of its ordering. If `llm` is absent or fails → degrade to the
 * deterministic top-N.
 */
export async function selectLibrarySkills(p: SelectParams): Promise<SelectResult> {
  const k = p.k ?? DEFAULT_K;
  const n = p.n ?? DEFAULT_N;
  const hints = new Set((p.task.skillsHint ?? []).map((h) => h.toLowerCase()));
  const taskTokens = tokenize(`${p.task.title} ${p.task.description}`);

  const eligible = p.router.all().filter((s) => scopePasses(s, p.scope));
  const ranked = eligible
    .map((skill) => ({ skill, score: scoreSkill(skill, taskTokens, hints) }))
    .sort((a, b) => b.score - a.score || a.skill.id.localeCompare(b.skill.id));

  const shortlist = ranked.slice(0, k).map((r) => r.skill);
  const deterministicTopN = shortlist.slice(0, n).map((s) => s.id);

  if (!p.llm) {
    return { skillIds: deterministicTopN, rationale: buildRationale(p.scope, true), degraded: true };
  }

  const llmIds = await rankWithLlm(p.llm, p.task, shortlist, n);
  if (llmIds === undefined) {
    return { skillIds: deterministicTopN, rationale: buildRationale(p.scope, true), degraded: true };
  }
  return { skillIds: llmIds, rationale: buildRationale(p.scope, false), degraded: false };
}
