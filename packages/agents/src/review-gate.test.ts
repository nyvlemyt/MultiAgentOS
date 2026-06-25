import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { rmSync } from 'node:fs';
import { mockLLM } from '@mas/core';
import { reviewProducedDiff } from './review-gate';
import { makeTempGitRepo, CLEAN_TEST_DIFF as CLEAN_DIFF, GARBAGE_TEST_DIFF as GARBAGE_DIFF } from './testing';

const LLM = mockLLM();
// CLEAN_DIFF edits file.txt; a brief naming file.txt makes diffCoversRequest true.
const COVERING_BRIEF = { title: 'Edit file.txt', description: 'change hello to goodbye in file.txt' };
const UNRELATED_BRIEF = { title: 'Unrelated task', description: 'nothing to do with the diff' };

describe('reviewProducedDiff', () => {
  let repo: string;
  beforeEach(async () => {
    repo = await makeTempGitRepo('mas-gate-');
  });
  afterEach(() => {
    rmSync(repo, { recursive: true, force: true });
  });

  it('approves a valid diff whose evidence covers the request', async () => {
    const res = await reviewProducedDiff({
      taskId: 't1',
      diff: CLEAN_DIFF,
      repoDir: repo,
      llm: LLM,
      taskBrief: COVERING_BRIEF,
      lastMessage: 'Edited file.txt as requested.',
      taskRisk: 'low',
    });
    expect(res.diffValid).toBe(true);
    expect(res.approved).toBe(true);
    expect(res.verdicts).toHaveLength(2);
    const messages = res.verdicts.flatMap((v) => v.findings.map((f) => f.message));
    expect(messages.some((m) => m.includes('code-review'))).toBe(true);
    expect(messages.some((m) => m.includes('reality-check'))).toBe(true);
  });

  it('rejects a garbage diff (diffValid false)', async () => {
    const res = await reviewProducedDiff({
      taskId: 't2',
      diff: GARBAGE_DIFF,
      repoDir: repo,
      llm: LLM,
      taskBrief: COVERING_BRIEF,
      lastMessage: 'tried',
      taskRisk: 'low',
    });
    expect(res.diffValid).toBe(false);
    expect(res.approved).toBe(false);
  });

  it('rejects a valid diff with no evidence (Reality Checker NEEDS_WORK)', async () => {
    const res = await reviewProducedDiff({
      taskId: 't3',
      diff: CLEAN_DIFF,
      repoDir: repo,
      llm: LLM,
      taskBrief: UNRELATED_BRIEF,
      lastMessage: 'no tests, no overlap',
      taskRisk: 'low',
    });
    expect(res.diffValid).toBe(true);
    expect(res.approved).toBe(false);
  });

  it('counts a cited test file as evidence even without keyword overlap', async () => {
    const res = await reviewProducedDiff({
      taskId: 't4',
      diff: CLEAN_DIFF,
      repoDir: repo,
      llm: LLM,
      taskBrief: UNRELATED_BRIEF,
      lastMessage: 'Added coverage in widget.test.ts',
      taskRisk: 'low',
    });
    expect(res.approved).toBe(true);
  });
});
