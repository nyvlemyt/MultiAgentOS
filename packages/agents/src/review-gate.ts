import { type LLMClient, type ReviewerVerdict, type Risk } from '@mas/core';
import { validateDiffApplies } from './sandbox-diff';
import { realCodeReviewer } from './reviewers';

export interface ReviewGateInput {
  taskId: string;
  diff: string;
  repoDir: string;
  llm: LLMClient;
  taskBrief: { title: string; description: string };
  lastMessage: string;
  taskRisk: Risk;
}

export interface ReviewGateResult {
  approved: boolean;
  diffValid: boolean;
  verdicts: ReviewerVerdict[];
}

// A test file is named *.test.ts / *.spec.ts or the text declares a suite/case.
// Disjoint alternatives (S5852): each branch is anchored to distinct literals.
const TEST_CITED_RE = /\.(?:test|spec)\.[jt]sx?\b|\bdescribe\s*\(|\bit\s*\(/;
const MIN_KEYWORD_LEN = 4;

/**
 * Lines that carry the actual change content + the changed file paths. We keep
 * the `+++`/`---` path headers (added/removed file) and the `+`/`-` content
 * lines, but NOT the `diff --git`/`index`/`@@` format headers — those carry the
 * literals `diff`/`index`/`git` that would falsely match generic brief words.
 */
function diffSignal(diff: string): string {
  return diff
    .split('\n')
    .filter((line) => (line.startsWith('+') || line.startsWith('-')) && !line.startsWith('@@'))
    .join('\n')
    .toLowerCase();
}

/** Brief keywords ≥4 chars (filenames like file.txt survive as one token). */
function briefKeywords(brief: { title: string; description: string }): string[] {
  return `${brief.title} ${brief.description}`
    .toLowerCase()
    .split(/[^a-z0-9.]+/)
    .filter((w) => w.length >= MIN_KEYWORD_LEN);
}

/**
 * Reality Checker, made DETERMINISTIC (Phase 9 · 0b, plan §2.5 — no LLM). The
 * gate trusts a diff only with real evidence:
 *   evidence = diffApplies && (testsCited || diffCoversRequest)
 * where testsCited = the diff/producer-output names a test file or a suite, and
 * diffCoversRequest = the diff's changed paths/content overlap a brief keyword.
 * Default-to-NEEDS_WORK without evidence (never auto-approve an unsubstantiated
 * diff — CLAUDE.md §11.bis r4).
 */
function realityCheck(
  taskId: string,
  evidence: boolean,
): ReviewerVerdict {
  return evidence
    ? {
        taskId,
        verdict: 'PASS',
        findings: [{ severity: 'info', message: 'reality-check: evidence present — claims substantiated.' }],
      }
    : {
        taskId,
        verdict: 'NEEDS_WORK',
        findings: [{ severity: 'warn', message: 'reality-check: no evidence (no covering diff / cited tests) — defaulting to NEEDS_WORK.' }],
      };
}

/**
 * Gate a produced diff before it reaches the user: it must (a) apply cleanly via
 * `git apply --check`, (b) pass the real Code Reviewer (LLM critic, AGENTS.md §6),
 * and (c) pass the deterministic Reality Checker. The §5 human gate / mission
 * review still owns the final say; this only computes approved (advisory).
 */
export async function reviewProducedDiff(input: ReviewGateInput): Promise<ReviewGateResult> {
  const { taskId, diff, repoDir, llm, taskBrief, lastMessage } = input;
  const diffValid = (await validateDiffApplies(diff, repoDir)).ok;

  const signal = diffSignal(diff);
  const testsCited = TEST_CITED_RE.test(`${signal}\n${lastMessage.toLowerCase()}`);
  const keywords = briefKeywords(taskBrief);
  const diffCoversRequest = diff.trim().length > 0 && keywords.some((k) => signal.includes(k));
  const evidence = diffValid && (testsCited || diffCoversRequest);

  const codeVerdict = await realCodeReviewer(llm, { taskId, brief: taskBrief, diff });
  const verdicts: ReviewerVerdict[] = [codeVerdict, realityCheck(taskId, evidence)];

  const approved = diffValid && verdicts.every((v) => v.verdict === 'PASS');
  return { approved, diffValid, verdicts };
}
