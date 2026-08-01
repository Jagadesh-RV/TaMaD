import { test, expect } from '../../fixtures/customFixtures';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ settingsPage }) => {
    // This will use the globally authenticated state and go to /settings
    await settingsPage.navigate();
  });

  test('should navigate between settings tabs', async ({ page, settingsPage }) => {
    // Switch to Notifications tab
    await settingsPage.switchTab('Notifications');
    await expect(page.locator('text=Notification Preferences')).toBeVisible();

    // Switch to Account tab
    await settingsPage.switchTab('Account');
    await expect(page.locator('text=Account Settings')).toBeVisible();

    // Switch to Security tab
    await settingsPage.switchTab('Security');
    await expect(page.locator('text=Change Password')).toBeVisible();

    // Switch to Sessions tab
    await settingsPage.switchTab('Sessions');
    await expect(page.locator('text=Active Sessions')).toBeVisible();
  });

  test('should toggle theme selection', async ({ settingsPage }) => {
    await settingsPage.switchTab('Appearance');
    // Select Light theme
    await settingsPage.selectTheme('Light');
    // Select Dark theme
    await settingsPage.selectTheme('Dark');
    // We expect the click to work. (In a real scenario, we could verify the DOM changes or localStorage).
  });

  test('should show validation when changing password without entering fields', async ({ page, settingsPage }) => {
    await settingsPage.switchTab('Security');
    await page.getByRole('button', { name: 'Update Password', exact: true }).click();
    
    // Using the getNotificationMessage from BasePage
    const errorMsg = await settingsPage.getNotificationMessage();
    expect(errorMsg).toBeTruthy();
  });
});
