import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  type LLMClient,
  type Mode,
  type ReviewKind,
  type ReviewerVerdict,
  type Risk,
} from '@mas/core';

// Real mission critics (Phase 9 · 0b). Each loads its Tier-A fiche, builds a
// coverage-biased system prompt + verdict-format instruction, delegates to the
// injected LLMClient, and parses the `## Verdict` block. CI stays live-model-free
// because the deterministic seams (mockLLM + the vi.mock'd clients) emit a
// parseable verdict when `reviewKind` is set; the real client ignores it and the
// fiche's `## Verdict` instruction drives the verdict. §11: no SDK import — the
// caller injects the client; we never instantiate one.

const REVIEWER_MODEL = 'claude-sonnet-4-6';
const REVIEW_MODE: Mode = 'standard';

// Coverage-first review prompt (docs/knowledge/prompting-anthropic.md:104-110):
// maximize recall — a verify step filters later. Used verbatim by every critic.
const COVERAGE_PROMPT = [
  'Report every issue you find, including ones you are uncertain about or consider low-severity.',
  'Do not filter for importance or confidence at this stage — a separate verification step will do that.',
  'Your goal here is coverage: better to surface a finding that later gets filtered than to silently drop a real bug.',
  'For each finding, include your confidence level and an estimated severity.',
].join('\n');

// The exact output contract the critic must emit so parseVerdict can read it.
const VERDICT_FORMAT = [
  'Reply in EXACTLY this format and nothing else:',
  '',
  '## Verdict',
  'PASS | NEEDS_WORK | NEEDS_CHANGES | BLOCK',
  '',
  '## Findings',
  '- [block|warn|info] <one finding per line>',
].join('\n');

// Inline fallbacks when a fiche file cannot be read (bundler path where the
// relative resolve fails — same degradation as delegate.ts loadPreface()). Kept
// tight; the canonical copy lives in packages/agents/fiches/<id>.md.
const FICHE_FALLBACK: Record<string, string> = {
  reviewer: 'You are the Code Reviewer. Validate the change against the task brief; flag missing tests; reject if any task is missing its definition of done.',
  'sec-reviewer': 'You are the Security Reviewer. Default to NEEDS_CHANGES; evidence required for PASS. Block actions touching secrets, outbound sends, payments, force pushes, or cross-project writes.',
  'quality-controller': 'You are the Quality Controller. Check PROCESS and RULES (conventions, architecture, no-PAYG drift, output language) — not the code. BLOCK only on a concrete process/rule breach.',
  'agent-evaluator': 'You are the Agent Evaluator (agent-as-judge, RES-043). Score the deliverable on Accuracy, Completeness, Clarity, Actionability, Conciseness with cited evidence; never re-perform the task. Verdict: deliver (PASS) | fix (NEEDS_WORK) | redo (BLOCK).',
};

function loadFiche(id: keyof typeof FICHE_FALLBACK): string {
  const fallback = FICHE_FALLBACK[id] ?? '';
  try {
    const here = fileURLToPath(new URL('.', import.meta.url));
    const path = resolve(here, `../fiches/${id}.md`);
    return readFileSync(path, 'utf-8').trim();
  } catch {
    return fallback;
  }
}

// Disjoint quantifiers (S5852/S8786): in VERDICT_RE the `[ \t]*` and `[^\n]*` runs
// are separated by literals; FINDING_RE captures everything after `]` in a single
// greedy `(.*)` (leading space trimmed in code) so no two adjacent quantifiers can
// overlap — no super-linear backtracking.
const VERDICT_RE = /##[ \t]*Verdict[^\n]*\n[ \t]*(PASS|NEEDS_WORK|NEEDS_CHANGES|BLOCK)/i;
const FINDING_RE = /^-[ \t]*\[(block|warn|info)\](.*)$/gim;

type Severity = ReviewerVerdict['findings'][number]['severity'];

/**
 * Parse a critic's markdown into a ReviewerVerdict. Maps NEEDS_CHANGES→NEEDS_WORK.
 * FAIL-SAFE: no `## Verdict` found → NEEDS_WORK with a warn finding. Never a
 * silent PASS on unparseable text (Phase 9 · 0b, plan §2.4).
 */
export function parseVerdict(taskId: string, text: string): ReviewerVerdict {
  const match = VERDICT_RE.exec(text);
  if (!match) {
    return {
      taskId,
      verdict: 'NEEDS_WORK',
      findings: [{ severity: 'warn', message: 'could not parse verdict — defaulting to NEEDS_WORK' }],
    };
  }
  const raw = (match[1] ?? '').toUpperCase();
  const verdict: ReviewerVerdict['verdict'] = raw === 'NEEDS_CHANGES' ? 'NEEDS_WORK' : (raw as ReviewerVerdict['verdict']);

  const findings: ReviewerVerdict['findings'] = [];
  let f: RegExpExecArray | null;
  while ((f = FINDING_RE.exec(text)) !== null) {
    findings.push({ severity: (f[1] ?? 'info').toLowerCase() as Severity, message: (f[2] ?? '').trim() });
  }
  if (findings.length === 0) {
    findings.push({ severity: 'info', message: 'no findings reported' });
  }
  return { taskId, verdict, findings };
}

interface CriticBrief {
  title: string;
  description: string;
}

async function runCritic(
  llm: LLMClient,
  args: { taskId: string; ficheId: keyof typeof FICHE_FALLBACK; reviewKind: ReviewKind; userPrompt: string },
): Promise<ReviewerVerdict> {
  const system = [loadFiche(args.ficheId), COVERAGE_PROMPT, VERDICT_FORMAT].join('\n\n');
  const resp = await llm.call({
    system,
    user: args.userPrompt,
    model: REVIEWER_MODEL,
    mode: REVIEW_MODE,
    reviewKind: args.reviewKind,
  });
  return parseVerdict(args.taskId, resp.text);
}

export interface ReviewerInput {
  taskId: string;
  brief: CriticBrief;
  lastMessage?: string;
  /** Prior critic findings injected on a re-loop (evaluator-optimizer). */
  priorFindings?: string[];
}

// Render a list as markdown bullets. Extracted so the call sites avoid nested
// template literals (S4624).
function bulletList(items: string[]): string {
  return items.map((item) => `- ${item}`).join('\n');
}

function briefBlock(brief: CriticBrief, lastMessage?: string, priorFindings?: string[]): string {
  const parts = [`## Task brief\n${brief.title}\n${brief.description}`];
  if (lastMessage) parts.push(`## Producer output\n${lastMessage}`);
  if (priorFindings && priorFindings.length > 0) {
    parts.push(`## Reviewer findings to address\n${bulletList(priorFindings)}`);
  }
  return parts.join('\n\n');
}

/** Code Reviewer lens on the mission output (last task) before validation. */
export async function realReviewer(llm: LLMClient, input: ReviewerInput): Promise<ReviewerVerdict> {
  return runCritic(llm, {
    taskId: input.taskId,
    ficheId: 'reviewer',
    reviewKind: 'reviewer',
    userPrompt: briefBlock(input.brief, input.lastMessage, input.priorFindings),
  });
}

export interface SecReviewerInput {
  taskId: string;
  risk: Risk;
  brief: CriticBrief;
}

/** Security gate for a high/blocking-risk task. Maps NEEDS_CHANGES→NEEDS_WORK. */
export async function realSecReviewer(llm: LLMClient, input: SecReviewerInput): Promise<ReviewerVerdict> {
  const riskNote = input.risk === 'blocking' ? '\nrisk=blocking' : `\nrisk=${input.risk}`;
  return runCritic(llm, {
    taskId: input.taskId,
    ficheId: 'sec-reviewer',
    reviewKind: 'sec',
    userPrompt: `${briefBlock(input.brief)}${riskNote}`,
  });
}

export interface QualityControllerInput {
  taskId: string;
  taskTitles: string[];
}

/** Process/rules gate (AGENTS.md §4): runs BEFORE the reviewer. */
export async function realQualityController(llm: LLMClient, input: QualityControllerInput): Promise<ReviewerVerdict> {
  return runCritic(llm, {
    taskId: input.taskId,
    ficheId: 'quality-controller',
    reviewKind: 'qc',
    userPrompt: `## Task titles to audit for process/rules drift\n${bulletList(input.taskTitles)}`,
  });
}

export interface EvaluatorInput {
  taskId: string;
  brief: CriticBrief;
  lastMessage?: string;
}

/**
 * Agent Evaluator (Phase 9 · 0c, RES-043 agent-as-judge). The transverse rubric
 * judge of the mission output — DISTINCT from the QC/Reviewer/Sec gates: it scores
 * the deliverable (deliver/fix/redo, mapped onto PASS/NEEDS_WORK/BLOCK) and is
 * advisory (the caller logs it; it does not flip the mission to blocked). A producer
 * never validates its own output — this is a separate critic instance.
 */
export async function realAgentEvaluator(llm: LLMClient, input: EvaluatorInput): Promise<ReviewerVerdict> {
  return runCritic(llm, {
    taskId: input.taskId,
    ficheId: 'agent-evaluator',
    reviewKind: 'evaluator',
    userPrompt: briefBlock(input.brief, input.lastMessage),
  });
}

export interface CodeReviewerInput {
  taskId: string;
  brief: CriticBrief;
  diff: string;
}

/** Tier-B diff gate: the reviewer fiche applied to a produced diff (AGENTS.md §6). */
export async function realCodeReviewer(llm: LLMClient, input: CodeReviewerInput): Promise<ReviewerVerdict> {
  return runCritic(llm, {
    taskId: input.taskId,
    ficheId: 'reviewer',
    reviewKind: 'code',
    userPrompt: `${briefBlock(input.brief)}\n\n## Diff under review\n${input.diff}`,
  });
}
