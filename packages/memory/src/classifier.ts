import type { RegisterKind } from './registers';
import type { CandidateSourceKind, CandidateType } from './capture';
import type { Trust } from './conveyor/extractor';
import type { MemoryScope } from './retriever';

export interface ClassifierInput {
  body: string;
  projectId?: string;
  sourceKind?: CandidateSourceKind;
  candidateType?: CandidateType;
  /**
   * Extractor trust stamp. Its PRESENCE is the provenance signal the gate reads: only the
   * ingestion conveyor stamps it (`ExtractResult.trust`), so a defined value means "this body
   * is an ingested document", never "this body is a mission candidate". The value itself is the
   * separate security axis (ADR 0008 clause 6, `canAutoPromote`).
   */
  trust?: Trust;
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
//
// DOMAIN OF VALIDITY — read before touching a row: these 5 rules judge MISSION prose, the short
// declarative sentences an agent writes about its own run ("Decided to…", "We learned that…").
// They are correct there and are NOT the defect fixed on 2026-09-07. What was missing is the
// frontier below (isIngestedProvenance): applied to the COURSE prose the ingestion conveyor
// serves, the registry's words are also the taught domain's words — "Deep **Learning**",
// "**Score** Report", "don't stay **blocked**" — and 51 of 51 documents were mis-filed.
const KEYWORD_RULES: Array<{ register: RegisterKind; re: RegExp; rule: string }> = [
  { register: 'journal', re: /^mission ".+" (validated|blocked|archived)/i, rule: 'mission-summary' },
  { register: 'decisions', re: /\b(decided|décidé|decision|chose|rejected|rejeté)\b/i, rule: 'kw-decision' },
  { register: 'learnings', re: /\b(learned|learning|TIL|pattern|appris)\b/i, rule: 'kw-learning' },
  { register: 'blockers', re: /\b(blocked|bloqué|blocker|stuck)\b/i, rule: 'kw-blocker' },
  { register: 'evals', re: /\b(eval|benchmark|score|R@\d)\b/i, rule: 'kw-eval' },
];

/**
 * Source kinds that carry a third-party DOCUMENT rather than first-party prose. `note` is
 * deliberately absent: a note is something the user wrote, so the mission table judges it
 * (that is what keeps ADR 0004 §7 auto-file working). `mission` is absent for the same reason.
 */
const INGESTED_SOURCE_KINDS: ReadonlySet<CandidateSourceKind> = new Set(['skill', 'pattern', 'repo', 'course']);

/**
 * PROVENANCE GATE (2026-09-07, docs/backlog/classifieur-faux-positifs-cours.md).
 *
 * True when the candidate is ingested third-party material rather than a mission candidate. Reads
 * only fields the producers ALREADY fill — no new model, no new column:
 *  - `trust`  — stamped by an extractor, so its presence alone means "came off the conveyor";
 *  - `candidateType === 'reference'` — the type intake gives every document source;
 *  - `sourceKind` — one of the document kinds above.
 * Any one of them is enough: a producer that labels its output only partially must still be
 * gated, so the frontier fails closed.
 */
export function isIngestedProvenance(input: ClassifierInput): boolean {
  if (input.trust !== undefined) return true;
  if (input.candidateType === 'reference') return true;
  return input.sourceKind !== undefined && INGESTED_SOURCE_KINDS.has(input.sourceKind);
}

/**
 * The decision stamped on an ingested candidate. The 5 mission registers are a first-person
 * mission ledger; an ingested document is not a decision, a blocker or a mission learning, and
 * its durable home is the fiche → études mirror path (P1-14). So the honest answer is an abstain
 * with its cause named, which routes the row to human triage: `parseClassifierDecision` reads it
 * as unroutable, exactly like any other abstain.
 */
export const INGESTED_ABSTAIN =
  'abstain — ingested source: the mission registers take mission candidates only';

const VALID_REGISTERS: ReadonlySet<string> = new Set([
  'decisions', 'learnings', 'blockers', 'journal', 'evals',
]);

function scopeFor(input: ClassifierInput): MemoryScope {
  if (input.candidateType === 'feedback' || input.candidateType === 'user') return 'global';
  return input.projectId ? 'project' : 'global';
}

/**
 * Rules-only classification: user tag → provenance gate → mission keyword table. Returns null on
 * abstain. Used directly by auto-file, which must never burn an LLM call — an abstaining trusted
 * candidate stays in the inbox.
 *
 * The user tag is checked BEFORE the gate on purpose: a human who tagged a document has looked at
 * it, and that judgement outranks any provenance heuristic. It is the one way ingested material
 * still reaches a register.
 */
export function classifyByRulesOnly(input: ClassifierInput): ClassifierDecision | null {
  if (input.userTag) {
    return { ...input.userTag, method: 'rule', rule: 'user-tag' };
  }

  if (isIngestedProvenance(input)) return null;

  const head = input.body.slice(0, 200);
  for (const { register, re, rule } of KEYWORD_RULES) {
    if (re.test(head)) {
      return { register, scope: scopeFor(input), method: 'rule', rule };
    }
  }

  return null;
}

/**
 * Deterministic-first classification (ADR 0004 §5): rules via classifyByRulesOnly; only when every
 * rule abstains does the single injected light-LLM call run — and the caller is notified so it
 * lands in /trace. No embeddings.
 *
 * Returns null for ingested provenance, WITHOUT calling the LLM: "which of the 5 mission registers
 * is this?" is not a question a course document has an answer to, so asking a model would only
 * launder the same category error — at one quota call per document.
 */
export async function classifyCandidate(
  input: ClassifierInput,
  opts: ClassifierOpts,
): Promise<ClassifierDecision | null> {
  const byRules = classifyByRulesOnly(input);
  if (byRules) return byRules;
  if (isIngestedProvenance(input)) return null;

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
