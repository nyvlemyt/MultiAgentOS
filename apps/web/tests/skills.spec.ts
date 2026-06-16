import { test, expect } from '@playwright/test';

// Phase 3 exit-criteria proof (ROADMAP.md §Phase 3):
// "Filter + promote actions work and persist across reload."
// The /skills page is fully server-rendered (GET form = filter, POST form = promote
// to skills.tier='pinned' in SQLite). This drives the real routes against the
// smoke DB (playwright.config webServer sets MAS_DB_PATH=data/test/mas-smoke.db).
test.describe.serial('Phase 3 skill registry — filter + promote persist', () => {
  test('search filter narrows the table to matching skills', async ({ page }) => {
    await page.goto('/skills');
    await expect(
      page.getByRole('heading', { name: 'Registre des compétences' }),
    ).toBeVisible();

    const total = await page.locator('tbody tr').count();
    expect(total).toBeGreaterThan(1);

    // 'slack' is a unique substring of exactly one seeded skill id.
    await page.getByPlaceholder('Rechercher').fill('slack');
    await page.getByRole('button', { name: 'Filtrer' }).click();

    await expect(page).toHaveURL(/[?&]q=slack/);
    const filtered = page.locator('tbody tr');
    await expect(filtered).toHaveCount(1);
    await expect(filtered.first()).toContainText('slack-gif-creator');
  });

  test('promote pins a skill and the pin survives a reload', async ({ page }) => {
    await page.goto('/skills');

    // Pick whichever skill is currently un-pinned (idempotent across reseeds:
    // reseed never overwrites a user-set tier, so target the live state).
    const targetRow = page
      .locator('tbody tr', { has: page.getByRole('button', { name: 'Épingler' }) })
      .first();
    await expect(targetRow).toBeVisible();
    const skillId = (await targetRow.locator('td').first().innerText()).trim();

    await targetRow.getByRole('button', { name: 'Épingler' }).click();

    // POST /api/skills/promote redirects back to /skills.
    await expect(page).toHaveURL(/\/skills$/);
    const pinnedRow = page.locator('tbody tr', { hasText: skillId });
    await expect(pinnedRow).toContainText('pinned');
    await expect(pinnedRow.getByRole('button', { name: 'Épingler' })).toHaveCount(0);

    // Reload: the pin is DB-persisted, not in-memory.
    await page.reload();
    const afterReload = page.locator('tbody tr', { hasText: skillId });
    await expect(afterReload).toContainText('pinned');
    await expect(afterReload.getByRole('button', { name: 'Épingler' })).toHaveCount(0);
  });
});
