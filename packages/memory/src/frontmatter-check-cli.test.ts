import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { resolveTargets } from './frontmatter-check-cli';

// resolveTargets decides which files the gardien CLI validates. The PostToolUse
// hook (Task 5) passes one freshly-written file path — which is NOT yet
// git-tracked — so target selection must key on the watched ROOT prefix, never
// on corpus (git ls-files) membership, or a bad new fiche slips through silently.

const repoRoot = '/repo';
const corpus = ['docs/resources/raw.md', 'docs/knowledge/x.md'];
const abs = (p: string): string => resolve(repoRoot, p);

describe('resolveTargets (CLI target selection — hook-safe)', () => {
  it('returns the whole corpus when no file args are given (CI path)', () => {
    expect(resolveTargets(repoRoot, [], corpus)).toEqual(corpus);
  });

  it('validates a brand-new untracked .md under a watched root (the hook case)', () => {
    const fresh = abs('docs/resources/inbox/fresh.md');
    expect(resolveTargets(repoRoot, [fresh], corpus)).toEqual(['docs/resources/inbox/fresh.md']);
  });

  it('still validates a tracked corpus file passed explicitly', () => {
    expect(resolveTargets(repoRoot, [abs('docs/knowledge/x.md')], corpus)).toEqual([
      'docs/knowledge/x.md',
    ]);
  });

  it('ignores a .md outside the watched roots', () => {
    expect(resolveTargets(repoRoot, [abs('apps/web/README.md')], corpus)).toEqual([]);
  });

  it('ignores a non-markdown file even under a watched root', () => {
    expect(resolveTargets(repoRoot, [abs('docs/resources/data.json')], corpus)).toEqual([]);
  });
});
