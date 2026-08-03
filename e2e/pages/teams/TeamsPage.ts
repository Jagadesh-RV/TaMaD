import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export interface MockMember {
  _id: string;
  userId: { _id: string; name: string; email: string };
  roleId: { _id: string; name: string };
  status: 'active' | 'suspended';
  joinedAt: string;
}

export class TeamsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly noTeamMessage: Locator;
  readonly inviteEmailInput: Locator;
  readonly sendInviteBtn: Locator;
  readonly memberRows: Locator;
  readonly emptyMembersMessage: Locator;

  constructor(page: Page) {
    super(page, '/team/members');
    this.pageTitle = page.locator('h1', { hasText: 'Team Members' });
    this.noTeamMessage = page.getByText('This workspace does not belong to a team.');
    this.inviteEmailInput = page.getByPlaceholder('Enter email address');
    this.sendInviteBtn = page.getByRole('button', { name: 'Send Invite' });
    this.memberRows = page.locator('tbody tr');
    this.emptyMembersMessage = page.getByText('No members found.');
  }

  async inviteMember(email: string) {
    await this.inviteEmailInput.fill(email);
    await this.sendInviteBtn.click();
  }

  getMemberRow(nameOrEmail: string): Locator {
    // Finds the table row that contains the user's name or email
    return this.page.locator('tr', { hasText: nameOrEmail });
  }

  async mockTeamContext(members: MockMember[]) {
    // Workspace pointing at a team so the members page renders
    await this.page.route('**/api/workspaces', (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            _id: 'e2e-workspace-id',
            name: 'E2E Team Workspace',
            type: 'team',
            teamId: 'e2e-team-id',
            ownerId: 'e2e-user-id',
            members: [],
            isActive: true,
            settings: { allowGuests: false, isPublic: false },
          },
        ]),
      });
    });

    await this.page.route('**/api/teams', (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          teams: [
            {
              _id: 'e2e-team-id',
              name: 'E2E Team',
              slug: 'e2e-team',
              color: '#4f46e5',
              visibility: 'private',
              timeZone: 'UTC',
            },
          ],
        }),
      });
    });

    await this.page.route('**/api/teams/*/members', (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ members }),
      });
    });
  }

  async mockInvite() {
    await this.page.route('**/api/teams/*/invite', (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ invite: { _id: 'e2e-invite-id', token: 'e2e-token' } }),
      });
    });
  }
}
