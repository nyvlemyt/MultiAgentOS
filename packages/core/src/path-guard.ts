import { basename, dirname, isAbsolute, join, normalize, relative, resolve, sep } from 'node:path';

// The PATH half of CLAUDE.md §5 ("any write to a path outside the currently active
// project's path") — the sibling of the HOST half in
// packages/memory/src/conveyor/net-guard.ts (assertFetchAllowed). Every diff an
// agent produces goes through assertDiffWithinProject before the review gate.
// realpath is injected so units run with zero disk, and the symlink escape (the
// DNS-rebind analogue) is a table entry rather than a fixture.
export class BlockedPathError extends Error {
  constructor(public readonly target: string, reason: string) {
    super(`blocked write: ${target} — ${reason}`);
    this.name = 'BlockedPathError';
  }
}

export interface PathGuardDeps {
  /** Absolute path of the active project (projects.path). Anything outside is denied. */
  projectRoot: string;
  /** Symlink seam: canonical form of an EXISTING path, throwing for a missing one (real impl: fs.promises.realpath). */
  realpath: (path: string) => Promise<string>;
}

const DEV_NULL = '/dev/null';
const HEADER_OLD = '--- ';
const HEADER_NEW = '+++ ';
const DIFF_GIT = 'diff --git ';
const RENAME_RE = /^(?:rename|copy) (?:from|to) /;

function isInside(child: string, parent: string): boolean {
  return child === parent || child.startsWith(parent.endsWith(sep) ? parent : parent + sep);
}

/** Canonical form of `abs`; when it does not exist yet, canonicalize the nearest existing ancestor and re-append the tail. */
async function canonicalize(abs: string, realpath: PathGuardDeps['realpath']): Promise<string> {
  const tail: string[] = [];
  let cur = abs;
  const maxDepth = abs.split(sep).length + 1;
  for (let depth = 0; depth < maxDepth; depth++) {
    try {
      const real = await realpath(cur);
      return tail.length === 0 ? real : join(real, ...tail);
    } catch {
      tail.unshift(basename(cur));
      cur = dirname(cur);
    }
  }
  throw new BlockedPathError(abs, 'no existing ancestor');
}

/**
 * Throws BlockedPathError unless the write target is inside the project root after
 * (1) rejecting any `..` segment outright (like `git apply`), (2) lexical containment,
 * (3) symlink-safe containment via realpath, and (4) staying out of `.git/`.
 * Returns the canonical absolute path.
 */
export async function assertWriteAllowed(rawPath: string, deps: PathGuardDeps): Promise<string> {
  if (rawPath.length === 0 || rawPath.includes('\0')) {
    throw new BlockedPathError(rawPath, 'malformed path');
  }
  if (rawPath.split(/[\\/]+/).includes('..')) {
    throw new BlockedPathError(rawPath, 'traversal segment ".." is never allowed');
  }
  let canonRoot: string;
  try {
    canonRoot = await deps.realpath(deps.projectRoot);
  } catch {
    throw new BlockedPathError(rawPath, `project root ${deps.projectRoot} is not resolvable`);
  }
  const abs = isAbsolute(rawPath) ? normalize(rawPath) : resolve(deps.projectRoot, rawPath);
  if (!isInside(abs, deps.projectRoot) && !isInside(abs, canonRoot)) {
    throw new BlockedPathError(rawPath, `outside project root ${canonRoot}`);
  }
  const canon = await canonicalize(abs, deps.realpath);
  if (!isInside(canon, canonRoot)) {
    throw new BlockedPathError(rawPath, `symlink escapes project root: resolves to ${canon}`);
  }
  const rel = relative(canonRoot, canon);
  if (rel === '.git' || rel.startsWith(`.git${sep}`)) {
    throw new BlockedPathError(rawPath, 'writes inside .git/ are never allowed');
  }
  return canon;
}

const SIMPLE_ESCAPES: Readonly<Record<string, string>> = { n: '\n', t: '\t', r: '\r' };

/**
 * Undo git's C-style quoting (\" \\ \n \t \r and \NNN octal). Octal escapes are
 * UTF-8 BYTES, so they are collected and decoded as such: a non-ASCII filename
 * must come out as the real on-disk name (which may be a symlink), not mojibake
 * that never resolves and would silently pass the symlink check.
 */
function unescapeQuoted(body: string): string {
  const cps = Array.from(body);
  const bytes: number[] = [];
  for (let i = 0; i < cps.length; i++) {
    const cp = cps[i] ?? '';
    if (cp !== '\\') {
      bytes.push(...Buffer.from(cp, 'utf8'));
      continue;
    }
    const oct = /^[0-7]{3}$/.exec(cps.slice(i + 1, i + 4).join(''));
    if (oct) {
      bytes.push(Number.parseInt(oct[0], 8));
      i += 3;
      continue;
    }
    const esc = cps[i + 1] ?? '';
    bytes.push(...Buffer.from(SIMPLE_ESCAPES[esc] ?? esc, 'utf8'));
    i += 1;
  }
  return Buffer.from(bytes).toString('utf8');
}

function unquote(s: string): string {
  return s.length >= 2 && s.startsWith('"') && s.endsWith('"') ? unescapeQuoted(s.slice(1, -1)) : s;
}

function stripPrefix(p: string): string {
  return p.startsWith('a/') || p.startsWith('b/') ? p.slice(2) : p;
}

/** A `---`/`+++` header value → path, or null for /dev/null. Drops a GNU-diff `\t<timestamp>` suffix. */
function headerPath(value: string): string | null {
  const p = stripPrefix(unquote(value.split('\t')[0] ?? ''));
  return p === DEV_NULL || p.length === 0 ? null : p;
}

/**
 * `diff --git a/X b/Y` → [X, Y]. Unquoted names containing spaces are ambiguous;
 * the equal-halves split (git's own heuristic) resolves the common same-name case
 * and the rename/copy lines carry the truth for the rest. A wrong split can only
 * produce a bogus path, which fails CLOSED at the containment check.
 */
function diffGitPaths(rest: string): string[] {
  const quoted = /^"((?:[^"\\]|\\.)*)" "((?:[^"\\]|\\.)*)"$/.exec(rest);
  if (quoted) return [stripPrefix(unescapeQuoted(quoted[1] ?? '')), stripPrefix(unescapeQuoted(quoted[2] ?? ''))];
  for (let i = rest.indexOf(' '); i !== -1; i = rest.indexOf(' ', i + 1)) {
    const left = stripPrefix(rest.slice(0, i));
    const right = stripPrefix(rest.slice(i + 1));
    if (left === right) return [left];
  }
  const split = rest.indexOf(' b/');
  return split === -1 ? [stripPrefix(rest)] : [stripPrefix(rest.slice(0, split)), stripPrefix(rest.slice(split + 1))];
}

/**
 * Every path a unified diff would touch: `diff --git` sides, `---`/`+++` headers
 * (a header is a ---/+++ PAIR — a lone `--- x` inside a hunk is removed content
 * `-- x`), rename/copy sides. /dev/null is skipped; a/ b/ prefixes are stripped.
 */
export function diffTargetPaths(diff: string): string[] {
  const out = new Set<string>();
  const lines = diff.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const next = lines[i + 1] ?? '';
    if (line.startsWith(DIFF_GIT)) {
      for (const p of diffGitPaths(line.slice(DIFF_GIT.length))) out.add(p);
    } else if (line.startsWith(HEADER_OLD) && next.startsWith(HEADER_NEW)) {
      const oldP = headerPath(line.slice(HEADER_OLD.length));
      const newP = headerPath(next.slice(HEADER_NEW.length));
      if (oldP) out.add(oldP);
      if (newP) out.add(newP);
      i++;
    } else if (RENAME_RE.test(line)) {
      out.add(unquote(line.replace(RENAME_RE, '')));
    }
  }
  return [...out];
}

/** Asserts every path the diff touches is a permitted write; returns their canonical forms. Throws on the first violation. */
export async function assertDiffWithinProject(diff: string, deps: PathGuardDeps): Promise<string[]> {
  const canon: string[] = [];
  for (const target of diffTargetPaths(diff)) {
    canon.push(await assertWriteAllowed(target, deps));
  }
  return canon;
}
