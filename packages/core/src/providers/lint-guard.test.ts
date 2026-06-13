import { describe, it, expect, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../..');
const script = resolve(repoRoot, 'scripts/lint-no-sdk-payg.sh');

let dir: string | undefined;
afterEach(() => {
  if (dir) rmSync(dir, { recursive: true, force: true });
  dir = undefined;
});

function fixture(relPath: string, content: string): string {
  dir ??= mkdtempSync(join(tmpdir(), 'mas-lint-'));
  const file = join(dir, relPath);
  mkdirSync(join(file, '..'), { recursive: true });
  writeFileSync(file, content);
  return dir;
}

function runGuard(root: string): { code: number; out: string } {
  try {
    const out = execFileSync('/bin/bash', [script, 'apps', 'packages'], {
      cwd: root,
      encoding: 'utf8',
    });
    return { code: 0, out };
  } catch (e) {
    const err = e as { status: number; stdout?: string; stderr?: string };
    return { code: err.status, out: `${err.stdout ?? ''}${err.stderr ?? ''}` };
  }
}

// SDK names assembled by concatenation so this test file itself never matches
// the guard when it scans the real packages/ tree.
const OPENAI = 'open' + 'ai';
const GOOGLE_GENAI = '@google/' + 'generative-ai';

describe('lint-no-sdk-payg guard (§11 + §11.bis)', () => {
  it('rejects an openai import outside packages/core/src/providers/', () => {
    const root = fixture('apps/web/bad.ts', `import OpenAI from '${OPENAI}';\n`);
    const r = runGuard(root);
    expect(r.code).toBe(1);
    expect(r.out).toContain(OPENAI);
  });

  it('rejects the google generative-ai SDK outside providers/', () => {
    const root = fixture(
      'packages/agents/src/bad.ts',
      `const g = await import('${GOOGLE_GENAI}');\n`,
    );
    expect(runGuard(root).code).toBe(1);
  });

  it('allows provider SDK imports inside packages/core/src/providers/', () => {
    const root = fixture(
      'packages/core/src/providers/ok.ts',
      `import OpenAI from '${OPENAI}';\n`,
    );
    expect(runGuard(root).code).toBe(0);
  });

  it('still rejects the Anthropic PAYG SDK everywhere, even in providers/', () => {
    // Name assembled by concatenation so this test file itself never matches the guard.
    const payg = '@anthropic-ai' + '/sdk';
    const root = fixture(
      'packages/core/src/providers/bad.ts',
      `import Anthropic from '${payg}';\n`,
    );
    expect(runGuard(root).code).toBe(1);
  });

  it('passes the real repo tree', () => {
    expect(runGuard(repoRoot).code).toBe(0);
  });
});
