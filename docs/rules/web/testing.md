---
origin: affaan-m/ecc
license: MIT
lang: web
concern: testing
---
<!-- pattern from affaan-m/ecc rules/web/testing.md -->

# Web Testing Rules

Frontend test priorities for `apps/web`. Unit/component testing is Vitest + RTL (repo standard, §7); see `docs/rules/react/testing.md`. This file covers the visual/a11y/perf layers on top.

## Priority Order

### 1. Visual Regression
- Screenshot key breakpoints: 320, 768, 1024, 1440.
- Cover hero sections and meaningful states. If both themes exist, test both.
- Use Playwright screenshots for visual-heavy work. (The cockpit ships a `@mas/web smoke` check — extend it, don't bypass it.)

### 2. Accessibility
- Run automated a11y checks (axe), test keyboard navigation, verify reduced-motion behavior and color contrast.

### 3. Performance
- Run Lighthouse (or equivalent) against meaningful pages; keep the CWV targets from `performance.md`.

### 4. Cross-Browser
- Minimum: Chrome, Firefox, Safari. Test scrolling, motion, fallback behavior.

### 5. Responsive
- Test 320, 375, 768, 1024, 1440, 1920. Verify no overflow and touch interactions.

## E2E Shape

```ts
import { test, expect } from '@playwright/test'

test('landing hero loads', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toBeVisible()
})
```

- Avoid flaky timeout-based assertions; prefer deterministic waits.

## Unit Tests

- Test utilities, data transforms, and custom hooks.
- For highly visual components, visual regression often carries more signal than brittle markup assertions — but it **supplements** coverage, it does not replace it.
