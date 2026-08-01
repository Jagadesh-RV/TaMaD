import { test, expect } from '../../fixtures/customFixtures';

// Bypass global setup so we aren't already logged in
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Registration Flow', () => {
  test('should validate form inputs', async ({ page, registerPage }) => {
    await registerPage.navigate();
    await registerPage.clickButtonByText('Create account');

    await expect(page.locator('text=Name must be at least 2 characters')).toBeVisible();
    await expect(page.locator('text=Enter a valid email address')).toBeVisible();
    await expect(page.locator('text=Use at least 8 characters').first()).toBeVisible();
  });

  test('should validate password mismatch', async ({ page, registerPage }) => {
    await registerPage.navigate();
    await registerPage.fillInputByLabel('Full Name', 'Test User');
    await registerPage.fillInputByLabel('Email', 'testnew@example.com');
    await registerPage.fillInputByLabel('Password', 'Password123');
    await registerPage.fillInputByLabel('Confirm Password', 'Password124');
    await registerPage.clickButtonByText('Create account');

    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  // Note: Creating a successful registration test might pollute the database with many users
  // It's usually better to mock the backend for registration testing, or clean up the database after.
});
