import { describe, it, expect } from 'vitest';
import {
  assertWriteAllowed,
  assertDiffWithinProject,
  diffTargetPaths,
  BlockedPathError,
  type PathGuardDeps,
} from './path-guard';

// Canonical project root + the paths the fake filesystem "knows". Mirrors
// net-guard.test.ts: the seam (realpath here, DNS there) is injected, so these
// units touch no disk and the symlink-escape case is a table entry, not a fixture.
const ROOT = '/srv/proj';
const SRC = `${ROOT}/src`;
const EXISTING = `${SRC}/a.ts`;
const ELSEWHERE = '/elsewhere/dir';
const OUTSIDE = '/etc/hosts';
const ALT_ROOT = '/opt/proj';
const ALT_CANON = '/mnt/real/proj';

const deps = (known: Record<string, string>, projectRoot = ROOT): PathGuardDeps => ({
  projectRoot,
  realpath: async (p) => {
    const real = known[p];
    if (real === undefined) throw Object.assign(new Error(`ENOENT: ${p}`), { code: 'ENOENT' });
    return real;
  },
});

const rootOnly = () => deps({ [ROOT]: ROOT });

describe('assertWriteAllowed', () => {
  it('allows a relative path to an existing file inside the root', async () => {
    const p = await assertWriteAllowed('src/a.ts', deps({ [ROOT]: ROOT, [SRC]: SRC, [EXISTING]: EXISTING }));
    expect(p).toBe(EXISTING);
  });

  it('allows a new file in an existing directory (walks up to the nearest existing ancestor)', async () => {
    const p = await assertWriteAllowed('src/new.ts', deps({ [ROOT]: ROOT, [SRC]: SRC }));
    expect(p).toBe(`${SRC}/new.ts`);
  });

  it('allows a new file in a not-yet-existing nested directory', async () => {
    await expect(assertWriteAllowed('x/y/z.ts', rootOnly())).resolves.toBe(`${ROOT}/x/y/z.ts`);
  });

  it('allows an absolute path inside the root', async () => {
    await expect(assertWriteAllowed(EXISTING, rootOnly())).resolves.toBe(EXISTING);
  });

  it('rejects an absolute path outside the root', async () => {
    await expect(assertWriteAllowed(OUTSIDE, rootOnly())).rejects.toThrow(/outside project root/);
  });

  it('rejects a ".." traversal that escapes the root', async () => {
    await expect(assertWriteAllowed('../../etc/passwd', rootOnly())).rejects.toThrow(/traversal/);
  });

  it('rejects a ".." segment even when it would land back inside (conservative, like git apply)', async () => {
    await expect(assertWriteAllowed('src/../README.md', rootOnly())).rejects.toThrow(/traversal/);
  });

  it('rejects a symlink escape: a link inside the root that resolves outside it', async () => {
    const d = deps({ [ROOT]: ROOT, [`${ROOT}/link`]: ELSEWHERE });
    await expect(assertWriteAllowed('link/x.txt', d)).rejects.toThrow(/symlink escapes/);
  });

  it('allows a symlink that stays inside the root and returns the real path', async () => {
    const d = deps({ [ROOT]: ROOT, [`${ROOT}/link`]: `${ROOT}/real` });
    await expect(assertWriteAllowed('link/x.txt', d)).resolves.toBe(`${ROOT}/real/x.txt`);
  });

  it('canonicalizes a non-canonical project root before comparing (macOS /var → /private/var)', async () => {
    const d = deps({ [ALT_ROOT]: ALT_CANON }, ALT_ROOT);
    await expect(assertWriteAllowed('src/a.ts', d)).resolves.toBe(`${ALT_CANON}/src/a.ts`);
  });

  it('fails closed when no ancestor of a canonical-form absolute path resolves', async () => {
    const d = deps({ [ALT_ROOT]: ALT_CANON }, ALT_ROOT);
    await expect(assertWriteAllowed(`${ALT_CANON}/src/a.ts`, d)).rejects.toThrow(/no existing ancestor/);
  });

  it('rejects writes inside .git/ (hooks = code execution)', async () => {
    await expect(assertWriteAllowed('.git/hooks/pre-commit', rootOnly())).rejects.toThrow(/\.git/);
  });

  it('still allows .gitignore (not inside .git/)', async () => {
    await expect(assertWriteAllowed('.gitignore', rootOnly())).resolves.toBe(`${ROOT}/.gitignore`);
  });

  it('rejects an empty path as malformed', async () => {
    await expect(assertWriteAllowed('', rootOnly())).rejects.toThrow(/malformed/);
  });

  it('rejects a path containing a null byte as malformed', async () => {
    await expect(assertWriteAllowed('src/a\0.ts', rootOnly())).rejects.toThrow(/malformed/);
  });

  it('fails closed when the project root itself cannot be resolved', async () => {
    await expect(assertWriteAllowed('src/a.ts', deps({}))).rejects.toThrow(/project root/);
  });

  it('throws BlockedPathError carrying the offending target', async () => {
    await expect(assertWriteAllowed(OUTSIDE, rootOnly())).rejects.toBeInstanceOf(BlockedPathError);
    await assertWriteAllowed(OUTSIDE, rootOnly()).catch((e: BlockedPathError) => {
      expect(e.target).toBe(OUTSIDE);
    });
  });
});

const GIT_HEADER = 'diff --git a/file.txt b/file.txt\nindex 0000000..1111111 100644';
const HUNK = '@@ -1,2 +1,2 @@\n-hello\n+goodbye\n world';

describe('diffTargetPaths', () => {
  it('extracts the single edited file from a standard git diff, deduplicated', () => {
    const diff = `${GIT_HEADER}\n--- a/file.txt\n+++ b/file.txt\n${HUNK}\n`;
    expect(diffTargetPaths(diff)).toEqual(['file.txt']);
  });

  it('extracts a new file and skips /dev/null', () => {
    expect(diffTargetPaths('--- /dev/null\n+++ b/new.ts\n@@ -0,0 +1 @@\n+x')).toEqual(['new.ts']);
  });

  it('extracts a deleted file (deleting outside the project is a write too)', () => {
    expect(diffTargetPaths('--- a/old.ts\n+++ /dev/null\n@@ -1 +0,0 @@\n-x')).toEqual(['old.ts']);
  });

  it('extracts both sides of a rename', () => {
    const diff = 'diff --git a/a.ts b/b.ts\nsimilarity index 100%\nrename from a.ts\nrename to b.ts';
    expect(diffTargetPaths(diff).sort((x, y) => x.localeCompare(y))).toEqual(['a.ts', 'b.ts']);
  });

  it('unquotes a C-quoted path with spaces', () => {
    expect(diffTargetPaths('--- "a/my file.ts"\n+++ "b/my file.ts"\n@@ -1 +1 @@\n-a\n+b')).toEqual(['my file.ts']);
  });

  it('decodes git octal escapes as UTF-8 bytes (non-ASCII filenames must resolve to the real on-disk entry)', () => {
    expect(diffTargetPaths('--- "a/caf\\303\\251.ts"\n+++ "b/caf\\303\\251.ts"\n@@ -1 +1 @@\n-a\n+b')).toEqual(['café.ts']);
  });

  it('unescapes \\t and \\n inside a quoted path', () => {
    expect(diffTargetPaths('--- "a/we\\tird.ts"\n+++ "b/we\\tird.ts"\n@@ -1 +1 @@\n-a\n+b')).toEqual(['we\tird.ts']);
  });

  it('strips a GNU-diff tab timestamp suffix', () => {
    expect(diffTargetPaths('--- a/x.ts\t2024-01-01 00:00:00\n+++ b/x.ts\t2024-01-02 00:00:00\n@@ -1 +1 @@\n-a\n+b')).toEqual(['x.ts']);
  });

  it('handles --no-prefix headers', () => {
    expect(diffTargetPaths('--- x.ts\n+++ x.ts\n@@ -1 +1 @@\n-a\n+b')).toEqual(['x.ts']);
  });

  it('covers a binary change via the diff --git line', () => {
    expect(diffTargetPaths('diff --git a/img.png b/img.png\nBinary files a/img.png and b/img.png differ')).toEqual(['img.png']);
  });

  it('does not mistake a removed "-- comment" hunk line for a --- header', () => {
    const diff = `--- a/q.sql\n+++ b/q.sql\n@@ -1,2 +1 @@\n--- not a header ../../etc\n select 1`;
    expect(diffTargetPaths(diff)).toEqual(['q.sql']);
  });

  it('returns [] for an empty diff', () => {
    expect(diffTargetPaths('')).toEqual([]);
  });
});

describe('assertDiffWithinProject', () => {
  const clean = `${GIT_HEADER}\n--- a/file.txt\n+++ b/file.txt\n${HUNK}\n`;

  it('returns the canonical targets of a clean diff', async () => {
    await expect(assertDiffWithinProject(clean, rootOnly())).resolves.toEqual([`${ROOT}/file.txt`]);
  });

  it('blocks a diff that writes via traversal, naming the target', async () => {
    const diff = '--- a/../../etc/passwd\n+++ b/../../etc/passwd\n@@ -1 +1 @@\n-a\n+b';
    await expect(assertDiffWithinProject(diff, rootOnly())).rejects.toThrow(BlockedPathError);
    await assertDiffWithinProject(diff, rootOnly()).catch((e: BlockedPathError) => {
      expect(e.target).toBe('../../etc/passwd');
    });
  });

  it('blocks a traversal hidden behind octal escapes ("\\056\\056" is "..")', async () => {
    const diff = '--- "a/\\056\\056/etc/passwd"\n+++ "b/\\056\\056/etc/passwd"\n@@ -1 +1 @@\n-a\n+b';
    await expect(assertDiffWithinProject(diff, rootOnly())).rejects.toThrow(/traversal/);
  });

  it('blocks a diff that deletes a file outside the project', async () => {
    await expect(assertDiffWithinProject('--- a/../x\n+++ /dev/null\n@@ -1 +0,0 @@\n-a', rootOnly())).rejects.toThrow(/traversal/);
  });

  it('blocks a rename whose destination is outside the project', async () => {
    const diff = 'diff --git a/a.ts b/../b.ts\nrename from a.ts\nrename to ../b.ts';
    await expect(assertDiffWithinProject(diff, rootOnly())).rejects.toThrow(/traversal/);
  });

  it('returns [] for an empty diff (nothing to guard)', async () => {
    await expect(assertDiffWithinProject('', rootOnly())).resolves.toEqual([]);
  });
});
