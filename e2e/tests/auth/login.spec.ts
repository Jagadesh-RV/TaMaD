import { test, expect } from '../../fixtures/customFixtures';

// Bypass global setup so we aren't already logged in
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login Flow', () => {
  test('should login successfully with valid credentials', async ({ page, loginPage }) => {
    // Assuming the setup already created this user or tests against emulator
    const email = process.env.TEST_USER_EMAIL || 'teste2e@example.com';
    const password = process.env.TEST_USER_PASSWORD || 'password123';

    await loginPage.navigate();
    await loginPage.login(email, password);
    
    // We expect to end up on the dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('should show error for invalid credentials', async ({ page, loginPage }) => {
    await loginPage.navigate();
    await loginPage.fillInputByLabel('Email', 'wrong@example.com');
    await loginPage.fillInputByLabel('Password', 'wrongpass');
    await loginPage.clickButtonByText('Sign in to TaMaD');

    const errorMsg = await loginPage.getNotificationMessage();
    expect(errorMsg).toBeTruthy();
    // The exact message depends on firebase state but should be an error toast
  });

  test('should validate required fields', async ({ page, loginPage }) => {
    await loginPage.navigate();
    await loginPage.clickButtonByText('Sign in to TaMaD');

    await expect(page.locator('text=Enter a valid email address')).toBeVisible();
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
  });
});
