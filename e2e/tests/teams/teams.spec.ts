import { test, expect } from '../../fixtures/customFixtures';

test.describe('Teams Page', () => {
  test.beforeEach(async ({ teamsPage }) => {
    await teamsPage.navigate();
  });

  test('should load team members page or show empty state', async ({ page, teamsPage }) => {
    // If the workspace does not belong to a team yet, it shows a message
    const emptyMsg = page.locator('text=This workspace does not belong to a team.');
    const header = page.locator('h1', { hasText: 'Team Members' });

    // Ensure the page loads properly
    const isNoTeam = await emptyMsg.isVisible();
    if (isNoTeam) {
      await expect(emptyMsg).toBeVisible();
    } else {
      await expect(header).toBeVisible();
      await expect(teamsPage.inviteEmailInput).toBeVisible();
    }
  });
});
