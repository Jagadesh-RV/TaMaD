import { test, expect } from '../../fixtures/customFixtures';

// Bypass global setup so we aren't already logged in
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Phone Login Page', () => {
  test.beforeEach(async ({ phoneLoginPage }) => {
    await phoneLoginPage.navigate();
  });

  test('should render the phone login form', async ({ phoneLoginPage }) => {
    await expect(phoneLoginPage.pageTitle).toBeVisible();
    await expect(phoneLoginPage.countryCodeSelect).toBeVisible();
    await expect(phoneLoginPage.phoneNumberInput).toBeVisible();
    await expect(phoneLoginPage.sendCodeBtn).toBeVisible();
  });

  test('should link back to login', async ({ phoneLoginPage, page }) => {
    await phoneLoginPage.backToLoginLink.click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
