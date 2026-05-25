import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';
import { assertSafeToWipe } from './seed-safety';

const repoRoot = '/tmp/multiagentos';

describe('seed safety', () => {
  it('refuses the default dev DB unless destructive seed is explicitly allowed', () => {
    const defaultDb = resolve(repoRoot, 'data/mas.db');

    expect(() =>
      assertSafeToWipe(defaultDb, { repoRoot, allowOverride: false, nodeEnv: 'development' }),
    ).toThrow(/default dev DB/);
  });

  it('allows explicit smoke test DBs under data/test', () => {
    const smokeDb = resolve(repoRoot, 'data/test/mas-smoke.db');

    expect(() =>
      assertSafeToWipe(smokeDb, { repoRoot, allowOverride: false, nodeEnv: 'development' }),
    ).not.toThrow();
  });

  it('refuses non-test DBs under data unless explicitly allowed', () => {
    const otherDb = resolve(repoRoot, 'data/manual.db');

    expect(() =>
      assertSafeToWipe(otherDb, { repoRoot, allowOverride: false, nodeEnv: 'development' }),
    ).toThrow(/explicit test DB/);
  });
});
