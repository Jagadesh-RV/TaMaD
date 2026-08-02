import { test, expect } from '../../fixtures/customFixtures';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ landingPage }) => {
    await landingPage.navigate();
  });

  test('should render hero and navigation', async ({ landingPage }) => {
    await expect(landingPage.heroHeading).toBeVisible();
    await expect(landingPage.navbar).toBeVisible();
    await expect(landingPage.navItem('Features')).toBeVisible();
    await expect(landingPage.navItem('Pricing')).toBeVisible();
  });

  test('should show the Open App action when authenticated', async ({ landingPage, page }) => {
    await expect(landingPage.openAppLink).toBeVisible();
    await landingPage.openAppLink.click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
