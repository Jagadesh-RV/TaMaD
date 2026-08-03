import { test, expect } from '../../fixtures/customFixtures';
import { MockMember } from '../../pages/teams/TeamsPage';

const mockMembers: MockMember[] = [
  {
    _id: 'e2e-member-1',
    userId: { _id: 'e2e-user-1', name: 'Alice Chen', email: 'alice@example.com' },
    roleId: { _id: 'role-owner', name: 'Owner' },
    status: 'active',
    joinedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    _id: 'e2e-member-2',
    userId: { _id: 'e2e-user-2', name: 'Bob Smith', email: 'bob@example.com' },
    roleId: { _id: 'role-member', name: 'Member' },
    status: 'active',
    joinedAt: '2026-02-01T00:00:00.000Z',
  },
];

test.describe('Teams Page', () => {
  test('should load team members page or show empty state', async ({ page, teamsPage }) => {
    // If the workspace does not belong to a team yet, it shows a message
    await teamsPage.navigate();
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

  test('should render the invite form and member list when the workspace belongs to a team', async ({ teamsPage }) => {
    await teamsPage.mockTeamContext(mockMembers);
    await teamsPage.navigate();

    await expect(teamsPage.pageTitle).toBeVisible();
    await expect(teamsPage.inviteEmailInput).toBeVisible();
    await expect(teamsPage.sendInviteBtn).toBeVisible();

    // Table headers render
    for (const header of ['Member', 'Status', 'Joined', 'Actions']) {
      await expect(teamsPage.page.getByRole('columnheader', { name: header })).toBeVisible();
    }

    // Mocked members are listed
    await expect(teamsPage.getMemberRow('Alice Chen')).toBeVisible();
    await expect(teamsPage.getMemberRow('Bob Smith')).toBeVisible();
    await expect(teamsPage.memberRows).toHaveCount(2);
  });

  test('should show the no-members message when the team has no members', async ({ teamsPage }) => {
    await teamsPage.mockTeamContext([]);
    await teamsPage.navigate();

    await expect(teamsPage.pageTitle).toBeVisible();
    await expect(teamsPage.emptyMembersMessage).toBeVisible();
  });

  test('should invite a member and clear the input on success', async ({ teamsPage }) => {
    await teamsPage.mockTeamContext(mockMembers);
    await teamsPage.mockInvite();
    await teamsPage.navigate();

    await teamsPage.inviteMember('newmember@example.com');
    await expect(teamsPage.inviteEmailInput).toHaveValue('');

    const toast = teamsPage.page.locator('.toast-message, [role="alert"]').first();
    await toast.waitFor({ state: 'visible', timeout: 5000 });
    await expect(toast).toContainText('Invitation generated');
  });
});
