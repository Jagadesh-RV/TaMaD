import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

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
}
