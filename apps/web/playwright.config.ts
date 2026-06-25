import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Cold `pnpm dev` compiles each route on first hit; under 2-worker CI load the
  // first navigation to a heavy route can exceed 30s (29/32 passed, 3 timed out
  // on page.goto in run 28138414670 while the two prior runs on this same SHA
  // family were green). 60s absorbs that jitter without masking real hangs.
  timeout: 60_000,
  // One retry on CI so a single cold-compile miss doesn't fail the run; locally
  // a warm server never needs it.
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    // The heading assertions only need the document parsed, not every lazy
    // image/avatar — `load` (Playwright's default) is what stalled on cold dev
    // compiles. Cap navigation so a slow first compile surfaces clearly.
    navigationTimeout: 45_000,
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    timeout: 120_000,
    reuseExistingServer: false,
    env: {
      MAS_DB_PATH: 'data/test/mas-smoke.db',
      // Deterministic, zero-cost task execution so the inline run driver reaches
      // the §5 risk gate without the real Agent SDK (which needs claude login +
      // a real project cwd). See packages/agents selectLLM + backlog card.
      MAS_MOCK_LLM: '1',
    },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
