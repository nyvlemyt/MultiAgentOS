import { mockCodeReviewer, mockRealityChecker, type ReviewerVerdict } from '@mas/core';
import { validateDiffApplies } from './sandbox-diff';

export interface ReviewGateInput {
  taskId: string;
  diff: string;
  repoDir: string;
  evidence: boolean;
}

export interface ReviewGateResult {
  approved: boolean;
  diffValid: boolean;
  verdicts: ReviewerVerdict[];
}

/**
 * Gate a produced diff before it reaches the user: it must (a) apply cleanly via
 * `git apply --check` and (b) pass both the Code Reviewer and the Reality
 * Checker (AGENTS.md §6). The Reality Checker defaults to NEEDS_WORK without
 * evidence, so an unsubstantiated change is never auto-approved.
 */
export async function reviewProducedDiff(input: ReviewGateInput): Promise<ReviewGateResult> {
  const { taskId, diff, repoDir, evidence } = input;
  const diffValid = (await validateDiffApplies(diff, repoDir)).ok;
  const verdicts: ReviewerVerdict[] = [
    mockCodeReviewer(taskId, { hasDiff: !!diff }),
    mockRealityChecker(taskId, { evidence }),
  ];
  const approved = diffValid && verdicts.every((v) => v.verdict === 'PASS');
  return { approved, diffValid, verdicts };
}
