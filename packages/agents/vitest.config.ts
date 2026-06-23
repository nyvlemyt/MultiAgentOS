import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Pin retrieval to FTS: agent tests exercise dispatch's memory-context path,
    // which would otherwise reach for the local QMD index (~4.4 GB, absent/slow in
    // CI). FTS over the same corpus is deterministic and fast. The QMD path itself
    // is covered in @mas/memory (retriever.test.ts) + the semantic eval harness.
    env: { MAS_RETRIEVAL_BACKEND: 'fts' },
  },
});
