import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { rmSync } from 'node:fs';
import { reviewProducedDiff } from './review-gate';
import { makeTempGitRepo, CLEAN_TEST_DIFF as CLEAN_DIFF, GARBAGE_TEST_DIFF as GARBAGE_DIFF } from './testing';

describe('reviewProducedDiff', () => {
  let repo: string;
  beforeEach(async () => {
    repo = await makeTempGitRepo('mas-gate-');
  });
  afterEach(() => {
    rmSync(repo, { recursive: true, force: true });
  });

  it('approves a valid diff with evidence', async () => {
    const res = await reviewProducedDiff({ taskId: 't1', diff: CLEAN_DIFF, repoDir: repo, evidence: true });
    expect(res.diffValid).toBe(true);
    expect(res.approved).toBe(true);
    expect(res.verdicts).toHaveLength(2);
  });

  it('rejects a garbage diff (diffValid false)', async () => {
    const res = await reviewProducedDiff({ taskId: 't2', diff: GARBAGE_DIFF, repoDir: repo, evidence: true });
    expect(res.diffValid).toBe(false);
    expect(res.approved).toBe(false);
  });

  it('rejects a valid diff without evidence (Reality Checker NEEDS_WORK)', async () => {
    const res = await reviewProducedDiff({ taskId: 't3', diff: CLEAN_DIFF, repoDir: repo, evidence: false });
    expect(res.diffValid).toBe(true);
    expect(res.approved).toBe(false);
  });
});
