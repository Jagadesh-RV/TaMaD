import { test, expect } from '../../fixtures/customFixtures';

// Bypass global setup so we aren't already logged in
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Forgot Password Page', () => {
  test.beforeEach(async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.navigate();
  });

  test('should render the forgot password form', async ({ forgotPasswordPage }) => {
    await expect(forgotPasswordPage.pageTitle).toBeVisible();
    await expect(forgotPasswordPage.emailInput).toBeVisible();
    await expect(forgotPasswordPage.sendResetLinkBtn).toBeVisible();
  });

  test('should validate the email field', async ({ forgotPasswordPage, page }) => {
    await forgotPasswordPage.emailInput.fill('not-an-email');
    await forgotPasswordPage.sendResetLinkBtn.click();
    await expect(page.getByText('Enter a valid email address')).toBeVisible();
  });

  test('should link back to login', async ({ forgotPasswordPage, page }) => {
    await forgotPasswordPage.backToLoginLink.click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
