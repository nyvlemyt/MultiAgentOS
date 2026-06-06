import { test, expect } from '@playwright/test';

const routes = [
  { path: '/', heading: 'Command Center' },
  { path: '/projects', heading: 'Projects' },
  { path: '/projects/new', heading: 'Register a project' },
  { path: '/projects/otakugo', heading: 'OtakuGO_UP' },
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
