import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Use the automatic JSX runtime so component .test.ts files can render via
  // react-dom/server without importing React explicitly.
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'node',
    // Root-level config tests + lib/ unit tests. Playwright specs live in
    // tests/*.spec.ts and are excluded by the .test.ts suffix convention.
    include: ['*.test.ts', 'lib/**/*.test.ts'],
  },
});
