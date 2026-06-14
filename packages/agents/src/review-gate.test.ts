import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { reviewProducedDiff } from './review-gate';

function makeTempRepo(): string {
  const dir = mkdtempSync(join(tmpdir(), 'mas-gate-'));
  execFileSync('git', ['init', '-q'], { cwd: dir });
  execFileSync('git', ['config', 'user.email', 'test@example.com'], { cwd: dir });
  execFileSync('git', ['config', 'user.name', 'Test'], { cwd: dir });
  writeFileSync(join(dir, 'file.txt'), 'hello\nworld\n');
  execFileSync('git', ['add', '-A'], { cwd: dir });
  execFileSync('git', ['commit', '-q', '-m', 'base'], { cwd: dir });
  return dir;
}

const CLEAN_DIFF = [
  'diff --git a/file.txt b/file.txt',
  'index 0000000..1111111 100644',
  '--- a/file.txt',
  '+++ b/file.txt',
  '@@ -1,2 +1,2 @@',
  '-hello',
  '+goodbye',
  ' world',
  '',
].join('\n');

const GARBAGE_DIFF = 'not a diff\n@@ broken @@\n';

describe('reviewProducedDiff', () => {
  let repo: string;
  beforeEach(() => {
    repo = makeTempRepo();
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
