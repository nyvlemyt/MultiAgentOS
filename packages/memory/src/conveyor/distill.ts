// packages/memory/src/conveyor/distill.ts
// The distillation stage of the Living Knowledge OS conveyor (ADR 0008, design spec §5 Brique 6):
// a captured SAS document (raw markdown + manifest entry) → ONE fiche distillée. The LLM is called
// exactly once, through the injected @mas/core LLMClient (the single §11 injection point) — this
// package never instantiates a client. The raw body is UNTRUSTED: it is wrapped by wrapUntrusted
// before the model, the model's reply is `unknown` and narrowed by Zod safeParse, and every
// security-critical field (lifecycle, trust, id, source_key, derived_from, superseded_by) is set
// from the TRUSTED input, never from the model. A distilled fiche enters at `distilled` (the review
// state, ADR 0008 clause 4) and is NEVER auto-promoted to audited/active/trusted. NOT in the barrel.
import { z } from 'zod';
import type { LLMClient, Mode } from '@mas/core';
import { SCHEMA_VERSION, isLegalTransition, type Fiche } from '../fiche';
import type { Trust } from './extractor';
import { wrapUntrusted } from './anti-injection';

/** Lifecycle state a freshly-distilled fiche enters (ADR 0008 clause 4: triaged→distilled→audited). */
export const DISTILL_ENTRY_STATE = 'distilled';

/** Distillation tier = Sonnet (ADR 0008 clause 11; mirrors reviewers.ts REVIEWER_MODEL). */
export const DISTILL_MODEL = 'claude-sonnet-4-6';
const DISTILL_MODE: Mode = 'standard';
const DISTILL_DOMAIN = 'memory';

/**
 * Per-run token ceiling (CLAUDE.md §6/§11.bis anti-runaway). A conservative default sized for one
 * source: a big source (course, book) is a manifest of atomic children, each distilled on its own,
 * so a single distill call is never the whole corpus. Exceeding the cap stops BEFORE the call.
 */
export const DEFAULT_DISTILL_TOKEN_CAP = 32_000;

/** Rough token estimate (~4 chars/token) — deterministic, no tokenizer dependency. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/** Thrown when the pre-flight estimate exceeds the cap. The call is never made (never burns past). */
export class BudgetExceededError extends Error {
  constructor(readonly estimate: number, readonly cap: number, readonly remaining: number) {
    super(`[distill] token budget exceeded: estimate ${estimate} > cap ${cap} (remaining ${remaining})`);
    this.name = 'BudgetExceededError';
  }
}

/** Thrown when the model reply cannot be parsed into a well-formed fiche (never a half-built fiche). */
export class DistillParseError extends Error {
  constructor(detail: string) {
    super(`[distill] malformed model output: ${detail}`);
    this.name = 'DistillParseError';
  }
}

/** A captured SAS document + its manifest provenance. The trusted half of the fiche. */
export interface DistillInput {
  /** Immutable fiche id/slug, minted at capture (STRUCTURE.md §5). */
  id: string;
  /** Idempotence/supersede match key. */
  sourceKey: string;
  /** Raw source path/URL — fills the REQUIRED FicheSchema `derived_from` (ADR 0008 clause 6). */
  derivedFrom: string;
  /** Security tag from the extractor. NEVER overridden by the model. */
  trust: Trust;
  /** Human title (context for the model; not a security field). */
  title: string;
  /** The UNTRUSTED captured markdown. */
  rawMarkdown: string;
  /** Optional manifest linkage for a child fiche (course lesson, book chapter). */
  partOf?: string | null;
  order?: number | null;
  /** Optional scope; ingested resources default to global. */
  scope?: 'project' | 'global';
}

export interface DistillDeps {
  /** The single LLM injection point (@mas/core). Tests pass mockLLM(); the CLI passes claudeCodeLLM. */
  llm: LLMClient;
  /** Per-run token cap. Default DEFAULT_DISTILL_TOKEN_CAP. */
  tokenCap?: number;
}

export interface DistilledFiche {
  frontmatter: Fiche;
  body: string;
}

// ---- LLM output contract (untrusted → Zod) --------------------------------
// The model returns ONLY the intellectual content it may legally shape: the doc_type choice, the
// emergent taxonomy (lane/tags/domain), and the per-template body sections. It has NO say over
// identity, provenance, trust, or lifecycle — those are forced from the trusted input below.

const referenceBody = z.object({
  doc_type: z.literal('reference'),
  summary: z.string().min(1), fields: z.string().min(1),
  constraints: z.string().min(1), examples: z.string().min(1),
});
const howtoBody = z.object({
  doc_type: z.literal('howto'),
  problem: z.string().min(1), solution: z.string().min(1),
  variations: z.string().min(1), pitfalls: z.string().min(1),
});
const tutorialBody = z.object({
  doc_type: z.literal('tutorial'),
  goal: z.string().min(1), prerequisites: z.string().min(1),
  steps: z.string().min(1), result: z.string().min(1), next: z.string().min(1),
});
const explanationBody = z.object({
  doc_type: z.literal('explanation'),
  thesis: z.string().min(1), context: z.string().min(1),
  reasoning: z.string().min(1), tradeoffs: z.string().min(1), see_also: z.string().min(1),
});

const emergent = z.object({
  lane: z.string().min(1),
  tags: z.array(z.string()).default([]),
  domain: z.string().optional(),
});

const LLMOutput = z.intersection(
  emergent,
  z.discriminatedUnion('doc_type', [referenceBody, howtoBody, tutorialBody, explanationBody]),
);
type LLMOutput = z.infer<typeof LLMOutput>;

// ---- Diátaxis body rendering (STRUCTURE.md §4, FROZEN) --------------------

function section(heading: string, content: string): string {
  return `## ${heading}\n\n${content.trim()}\n`;
}

/** Render the one body for the model's chosen doc_type. Skeletons frozen in STRUCTURE.md §4. */
function renderBody(title: string, out: LLMOutput): string {
  const head = `# ${title}\n`;
  switch (out.doc_type) {
    case 'reference':
      return [head, section('Summary', out.summary), section('Fields/API', out.fields),
        section('Constraints', out.constraints), section('Examples', out.examples)].join('\n');
    case 'howto':
      return [head, section('Problem', out.problem), section('Solution', out.solution),
        section('Variations', out.variations), section('Pitfalls', out.pitfalls)].join('\n');
    case 'tutorial':
      return [head, section('Goal', out.goal), section('Prerequisites', out.prerequisites),
        section('Steps', out.steps), section('Result', out.result), section('Next', out.next)].join('\n');
    case 'explanation':
      return [head, section('Thesis', out.thesis), section('Context', out.context),
        section('Reasoning', out.reasoning), section('Trade-offs', out.tradeoffs),
        section('See also', out.see_also)].join('\n');
  }
}

/** Diátaxis doc_type → the object shape it maps a fiche's actionability onto (STRUCTURE.md §1/§4). */
const ACTIONABILITY: Record<LLMOutput['doc_type'], Fiche['actionability']> = {
  tutorial: 'resource', howto: 'area', reference: 'resource', explanation: 'resource',
};

// ---- Prompt craft (docs/knowledge/prompting-anthropic.md — XML tags + explicit format) ---------

const SYSTEM_PROMPT = [
  'You are the Distiller of a knowledge conveyor. You turn one raw source into ONE structured fiche.',
  'Choose the single best Diátaxis doc_type for the source: tutorial (learning by doing),',
  'howto (a goal-oriented recipe), reference (lookup facts), or explanation (understanding-oriented).',
  'Then write the sections that doc_type requires, faithfully summarising the source — never inventing facts.',
  '',
  'Reply with a SINGLE JSON object and nothing else. Required keys:',
  '  doc_type: one of "tutorial" | "howto" | "reference" | "explanation"',
  '  lane: a short backbone lane (e.g. "knowledge", "workflows", "resources")',
  '  tags: array of short topical strings',
  '  domain (optional): one broad domain string',
  '  Then the section keys for the chosen doc_type:',
  '   - reference: summary, fields, constraints, examples',
  '   - howto: problem, solution, variations, pitfalls',
  '   - tutorial: goal, prerequisites, steps, result, next',
  '   - explanation: thesis, context, reasoning, tradeoffs, see_also',
  'Do NOT include id, slug, source_key, derived_from, trust, lifecycle, or superseded_by — those are set by the system.',
].join('\n');

function buildUserPrompt(input: DistillInput): string {
  return [
    `Source title: ${input.title}`,
    'Distil the delimited source below into one fiche, following the JSON contract exactly.',
    wrapUntrusted(input.rawMarkdown),
  ].join('\n');
}

// ---- Untrusted-reply parsing ----------------------------------------------

function parseReply(text: string): LLMOutput {
  let raw: unknown;
  try {
    raw = JSON.parse(extractJson(text));
  } catch {
    throw new DistillParseError('reply is not valid JSON');
  }
  const parsed = LLMOutput.safeParse(raw);
  if (!parsed.success) {
    throw new DistillParseError(parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; '));
  }
  return parsed.data;
}

/** Pull the first balanced JSON object out of a reply (tolerates a stray prose wrapper / code fence). */
function extractJson(text: string): string {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return text;
  return text.slice(start, end + 1);
}

// ---- The stage ------------------------------------------------------------

/**
 * Distil one captured SAS document into one fiche distillée. Calls the injected LLM ONCE. The raw
 * body is anti-injection-wrapped before the model; the reply is narrowed by Zod; identity/provenance/
 * trust/lifecycle are forced from the trusted input. The fiche enters at `distilled` (never promoted).
 * Throws BudgetExceededError before the call if the estimate exceeds the cap, and DistillParseError
 * on a malformed reply — never a half-built fiche.
 */
export async function distill(input: DistillInput, deps: DistillDeps): Promise<DistilledFiche> {
  const cap = deps.tokenCap ?? DEFAULT_DISTILL_TOKEN_CAP;
  const user = buildUserPrompt(input);
  const estimate = estimateTokens(SYSTEM_PROMPT) + estimateTokens(user);
  if (estimate > cap) {
    throw new BudgetExceededError(estimate, cap, Math.max(0, cap - estimate));
  }

  const resp = await deps.llm.call({
    system: SYSTEM_PROMPT, user, model: DISTILL_MODEL, mode: DISTILL_MODE, domain: DISTILL_DOMAIN,
  });
  const out = parseReply(resp.text);

  // Guard the entry transition through the closed legal-transition table (data, ADR 0008 clause 4).
  if (!isLegalTransition('triaged', DISTILL_ENTRY_STATE)) {
    throw new Error(`[distill] entry transition triaged → ${DISTILL_ENTRY_STATE} is not legal`);
  }

  const frontmatter: Fiche = {
    id: input.id, slug: input.id, source_key: input.sourceKey,
    part_of: input.partOf ?? null, order: input.order ?? null, manifest: null,
    derived_from: input.derivedFrom, sources: [],
    lifecycle: DISTILL_ENTRY_STATE, superseded_by: null,
    trust: input.trust, ocr_confidence: null, retrieval_context: null, quality_score: null,
    kind: 'resource', register: 'learnings', scope: input.scope ?? 'global',
    doc_type: out.doc_type, actionability: ACTIONABILITY[out.doc_type], lane: out.lane,
    schema_version: SCHEMA_VERSION,
    tags: out.tags, ...(out.domain ? { domain: out.domain } : {}),
  };

  return { frontmatter, body: renderBody(input.title, out) };
}
