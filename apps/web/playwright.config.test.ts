import { describe, expect, it } from 'vitest';
import config from './playwright.config';

describe('smoke Playwright config', () => {
  it('starts its own server so MAS_DB_PATH cannot be bypassed by a reused dev server', () => {
    expect(config.webServer).toMatchObject({
      reuseExistingServer: false,
      env: { MAS_DB_PATH: 'data/test/mas-smoke.db' },
    });
  });
});
