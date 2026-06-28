import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const workerEntry = join(__dirname, 'index.ts');

describe('worker startup guard', () => {
  it(
    'refuses to start when ANTHROPIC_API_KEY is set',
    () => {
      // process.execPath = absolute path to the running node binary (no PATH lookup).
      // The ceiling is a hang-guard, not a perf assertion: a cold tsx spawn is
      // ~1.5s solo but crosses 5s under `pnpm -r test` CPU contention. 30s absorbs
      // that jitter without masking a genuine hang (the guard exits in <2s).
      const result = spawnSync(
        process.execPath,
        ['--import', 'tsx/esm', workerEntry],
        {
          env: { ...process.env, ANTHROPIC_API_KEY: 'sk-fake-should-fail' },
          timeout: 30000,
          encoding: 'utf8',
        },
      );
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/ANTHROPIC_API_KEY/);
    },
    35000,
  );
});
