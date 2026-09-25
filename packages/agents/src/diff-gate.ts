import { mkdirSync, writeFileSync } from 'node:fs';
import { realpath } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Mission, type Task } from '@mas/db';
import { assertDiffWithinProject, BlockedPathError, type LLMClient } from '@mas/core';
import { delegateWithDiff, type DelegateInput, type DelegateOutcome } from './delegate';
import { reviewProducedDiff, type ReviewGateResult } from './review-gate';
import { pauseForPathEscape, type RiskGatePause } from './risk-gate';
import { type Db, logEvent } from './mission-events';

// The §5 gate on a PRODUCED diff and its bounded correction loop, extracted from
// dispatch.ts (God-file card) so each stays under the S3776 complexity cap.

// All MultiAgentOS-produced task artifacts land here (CLAUDE.md §8: never
// data/memory/). Hoisted to one literal (S1192).
export const OUTPUTS_DIR = 'data/outputs';
const PATH_ESCAPE = 'path_escape';

function repoRootDir(): string {
  const here = fileURLToPath(new URL('.', import.meta.url));
  return resolve(here, '../../..');
}

export interface GateArgs {
  db: Db;
  m: Mission;
  next: Task;
  repoDir: string;
  diff: string;
  fiche: string;
  llm: LLMClient;
  lastMessage: string;
}

export type GateOutcome =
  | { kind: 'reviewed'; outputPath: string; review: ReviewGateResult }
  | { kind: 'path_escape'; outputPath: string; escape: BlockedPathError };

// Runs the §5 review gate on a produced diff: write it under data/outputs, check
// it applies + collect the real Code-Reviewer (LLM) + deterministic Reality-Checker
// verdicts, log the result. The Reality Checker derives evidence from the diff +
// producer output (plan §2.5) — never auto-approves an unsubstantiated diff
// (CLAUDE.md §11.bis r4).
export async function gateProducedDiff(args: GateArgs): Promise<GateOutcome> {
  const { db, m, next, repoDir, diff, fiche, llm, lastMessage } = args;
  const patchPath = `${OUTPUTS_DIR}/${next.id}.patch`;
  const absDir = resolve(repoRootDir(), OUTPUTS_DIR);
  mkdirSync(absDir, { recursive: true });
  // git apply rejects a patch with no trailing newline ("corrupt patch"); the
  // extracted diff body is trimmed, so re-add one before writing/validating.
  const patch = diff.endsWith('\n') ? diff : `${diff}\n`;
  writeFileSync(resolve(repoRootDir(), patchPath), patch, 'utf-8');

  // §5 path gate — write containment runs BEFORE any critic, so a diff that would
  // touch a path outside project.path never costs a review call and never ends as
  // task_done: the caller routes it to the human pause (pauseForPathEscape).
  try {
    await assertDiffWithinProject(patch, { projectRoot: repoDir, realpath });
  } catch (e) {
    if (e instanceof BlockedPathError) return { kind: PATH_ESCAPE, outputPath: patchPath, escape: e };
    throw e;
  }

  const review = await reviewProducedDiff({
    taskId: next.id,
    diff: patch,
    repoDir,
    llm,
    taskBrief: { title: next.title, description: next.description },
    lastMessage,
    taskRisk: next.risk,
  });
  await logEvent(db, {
    missionId: m.id,
    taskId: next.id,
    agentId: next.agentId ?? undefined,
    type: 'tier_b_review',
    risk: next.risk,
    payload: { verdicts: review.verdicts, approved: review.approved, diffValid: review.diffValid, fiche },
  });
  return { kind: 'reviewed', outputPath: patchPath, review };
}

// Evaluator-Optimizer (anthropic-ecosystem.md:170): a produced diff that the gate
// does not approve gets ONE bounded re-attempt cycle. Bounded by both the
// iteration cap AND the task budget (production-patterns.md:101 circuit breaker) —
// an unbounded "loop until satisfied" is a KILL criterion (plan §1). Default 2.
const MAX_REVIEW_ITERATIONS = 2;

// Findings the next producer attempt must address, as a prompt block. Hoisted
// literal (S1192).
const FINDINGS_HEADER = '### Reviewer findings to address:';
function findingsBlock(review: ReviewGateResult): string {
  const lines = review.verdicts
    .flatMap((v) => v.findings)
    .filter((f) => f.severity !== 'info')
    .map((f) => `- [${f.severity}] ${f.message}`);
  return lines.length > 0 ? `${FINDINGS_HEADER}\n${lines.join('\n')}` : FINDINGS_HEADER;
}

export interface RefineArgs {
  db: Db;
  m: Mission;
  next: Task;
  repoDir: string;
  fiche: string;
  llm: LLMClient;
  producerInput: Omit<DelegateInput, 'skillContext'>;
  chainedSkillContext: string;
}

/** Evaluator-Optimizer state threaded through the bounded correction loop. */
export interface RefineState {
  outcome: DelegateOutcome;
  spentTokens: number;
  outputPath: string;
  review: ReviewGateResult;
}

// Bounded correction loop: re-invoke the producer with the prior findings
// injected, re-gate, until approved OR the cap OR the budget is reached. A path
// escape on a retry pauses for the human exactly like a first-pass escape.
export async function refineUntilApproved(
  args: RefineArgs,
  initial: RefineState,
): Promise<({ kind: 'refined' } & RefineState) | RiskGatePause> {
  const { db, m, next, repoDir, fiche, llm, producerInput, chainedSkillContext } = args;
  let { outcome, spentTokens, outputPath, review } = initial;
  for (let iteration = 1; iteration <= MAX_REVIEW_ITERATIONS && !review.approved; iteration++) {
    // Project the next retry's cost as ≈ the last iteration's spend and bail
    // BEFORE incurring it: delegateWithDiff bills the moment it returns, so the
    // bounded loop must stop here or it could overrun next.budgetTokens.
    const lastSpend = outcome.response.inputTokens + outcome.response.outputTokens;
    if (spentTokens + lastSpend > (next.budgetTokens ?? Number.MAX_SAFE_INTEGER)) break;

    const retrySkillContext = [chainedSkillContext, findingsBlock(review)].filter(Boolean).join('\n\n');
    outcome = await delegateWithDiff({ ...producerInput, skillContext: retrySkillContext });
    spentTokens += outcome.response.inputTokens + outcome.response.outputTokens;

    if (!outcome.diff) {
      // Optimizer regression: an earlier iteration produced a diff, this retry
      // produced none. Keep the prior (unapproved) gate and stop — re-gating
      // nothing would falsely "approve" by absence. Surfaced for the daily report.
      await logEvent(db, {
        missionId: m.id,
        taskId: next.id,
        agentId: next.agentId ?? undefined,
        type: 'producer_regressed_no_diff',
        risk: next.risk,
        payload: { iteration },
      });
      break;
    }
    const reGated = await gateProducedDiff({ db, m, next, repoDir, diff: outcome.diff, fiche, llm, lastMessage: outcome.response.text });
    if (reGated.kind === PATH_ESCAPE) return pauseForPathEscape(db, m, next, reGated.escape, reGated.outputPath, spentTokens);
    outputPath = reGated.outputPath;
    review = reGated.review;
    await logEvent(db, {
      missionId: m.id,
      taskId: next.id,
      agentId: next.agentId ?? undefined,
      type: 'review_iteration',
      risk: next.risk,
      payload: { iteration, approved: review.approved, verdicts: review.verdicts },
    });
  }
  return { kind: 'refined', outcome, spentTokens, outputPath, review };
}
