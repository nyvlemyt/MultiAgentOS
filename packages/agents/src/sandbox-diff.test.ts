import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { validateDiffApplies, applyDiffToSandbox } from './sandbox-diff';

function makeTempRepo(): string {
  const dir = mkdtempSync(join(tmpdir(), 'mas-sbx-'));
  execFileSync('git', ['init', '-q'], { cwd: dir });
  execFileSync('git', ['config', 'user.email', 'test@example.com'], { cwd: dir });
  execFileSync('git', ['config', 'user.name', 'Test'], { cwd: dir });
  writeFileSync(join(dir, 'file.txt'), 'hello\nworld\n');
  execFileSync('git', ['add', '-A'], { cwd: dir });
  execFileSync('git', ['commit', '-q', '-m', 'base'], { cwd: dir });
  return dir;
}

// A clean unified diff that turns 'hello' into 'goodbye' in file.txt.
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

const GARBAGE_DIFF = 'this is not a diff at all\n@@ broken @@\n';

describe('validateDiffApplies', () => {
  let repo: string;
  beforeEach(() => {
    repo = makeTempRepo();
  });
  afterEach(() => {
    rmSync(repo, { recursive: true, force: true });
  });

  it('accepts a clean unified diff', async () => {
    const res = await validateDiffApplies(CLEAN_DIFF, repo);
    expect(res.ok).toBe(true);
  });

  it('rejects garbage with a non-empty error and never throws', async () => {
    const res = await validateDiffApplies(GARBAGE_DIFF, repo);
    expect(res.ok).toBe(false);
    expect(res.error && res.error.length).toBeGreaterThan(0);
  });

  it('returns ok:false for a non-repo dir instead of throwing', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'mas-nonrepo-'));
    try {
      const res = await validateDiffApplies(CLEAN_DIFF, dir);
      expect(res.ok).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('applyDiffToSandbox', () => {
  let repo: string;
  beforeEach(() => {
    repo = makeTempRepo();
  });
  afterEach(() => {
    rmSync(repo, { recursive: true, force: true });
  });

  it('applies a clean diff in a sandbox without mutating the source', async () => {
    const res = await applyDiffToSandbox(CLEAN_DIFF, repo);
    expect(res.ok).toBe(true);
    expect(res.sandboxDir).toBeTruthy();
    // Source untouched.
    expect(readFileSync(join(repo, 'file.txt'), 'utf-8')).toContain('hello');
    // Sandbox changed.
    expect(readFileSync(join(res.sandboxDir, 'file.txt'), 'utf-8')).toContain('goodbye');
    rmSync(res.sandboxDir, { recursive: true, force: true });
  });
});
