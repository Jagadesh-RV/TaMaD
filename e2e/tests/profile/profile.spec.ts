import { test, expect } from '../../fixtures/customFixtures';

test.describe('Profile Page', () => {
  test.beforeEach(async ({ profilePage }) => {
    await profilePage.navigate();
  });

  test('should display profile information', async ({ profilePage }) => {
    await expect(profilePage.pageTitle).toBeVisible();

    for (const label of ['Auth Provider', 'Role', 'Member Since', 'Sessions']) {
      await expect(profilePage.getStatValue(label)).toBeVisible();
    }

    await expect(profilePage.getInfoValue('Email')).toBeVisible();
    await expect(profilePage.getInfoValue('Phone')).toBeVisible();
  });

  test('should toggle name editing mode', async ({ profilePage }) => {
    await profilePage.startEditing();
    await expect(profilePage.nameInput).toBeVisible();

    await profilePage.cancelEditBtn.click();
    await expect(profilePage.nameInput).toHaveCount(0);
  });

  test('should expand and collapse the change password form', async ({ profilePage }) => {
    await profilePage.openChangePassword();
    await expect(profilePage.currentPasswordInput).toBeVisible();
    await expect(profilePage.newPasswordInput).toBeVisible();
    await expect(profilePage.confirmPasswordInput).toBeVisible();

    await profilePage.cancelPasswordBtn.click();
    await expect(profilePage.currentPasswordInput).toHaveCount(0);
  });

  test('should toggle dark mode', async ({ profilePage, page }) => {
    const subtitle = profilePage.darkModeRow.locator('p.text-xs');
    const before = await subtitle.textContent();

    await profilePage.toggleDarkMode();
    await expect(subtitle).not.toHaveText(before || '');

    await profilePage.toggleDarkMode();
    await expect(subtitle).toHaveText(before || '');
  });

  test('should display active sessions', async ({ profilePage, page }) => {
    await expect(profilePage.sessionsSection).toBeVisible();
    await profilePage.refreshSessionsBtn.click();

    await expect(
      page.locator('text=No active sessions found.').or(page.getByText('Current', { exact: true }))
    ).toBeVisible();
  });

  test('should sign out and redirect to login', async ({ profilePage, page }) => {
    await profilePage.signOutBtn.click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
