import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { detectStack } from './stack-detect';

const dirs: string[] = [];

function makeDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'stack-detect-'));
  dirs.push(dir);
  return dir;
}

function writePkg(dir: string, pkg: unknown): void {
  writeFileSync(join(dir, 'package.json'), JSON.stringify(pkg));
}

afterEach(() => {
  while (dirs.length > 0) {
    const dir = dirs.pop()!;
    rmSync(dir, { recursive: true, force: true });
  }
});

describe('detectStack', () => {
  it('detects a Next + TypeScript + Tailwind app, type other', () => {
    const dir = makeDir();
    writePkg(dir, {
      dependencies: { next: '15', react: '19', tailwindcss: '3' },
      devDependencies: { typescript: '5' },
    });
    const out = detectStack(dir);
    expect(out.stack).toContain('Next.js');
    expect(out.stack).toContain('React');
    expect(out.stack).toContain('Tailwind');
    expect(out.stack).toContain('TypeScript');
    expect(out.type).toBe('other');
  });

  it('detects a Telegraf bot, type bot', () => {
    const dir = makeDir();
    writePkg(dir, { dependencies: { telegraf: '4' } });
    const out = detectStack(dir);
    expect(out.stack).toContain('Telegraf');
    expect(out.type).toBe('bot');
  });

  it('detects Python from pyproject.toml only', () => {
    const dir = makeDir();
    writeFileSync(join(dir, 'pyproject.toml'), '[project]\nname = "x"\n');
    const out = detectStack(dir);
    expect(out.stack).toContain('Python');
    expect(out.type).toBe('other');
  });

  it('returns empty for an empty dir and a nonexistent path', () => {
    const empty = makeDir();
    expect(detectStack(empty)).toEqual({ type: 'other', stack: [] });
    expect(detectStack(join(empty, 'nope', 'missing'))).toEqual({ type: 'other', stack: [] });
  });

  it('is deterministic — identical array twice for the same input', () => {
    const dir = makeDir();
    writePkg(dir, {
      dependencies: { react: '19', next: '15', tailwindcss: '3' },
    });
    const a = detectStack(dir);
    const b = detectStack(dir);
    expect(a.stack).toEqual(b.stack);
  });
});
