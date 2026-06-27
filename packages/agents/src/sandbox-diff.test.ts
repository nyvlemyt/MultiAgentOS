import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateDiffApplies, applyDiffToSandbox } from './sandbox-diff';
import {
  makeTempGitRepo,
  makeTempNonRepo,
  CLEAN_TEST_DIFF as CLEAN_DIFF,
  GARBAGE_TEST_DIFF as GARBAGE_DIFF,
} from './testing';

describe('validateDiffApplies', () => {
  let repo: string;
  beforeEach(async () => {
    repo = await makeTempGitRepo('mas-sbx-');
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
    expect(res.error?.length).toBeGreaterThan(0);
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
  beforeEach(async () => {
    repo = await makeTempGitRepo('mas-sbx-');
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

  it('git-inits the sandbox when the source is not a repo, then applies the diff', async () => {
    const nonRepo = makeTempNonRepo('mas-nonrepo-src-');
    try {
      const res = await applyDiffToSandbox(CLEAN_DIFF, nonRepo);
      expect(res.ok).toBe(true);
      expect(readFileSync(join(res.sandboxDir, 'file.txt'), 'utf-8')).toContain('goodbye');
      rmSync(res.sandboxDir, { recursive: true, force: true });
    } finally {
      rmSync(nonRepo, { recursive: true, force: true });
    }
  });

  it('returns ok:false (never throws) when the diff fails to apply in a fresh sandbox repo', async () => {
    const nonRepo = makeTempNonRepo('mas-nonrepo-bad-');
    try {
      const res = await applyDiffToSandbox(GARBAGE_DIFF, nonRepo);
      expect(res.ok).toBe(false);
      expect(res.error?.length).toBeGreaterThan(0);
      expect(res.sandboxDir).toBeTruthy();
      rmSync(res.sandboxDir, { recursive: true, force: true });
    } finally {
      rmSync(nonRepo, { recursive: true, force: true });
    }
  });
});
