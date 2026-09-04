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
        'packages/db/src/schema.ts', // drizzle column-def literals (fn-% artifact, no real branches)
        'packages/*/src/index.ts', // re-export barrels
        // Dev-only CLI entrypoints — run by hand / tsx, never on the shipped runtime
        // path. Excluded so the §7 gate measures real logic, not 0 % shims.
        '**/*-cli.ts', // memory: arsenal/doctor/eval/seed CLIs
        '**/build-library-index.ts', // skills + agents cold-index builders
        '**/reindex.ts', // skills QMD reindex helper
      ],
      // Hard §7 gate — the 6th verification check. Global floor ratcheted above the
      // 2026-06-26 post-exclusion baseline (lines 94.9 / branches 84.2 / fn 94.6) with
      // margin: locks in current quality, prevents silent erosion, leaves slack for
      // small PRs. `pnpm test:coverage` exits non-zero below these. See
      // docs/backlog/test-coverage-measurement-gap.md.
      thresholds: {
        lines: 85,
        statements: 85,
        functions: 80,
        branches: 80,
      },
    },
  },
});
