import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['packages/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html'],
      // `all` so untested source files count as 0 % instead of vanishing — an
      // honest §7 (≥80 %) baseline, not a flattering one over only-tested files.
      all: true,
      include: ['packages/*/src/**/*.ts'],
      exclude: [
        '**/*.test.ts',
        '**/*.config.*',
        '**/dist/**',
        '**/types.ts', // type-only declarations, no executable lines
        'packages/db/src/seed.ts', // dev-only seeding script (see COV-2 backlog)
        'packages/*/src/index.ts', // re-export barrels
      ],
      // Report-only for now (no `thresholds`): establish the real baseline first,
      // then ratchet toward the §7 80 % bar per the coverage-measurement backlog.
    },
  },
});
