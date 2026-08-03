import { test, expect } from '../../fixtures/customFixtures';

test.describe('Team Settings Page', () => {
  test.beforeEach(async ({ teamSettingsPage }) => {
    await teamSettingsPage.navigate();
  });

  test('should load team settings or show the no-team empty state', async ({ teamSettingsPage }) => {
    // If the workspace does not belong to a team, the empty state is shown
    if (await teamSettingsPage.noTeamMessage.isVisible()) {
      await expect(teamSettingsPage.noTeamMessage).toBeVisible();
    } else {
      await expect(teamSettingsPage.pageTitle).toBeVisible();
    }
  });

  test('should show the team profile form fields when a team exists', async ({ teamSettingsPage }) => {
    if (await teamSettingsPage.noTeamMessage.isVisible()) {
      test.skip();
      return;
    }
    await expect(teamSettingsPage.nameInput).toBeVisible();
    await expect(teamSettingsPage.descriptionInput).toBeVisible();
    await expect(teamSettingsPage.saveBtn).toBeVisible();
  });

  test('should show danger zone actions when a team exists', async ({ teamSettingsPage }) => {
    if (await teamSettingsPage.noTeamMessage.isVisible()) {
      test.skip();
      return;
    }
    await expect(teamSettingsPage.leaveTeamBtn).toBeVisible();
    await expect(teamSettingsPage.deleteTeamBtn).toBeVisible();
  });

  test('should allow editing the team name in the profile form', async ({ teamSettingsPage }) => {
    if (await teamSettingsPage.noTeamMessage.isVisible()) {
      test.skip();
      return;
    }
    const current = await teamSettingsPage.nameInput.inputValue();
    await teamSettingsPage.nameInput.fill(`${current} (edited)`);
    await expect(teamSettingsPage.nameInput).toHaveValue(`${current} (edited)`);
  });
});
