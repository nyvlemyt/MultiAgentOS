import { writeFileSync, unlinkSync, mkdirSync, existsSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);

function repoRoot(): string {
  const here = fileURLToPath(new URL('.', import.meta.url));
  return resolve(here, '../../..');
}

function errText(e: unknown): string {
  if (e && typeof e === 'object' && 'stderr' in e) {
    const s = e.stderr;
    if (typeof s === 'string' && s.trim()) return s.trim();
  }
  return e instanceof Error ? e.message : String(e);
}

/**
 * Non-mutating: writes the diff to a temp file and runs `git apply --check`
 * inside repoDir. Returns ok/false+error; never throws on a bad diff or a
 * non-repo directory.
 */
export async function validateDiffApplies(
  diff: string,
  repoDir: string,
): Promise<{ ok: boolean; error?: string }> {
  const file = join(tmpdir(), `mas-diff-${randomUUID()}.patch`);
  try {
    writeFileSync(file, diff, 'utf-8');
    await run('git', ['apply', '--check', '--whitespace=nowarn', file], { cwd: repoDir });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errText(e) };
  } finally {
    try {
      unlinkSync(file);
    } catch {
      // temp file may already be gone — ignore.
    }
  }
}

/**
 * Copies srcDir into data/sandboxes/<uuid>/ and applies the diff THERE. Never
 * mutates srcDir (CLAUDE.md §8). Returns ok/false+error.
 */
export async function applyDiffToSandbox(
  diff: string,
  srcDir: string,
): Promise<{ sandboxDir: string; ok: boolean; error?: string }> {
  const sandboxDir = resolve(repoRoot(), 'data/sandboxes', randomUUID());
  try {
    mkdirSync(sandboxDir, { recursive: true });
    cpSync(srcDir, sandboxDir, { recursive: true });
    // Ensure a git repo exists in the sandbox so `git apply` works even when
    // srcDir was not itself a repo.
    if (!existsSync(join(sandboxDir, '.git'))) {
      await run('git', ['init', '-q'], { cwd: sandboxDir });
      await run('git', ['config', 'user.email', 'sandbox@mas.local'], { cwd: sandboxDir });
      await run('git', ['config', 'user.name', 'MAS Sandbox'], { cwd: sandboxDir });
      await run('git', ['add', '-A'], { cwd: sandboxDir });
      await run('git', ['commit', '-q', '-m', 'base'], { cwd: sandboxDir });
    }
    const file = join(tmpdir(), `mas-diff-${randomUUID()}.patch`);
    try {
      writeFileSync(file, diff, 'utf-8');
      await run('git', ['apply', '--whitespace=nowarn', file], { cwd: sandboxDir });
      return { sandboxDir, ok: true };
    } finally {
      try {
        unlinkSync(file);
      } catch {
        // ignore missing temp file.
      }
    }
  } catch (e) {
    return { sandboxDir, ok: false, error: errText(e) };
  }
}
