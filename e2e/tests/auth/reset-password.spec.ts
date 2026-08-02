import { test, expect } from '../../fixtures/customFixtures';

// Bypass global setup so we aren't already logged in
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Reset Password Page', () => {
  test.beforeEach(async ({ resetPasswordPage }) => {
    await resetPasswordPage.navigate();
  });

  test('should render the reset password form', async ({ resetPasswordPage }) => {
    await expect(resetPasswordPage.pageTitle).toBeVisible();
    await expect(resetPasswordPage.newPasswordInput).toBeVisible();
    await expect(resetPasswordPage.confirmPasswordInput).toBeVisible();
    await expect(resetPasswordPage.updatePasswordBtn).toBeVisible();
  });

  test('should validate minimum password length', async ({ resetPasswordPage, page }) => {
    await resetPasswordPage.newPasswordInput.fill('short');
    await resetPasswordPage.confirmPasswordInput.fill('short');
    await resetPasswordPage.updatePasswordBtn.click();
    await expect(page.getByText('Use at least 8 characters')).toBeVisible();
  });

  test('should validate password mismatch', async ({ resetPasswordPage, page }) => {
    await resetPasswordPage.newPasswordInput.fill('Password123');
    await resetPasswordPage.confirmPasswordInput.fill('Password124');
    await resetPasswordPage.updatePasswordBtn.click();
    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });
});
