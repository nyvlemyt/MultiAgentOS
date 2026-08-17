import { test, expect } from '@playwright/test';

const STALE_MISSION_ID = 'mission_seed_stale';

test.describe('C1 — statut vérité', () => {
  test('le board badge la mission zombie avec sa raison', async ({ page }) => {
    await page.goto('/missions');
    const card = page.locator(`[data-testid="mission-card"][data-mission-id="${STALE_MISSION_ID}"]`);
    await expect(card).toBeVisible({ timeout: 10_000 });

    const badge = card.getByTestId('mission-desync-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText(/désynchronisé/i);
    await expect(badge).toContainText(/aucune activité depuis/i);
  });

  test('le détail mission affiche le badge et sa raison', async ({ page }) => {
    await page.goto(`/missions/${STALE_MISSION_ID}`);
    const badge = page.getByTestId('mission-desync-badge');
    await expect(badge).toBeVisible({ timeout: 10_000 });
    await expect(badge).toContainText(/déclarée « executing »/i);
  });

  test('une mission saine ne porte aucun badge', async ({ page }) => {
    await page.goto('/missions/mission_seed_001');
    await expect(page.getByTestId('mission-desync-badge')).toHaveCount(0);
  });
});
