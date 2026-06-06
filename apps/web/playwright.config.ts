import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
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
