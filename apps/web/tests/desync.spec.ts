import { test, expect } from '@playwright/test';

const STALE_MISSION_ID = 'mission_seed_stale';
const HEALTHY_MISSION_ID = 'mission_seed_healthy';

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

  // Témoin négatif. Il porte sur `mission_seed_healthy`, une mission qu'AUCUNE
  // autre spec ne pilote (fixture : packages/db/src/seed.ts).
  //
  // Pourquoi pas `mission_seed_001` : lifecycle.spec.ts la conduit jusqu'au gate
  // §5. `executeNextTask` la passe en `executing` (dispatch.ts:674-677) puis
  // `pauseForRiskGate` (dispatch.ts:328) ouvre la validation SANS remettre le
  // statut en arrière — la mission reste donc déclarée « executing » avec une
  // validation pending tant que la modale n'est pas tranchée. Sur ce palier elle
  // est LÉGITIMEMENT désynchronisée (`awaiting_human` ∉ COMPATIBLE['executing']),
  // et un autre worker Playwright qui naviguerait à cet instant ferait échouer
  // `toHaveCount(0)` sans qu'aucun bug n'existe. Les deux specs partagent la même
  // base de smoke : la seule fixture fiable pour un témoin négatif est une
  // mission que personne ne conduit.
  test('une mission saine ne porte aucun badge', async ({ page }) => {
    await page.goto(`/missions/${HEALTHY_MISSION_ID}`);
    // Ancrage positif d'abord : sans lui, un 404 ou un rendu cassé ferait passer
    // l'assertion négative pour la mauvaise raison (rien à l'écran ⇒ 0 badge).
    await expect(page.getByTestId('mission-status')).toHaveText(/archived/i, { timeout: 10_000 });
    await expect(page.getByTestId('mission-desync-badge')).toHaveCount(0);
  });
});
