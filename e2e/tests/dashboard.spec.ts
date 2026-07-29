import { test, expect } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/user.json' });

test('dashboard loads with correct title', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=Dashboard')).toBeVisible();
});

test('sidebar navigation works', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Tasks');
  await expect(page).toHaveURL(/\/tasks/);
  await page.click('text=Projects');
  await expect(page).toHaveURL(/\/projects/);
  await page.click('text=Analytics');
  await expect(page).toHaveURL(/\/analytics/);
});

test('AI assistant page loads', async ({ page }) => {
  await page.goto('/ai');
  await expect(page.locator('text=AI Assistant')).toBeVisible();
  await expect(page.locator('text=Workspace Chat')).toBeVisible();
  await expect(page.locator('text=Task Parser')).toBeVisible();
});
