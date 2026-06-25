import type { AgentLibraryMeta } from './library';

/**
 * Cold-agent SUGGESTION scorer (Wave 0d/4b). DATA ONLY — see CLAUDE.md §5.
 *
 * The cold agent arsenal (`loadAgentLibraryIndex`) is scored against a task's
 * text, mirroring the skill router's tag/role overlap. When a library agent
 * out-scores the planner's hint by a margin, `planMission` emits a
 * `cold_agent_suggested` event. The suggestion NEVER rewrites `t.agentHint`,
 * NEVER enters `TIER_B_DELEGATION_MAP`, and NEVER routes delegation — a human
 * promotes it later. There is no code path where this scorer alone causes an
 * unaudited agent to execute. (ADR 0007 §Décision-4)
 *
 * Pure + deterministic + zero-LLM: ties broken by id (lexical asc) so the same
 * task text always yields the same suggestion.
 */

export interface ColdAgentSuggestion {
  taskId?: string;
  suggestedAgentId: string;
  score: number;
  reason: string;
}

// A library agent must beat the hint's library-score by at least this margin to
// be worth surfacing. The planner hint is a Tier A roster id (not in the cold
// library), so its library-score is 0 — the margin then gates raw noise.
const SUGGEST_MARGIN = 2;

/** Lowercase word tokens (len > 1), deduped — mirrors select.ts tokenize. */
function tokenize(text: string): Set<string> {
  const out = new Set<string>();
  for (const w of text.toLowerCase().split(/[^a-z0-9]+/)) {
    if (w.length > 1) out.add(w);
  }
  return out;
}

/** Overlap of an agent's role+domains+name tokens with the task tokens. */
function overlapScore(meta: AgentLibraryMeta, taskTokens: Set<string>): number {
  const agentTokens = tokenize([meta.role, meta.name, ...meta.domains].join(' '));
  let score = 0;
  for (const t of agentTokens) if (taskTokens.has(t)) score++;
  return score;
}

/**
 * Score the cold-agent library against one task. Returns the best suggestion
 * only when it beats the planner hint's library-score by SUGGEST_MARGIN,
 * otherwise `undefined` (no event). Pure: no I/O, no mutation.
 */
export function scoreColdAgentSuggestion(
  task: { title: string; description: string },
  agentHint: string | null | undefined,
  library: AgentLibraryMeta[],
): ColdAgentSuggestion | undefined {
  if (library.length === 0) return undefined;
  const taskTokens = tokenize(`${task.title} ${task.description}`);

  const hintScore = (() => {
    const hinted = agentHint ? library.find((m) => m.id === agentHint) : undefined;
    return hinted ? overlapScore(hinted, taskTokens) : 0;
  })();

  let best: { meta: AgentLibraryMeta; score: number } | undefined;
  for (const meta of library) {
    if (meta.id === agentHint) continue; // never "suggest" the hint itself
    const score = overlapScore(meta, taskTokens);
    if (!best || score > best.score || (score === best.score && meta.id < best.meta.id)) {
      best = { meta, score };
    }
  }

  if (!best || best.score <= 0 || best.score - hintScore < SUGGEST_MARGIN) return undefined;

  return {
    suggestedAgentId: best.meta.id,
    score: best.score,
    reason: `library agent '${best.meta.id}' role/domain overlap (${best.score}) beats hint '${agentHint ?? 'none'}' (${hintScore}) by ≥${SUGGEST_MARGIN} — suggestion only`,
  };
}
