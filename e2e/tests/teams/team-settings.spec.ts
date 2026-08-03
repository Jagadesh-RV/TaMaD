import { test, expect } from '../../fixtures/customFixtures';
import { MockWorkspace, MockTeam } from '../../pages/teams/TeamSettingsPage';

const mockWorkspace: MockWorkspace = {
  _id: 'e2e-workspace-id',
  name: 'E2E Team Workspace',
  type: 'team',
  teamId: 'e2e-team-id',
  ownerId: 'e2e-user-id',
  members: [],
  isActive: true,
  settings: { allowGuests: false, isPublic: false },
};

const mockTeam: MockTeam = {
  _id: 'e2e-team-id',
  name: 'E2E Engineering',
  slug: 'e2e-engineering',
  description: 'The engineering squad',
  color: '#4f46e5',
  visibility: 'private',
  timeZone: 'UTC',
};

test.describe('Team Settings Page', () => {
  test('should load team settings or show the no-team empty state', async ({ teamSettingsPage }) => {
    await teamSettingsPage.navigate();

    // If the workspace does not belong to a team, the empty state is shown
    if (await teamSettingsPage.noTeamMessage.isVisible()) {
      await expect(teamSettingsPage.noTeamMessage).toBeVisible();
    } else {
      await expect(teamSettingsPage.pageTitle).toBeVisible();
    }
  });

  test('should show the team profile form fields when a team exists', async ({ teamSettingsPage }) => {
    await teamSettingsPage.mockTeamContext(mockWorkspace, [mockTeam]);
    await teamSettingsPage.navigate();

    await expect(teamSettingsPage.pageTitle).toBeVisible();
    await expect(teamSettingsPage.nameInput).toHaveValue('E2E Engineering');
    await expect(teamSettingsPage.descriptionInput).toHaveValue('The engineering squad');
    await expect(teamSettingsPage.saveBtn).toBeVisible();
  });

  test('should show danger zone actions when a team exists', async ({ teamSettingsPage }) => {
    await teamSettingsPage.mockTeamContext(mockWorkspace, [mockTeam]);
    await teamSettingsPage.navigate();

    await expect(teamSettingsPage.leaveTeamBtn).toBeVisible();
    await expect(teamSettingsPage.deleteTeamBtn).toBeVisible();
  });

  test('should allow editing the team name in the profile form', async ({ teamSettingsPage }) => {
    await teamSettingsPage.mockTeamContext(mockWorkspace, [mockTeam]);
    await teamSettingsPage.navigate();

    const current = await teamSettingsPage.nameInput.inputValue();
    await teamSettingsPage.nameInput.fill(`${current} (edited)`);
    await expect(teamSettingsPage.nameInput).toHaveValue(`${current} (edited)`);
  });

  test('should save the updated team profile', async ({ teamSettingsPage }) => {
    await teamSettingsPage.mockTeamContext(mockWorkspace, [mockTeam]);
    await teamSettingsPage.mockUpdateTeam({ ...mockTeam, name: 'E2E Engineering (Updated)' });
    await teamSettingsPage.navigate();

    await teamSettingsPage.nameInput.fill('E2E Engineering (Updated)');
    await teamSettingsPage.saveBtn.click();

    const toast = teamSettingsPage.page.locator('.toast-message, [role="alert"]').first();
    await toast.waitFor({ state: 'visible', timeout: 5000 });
    await expect(toast).toContainText('Team updated successfully');
  });

  test('should leave the team from the danger zone', async ({ teamSettingsPage }) => {
    await teamSettingsPage.mockTeamContext(mockWorkspace, [mockTeam]);
    await teamSettingsPage.mockLeaveTeam();
    await teamSettingsPage.navigate();

    teamSettingsPage.page.on('dialog', (dialog) => void dialog.accept());
    await teamSettingsPage.leaveTeamBtn.click();

    const toast = teamSettingsPage.page.locator('.toast-message, [role="alert"]').first();
    await toast.waitFor({ state: 'visible', timeout: 5000 });
    await expect(toast).toContainText('You have left the team');
  });

  test('should delete the team from the danger zone', async ({ teamSettingsPage }) => {
    await teamSettingsPage.mockTeamContext(mockWorkspace, [mockTeam]);
    await teamSettingsPage.mockDeleteTeam();
    await teamSettingsPage.navigate();

    teamSettingsPage.page.on('dialog', (dialog) => void dialog.accept());
    await teamSettingsPage.deleteTeamBtn.click();

    const toast = teamSettingsPage.page.locator('.toast-message, [role="alert"]').first();
    await toast.waitFor({ state: 'visible', timeout: 5000 });
    await expect(toast).toContainText('Team deleted');
  });
});
