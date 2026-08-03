import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export interface MockWorkspace {
  _id: string;
  name: string;
  type: 'personal' | 'team';
  teamId?: string;
  organizationId?: string;
  ownerId: string;
  members: unknown[];
  isActive: boolean;
  settings: { allowGuests: boolean; isPublic: boolean };
}

export interface MockTeam {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  color: string;
  visibility: 'private' | 'public';
  organizationId?: string;
  timeZone: string;
  createdAt?: string;
  updatedAt?: string;
}

export class TeamSettingsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly noTeamMessage: Locator;

  // General (profile) section
  readonly generalSection: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly saveBtn: Locator;

  // Danger zone section
  readonly dangerZone: Locator;
  readonly leaveTeamBtn: Locator;
  readonly deleteTeamBtn: Locator;

  constructor(page: Page) {
    super(page, '/team/settings');
    this.pageTitle = page.locator('h1', { hasText: 'Team Settings' });
    this.noTeamMessage = page.getByText('This workspace does not belong to a team.');

    this.generalSection = page.locator('section', { has: page.getByRole('heading', { name: 'General' }) });
    this.nameInput = this.generalSection.locator('input[type="text"]');
    this.descriptionInput = this.generalSection.locator('textarea');
    this.saveBtn = this.generalSection.getByRole('button', { name: 'Save Changes' });

    this.dangerZone = page.locator('section', { has: page.getByRole('heading', { name: 'Danger Zone' }) });
    this.leaveTeamBtn = this.dangerZone.getByRole('button', { name: 'Leave Team', exact: true });
    this.deleteTeamBtn = this.dangerZone.getByRole('button', { name: 'Delete Team', exact: true });
  }

  async mockTeamContext(workspace: MockWorkspace, teams: MockTeam[]) {
    // Workspace pointing at a team so the settings form renders
    await this.page.route('**/api/workspaces', (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([workspace]),
      });
    });

    await this.page.route('**/api/teams', (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ teams }),
      });
    });
  }

  async mockUpdateTeam(team: MockTeam) {
    await this.page.route('**/api/teams/*', (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ team }),
      });
    });
  }

  async mockLeaveTeam() {
    await this.page.route('**/api/teams/*/leave', (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });
  }

  async mockDeleteTeam() {
    await this.page.route('**/api/teams/*', (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });
  }
}
