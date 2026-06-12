import type { RegisterKind } from './registers';
import type { CandidateType } from './capture';
import type { SourceKind } from './intake';
import type { MemoryScope } from './retriever';

export interface ClassifierInput {
  body: string;
  projectId?: string;
  sourceKind?: SourceKind;
  candidateType?: CandidateType;
  /** Explicit user tag from the UI — always wins. */
  userTag?: { register: RegisterKind; scope: MemoryScope };
}

export interface ClassifierDecision {
  register: RegisterKind;
  scope: MemoryScope;
  method: 'rule' | 'llm';
  /** Which deterministic rule fired (telemetry / dossier provenance). */
  rule?: string;
}

export interface LlmFallbackInfo {
  bodyHead: string;
  answer: string;
}

export interface ClassifierOpts {
  /**
   * Light LLM used ONLY on abstain (ADR 0004 §5). Injected so this package
   * stays LLM-free; the dispatcher wires it through @mas/core llm.ts (eco).
   */
  llm: (prompt: string) => Promise<string> | string;
  /** Called once per LLM fallback — the dispatcher logs it to events (/trace). */
  onLlmFallback?: (info: LlmFallbackInfo) => void;
}

// Keyword table from the 2026-06-12 pre-flight (memory-patterns §Classifier signals).
// Matched against the head of the body, case-insensitive.
const KEYWORD_RULES: Array<{ register: RegisterKind; re: RegExp; rule: string }> = [
  { register: 'journal', re: /^mission ".+" (validated|blocked|archived)/i, rule: 'mission-summary' },
  { register: 'decisions', re: /\b(decided|décidé|decision|chose|rejected|rejeté)\b/i, rule: 'kw-decision' },
  { register: 'learnings', re: /\b(learned|learning|TIL|pattern|appris)\b/i, rule: 'kw-learning' },
  { register: 'blockers', re: /\b(blocked|bloqué|blocker|stuck)\b/i, rule: 'kw-blocker' },
  { register: 'evals', re: /\b(eval|benchmark|score|R@\d)\b/i, rule: 'kw-eval' },
];

const SOURCE_KIND_REGISTER: Partial<Record<SourceKind, RegisterKind>> = {
  skill: 'learnings',
  pattern: 'learnings',
  repo: 'learnings',
  course: 'learnings',
};

const GLOBAL_SOURCE_KINDS: ReadonlySet<SourceKind> = new Set(['repo', 'course']);

const VALID_REGISTERS: ReadonlySet<string> = new Set([
  'decisions', 'learnings', 'blockers', 'journal', 'evals',
]);

function scopeFor(input: ClassifierInput): MemoryScope {
  if (input.candidateType === 'feedback' || input.candidateType === 'user') return 'global';
  if (input.sourceKind && GLOBAL_SOURCE_KINDS.has(input.sourceKind)) return 'global';
  return input.projectId ? 'project' : 'global';
}

/**
 * Rules-only classification: user tag → keyword table → source kind. Returns
 * null on abstain. Used directly by auto-file, which must never burn an LLM
 * call — an abstaining trusted candidate stays in the inbox.
 */
export function classifyByRulesOnly(input: ClassifierInput): ClassifierDecision | null {
  if (input.userTag) {
    return { ...input.userTag, method: 'rule', rule: 'user-tag' };
  }

  const head = input.body.slice(0, 200);
  for (const { register, re, rule } of KEYWORD_RULES) {
    if (re.test(head)) {
      return { register, scope: scopeFor(input), method: 'rule', rule };
    }
  }

  if (input.sourceKind && SOURCE_KIND_REGISTER[input.sourceKind]) {
    return {
      register: SOURCE_KIND_REGISTER[input.sourceKind]!,
      scope: scopeFor(input),
      method: 'rule',
      rule: `source-kind:${input.sourceKind}`,
    };
  }

  return null;
}

/**
 * Deterministic-first classification (ADR 0004 §5): rules via
 * classifyByRulesOnly; only when every rule abstains does the single injected
 * light-LLM call run — and the caller is notified so it lands in /trace.
 * No embeddings.
 */
export async function classifyCandidate(
  input: ClassifierInput,
  opts: ClassifierOpts,
): Promise<ClassifierDecision> {
  const byRules = classifyByRulesOnly(input);
  if (byRules) return byRules;

  const head = input.body.slice(0, 200);
  const prompt =
    'Classify this memory candidate into exactly one register among: ' +
    'decisions, learnings, blockers, journal, evals. Answer with the register name only.\n\n' +
    head;
  const answer = (await opts.llm(prompt)).trim().toLowerCase();
  opts.onLlmFallback?.({ bodyHead: head, answer });

  const register = (VALID_REGISTERS.has(answer) ? answer : 'journal') as RegisterKind;
  return { register, scope: scopeFor(input), method: 'llm' };
}
