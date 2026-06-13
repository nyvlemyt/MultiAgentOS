import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Root-level config tests + lib/ unit tests. Playwright specs live in
    // tests/*.spec.ts and are excluded by the .test.ts suffix convention.
    include: ['*.test.ts', 'lib/**/*.test.ts'],
  },
});
