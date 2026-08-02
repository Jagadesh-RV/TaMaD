import { test, expect } from '../../fixtures/customFixtures';

test.describe('Not Found Page', () => {
  test.beforeEach(async ({ notFoundPage }) => {
    await notFoundPage.navigate();
  });

  test('should show the 404 page for unknown routes', async ({ notFoundPage }) => {
    await expect(notFoundPage.pageTitle).toBeVisible();
    await expect(notFoundPage.notFoundCode).toBeVisible();
    await expect(notFoundPage.goBackBtn).toBeVisible();
    await expect(notFoundPage.dashboardLink).toBeVisible();
  });
});
