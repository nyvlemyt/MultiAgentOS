import { test, expect } from '@playwright/test';

const MISSION_ID = 'mission_seed_001';

test.describe.serial('Phase 1 mission lifecycle', () => {
  test('Plan + Run produces tasks, pauses on risk=high, Approve drives to archived', async ({ page }) => {
    await page.goto(`/missions/${MISSION_ID}`);

    // Initial state: draft
    await expect(page.getByTestId('mission-status')).toHaveText(/draft/i);

    // Click Plan
    await page.getByRole('button', { name: /plan mission/i }).click();
    await expect(page.getByTestId('mission-status')).toHaveText(/planned/i, { timeout: 10_000 });

    // Tasks now visible
    const taskRows = page.getByTestId('task-row');
    await expect(taskRows.first()).toBeVisible({ timeout: 10_000 });
    expect(await taskRows.count()).toBeGreaterThanOrEqual(5);

    // Run mission — driver loops inline until validation pause
    await page.getByRole('button', { name: /run mission/i }).click();

    // Validation modal must appear because seed plan includes a risk=high task
    const modal = page.getByRole('dialog', { name: /pending validation/i });
    await expect(modal).toBeVisible({ timeout: 15_000 });

    // Approve the validation; mission should reach validated then archived after one more click
    await modal.getByRole('button', { name: /approve/i }).click();

    await expect(page.getByTestId('mission-status')).toHaveText(/validated/i, { timeout: 15_000 });

    // Archive
    await page.getByRole('button', { name: /^archive$/i }).click();
    await expect(page.getByTestId('mission-status')).toHaveText(/archived/i, { timeout: 10_000 });
  });

  test('kanban move from Inbox to To clarify reflects in the UI', async ({ page, request }) => {
    // Reset the mission to draft via the status route (allowlisted)
    await request.post(`/api/missions/${MISSION_ID}/status`, { data: { status: 'draft' } });

    await page.goto('/missions');
    const card = page.locator(`[data-testid="mission-card"][data-mission-id="${MISSION_ID}"]`);
    await expect(card).toBeVisible({ timeout: 10_000 });

    // Confirm starting column.
    const startSection = card.locator('xpath=ancestor::section[1]');
    await expect(startSection).toContainText(/Inbox/i);

    // We exercise both layers:
    //   (a) the contract: the same status endpoint the kanban drop fires.
    //   (b) the UI: after the move, the card renders inside the target column.
    // We intentionally do NOT rely on Playwright's mouse-based HTML5 DnD here —
    // dataTransfer is unreliable across headless browsers and is not what
    // Phase 1 promises. The contract under test is "drop → status route →
    // card lands in the new column on next render".
    const resp = await request.post(`/api/missions/${MISSION_ID}/status`, { data: { status: 'clarified' } });
    expect(resp.ok()).toBeTruthy();

    await page.reload();
    const reloaded = page.locator(`[data-testid="mission-card"][data-mission-id="${MISSION_ID}"]`);
    await expect(reloaded).toBeVisible();
    const targetSection = reloaded.locator('xpath=ancestor::section[1]');
    await expect(targetSection).toContainText(/To clarify/i);

    // And the original column no longer contains the card.
    const inboxSection = page.locator('section', { hasText: 'Inbox' }).first();
    await expect(inboxSection.locator(`[data-mission-id="${MISSION_ID}"]`)).toHaveCount(0);
  });
});
