import { test, expect } from '@playwright/test';

const routes = [
  { path: '/', heading: 'Command Center' },
  { path: '/projects', heading: 'Projects' },
  { path: '/projects/new', heading: 'Register a project' },
  { path: '/projects/otakugo', heading: 'OtakuGO_UP' },
  { path: '/ideas', heading: 'Ideas Inbox' },
  { path: '/priorities', heading: 'Priorities' },
  { path: '/missions', heading: 'Missions' },
  { path: '/missions/mission_seed_001', heading: 'Polish OtakuGO feed empty-state' },
  { path: '/agents', heading: 'Agents' },
  { path: '/agents/mission-planner', heading: 'Mission Planner' },
  { path: '/studio', heading: 'Agent Studio' },
  { path: '/skills', heading: 'Skills Registry' },
  { path: '/tokens', heading: 'Quota & Cache' },
  { path: '/trace', heading: 'Trace' },
  { path: '/memory', heading: 'Memory Center' },
];

for (const r of routes) {
  test(`route ${r.path} renders and has heading`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(`console.error: ${m.text()}`);
    });
    await page.goto(r.path);
    await expect(page.getByRole('heading', { name: r.heading }).first()).toBeVisible({ timeout: 15_000 });
    expect(errors, `Console errors on ${r.path}:\n${errors.join('\n')}`).toEqual([]);
  });
}

test('memory inbox filters by intake source', async ({ page }) => {
  await page.goto('/memory');
  const filter = page.getByLabel('Intake source filter');
  await expect(filter).toBeVisible();
  await filter.getByRole('link', { name: 'repo', exact: true }).click();
  await expect(page).toHaveURL(/\/memory\?source=repo/);
  await expect(page.getByRole('heading', { name: 'Memory Center' })).toBeVisible();
});

test('studio orbit animates a delegation edge', async ({ page }) => {
  await page.goto('/studio');
  await expect(page.locator('svg .orbit-edge')).toHaveCount(1);
});

test('theme toggle flips data-theme attribute', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByLabel('Toggle theme').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('ideas kanban renders seeded idea cards', async ({ page }) => {
  await page.goto('/ideas');
  await expect(page.getByTestId('idea-card').first()).toBeVisible({ timeout: 15_000 });
});

test('convert-to-mission is idempotent (Phase 4.5-receptacle)', async ({ request }) => {
  const create = await request.post('/api/ideas', {
    data: { title: 'Smoke convert idea', scope: 'project', projectId: 'proj_otakugo' },
  });
  expect(create.ok()).toBeTruthy();
  const { idea } = await create.json();

  const first = await request.post(`/api/ideas/${idea.id}/convert`);
  const firstBody = await first.json();
  expect(firstBody.created).toBe(true);

  const second = await request.post(`/api/ideas/${idea.id}/convert`);
  const secondBody = await second.json();
  expect(secondBody.created).toBe(false);
  expect(secondBody.missionId).toBe(firstBody.missionId);
});

test('a decision logged manually appears on its project page', async ({ page, request }) => {
  const title = `Smoke decision ${Date.now()}`;
  const res = await request.post('/api/decisions', { data: { title, projectId: 'proj_otakugo' } });
  expect(res.ok()).toBeTruthy();

  await page.goto('/projects/otakugo');
  await expect(page.getByTestId('decision-list').filter({ hasText: title }).first()).toBeVisible({ timeout: 15_000 });
});

test('Command Center flags a mission deadline within 7 days', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('deadline-card')).toBeVisible({ timeout: 15_000 });
});

test('Command Center shows the autopilot daily-report card and pending-validations indicator (Phase 6)', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('daily-report-card')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('pending-validations')).toBeVisible({ timeout: 15_000 });
});

test('priorities board lists missions with a score', async ({ page }) => {
  await page.goto('/priorities');
  await expect(page.getByTestId('priority-row').first()).toBeVisible({ timeout: 15_000 });
});

test('language pill persists and switches the cockpit-shell language (Phase 3.5b)', async ({ page }) => {
  await page.goto('/');
  const pill = page.getByTestId('language-pill');
  await expect(pill).toBeVisible();
  // Default project language is fr → French nav.
  await expect(page.getByRole('link', { name: 'Centre de commande' })).toBeVisible({ timeout: 15_000 });

  // Await the PATCH so the write lands before we reload (a reload would
  // otherwise abort the in-flight request).
  const [patch] = await Promise.all([
    page.waitForResponse((r) => /\/api\/projects\/.+\/language$/.test(r.url()) && r.request().method() === 'PATCH'),
    pill.getByRole('button', { name: 'en' }).click(),
  ]);
  expect(patch.ok()).toBeTruthy();
  await expect(pill.getByRole('button', { name: 'en' })).toHaveAttribute('aria-pressed', 'true');

  // Persisted: a reload re-reads the project and keeps en + English nav.
  await page.reload();
  await expect(page.getByTestId('language-pill').getByRole('button', { name: 'en' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('link', { name: 'Command Center' })).toBeVisible({ timeout: 15_000 });

  // Restore the default so the rest of the suite sees fr.
  await Promise.all([
    page.waitForResponse((r) => /\/api\/projects\/.+\/language$/.test(r.url()) && r.request().method() === 'PATCH'),
    page.getByTestId('language-pill').getByRole('button', { name: 'fr' }).click(),
  ]);
  await expect(page.getByTestId('language-pill').getByRole('button', { name: 'fr' })).toHaveAttribute('aria-pressed', 'true');
});
