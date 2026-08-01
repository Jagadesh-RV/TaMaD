import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class TeamsPage extends BasePage {
  readonly inviteEmailInput: Locator;
  readonly sendInviteBtn: Locator;

  constructor(page: Page) {
    super(page, '/team/members');
    this.inviteEmailInput = page.getByPlaceholder('Enter email address');
    this.sendInviteBtn = page.getByRole('button', { name: 'Send Invite' });
  }

  async inviteMember(email: string) {
    await this.inviteEmailInput.fill(email);
    await this.sendInviteBtn.click();
  }

  getMemberRow(nameOrEmail: string): Locator {
    // Finds the table row that contains the user's name or email
    return this.page.locator('tr', { hasText: nameOrEmail });
  }
}
