import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ProfilePage extends BasePage {
  readonly pageTitle: Locator;
  readonly editBtn: Locator;
  readonly nameInput: Locator;
  readonly saveBtn: Locator;
  readonly cancelEditBtn: Locator;
  readonly signOutBtn: Locator;
  readonly darkModeToggle: Locator;
  readonly refreshSessionsBtn: Locator;
  readonly changePasswordBtn: Locator;
  readonly cancelPasswordBtn: Locator;
  readonly currentPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly sessionsSection: Locator;

  constructor(page: Page) {
    super(page, '/profile');
    this.pageTitle = page.locator('h1', { hasText: 'Profile' });
    this.editBtn = page.getByRole('button', { name: 'Edit', exact: true });
    this.nameInput = page.locator('input.input-field');
    this.saveBtn = page.getByRole('button', { name: 'Save', exact: true });
    this.cancelEditBtn = page.getByRole('button', { name: 'Cancel', exact: true });

    this.signOutBtn = page.getByRole('button', { name: 'Sign out', exact: true });
    this.darkModeToggle = page.locator('button.relative.h-7.w-12');
    this.refreshSessionsBtn = page.getByRole('button', { name: 'Refresh', exact: true });
    this.sessionsSection = page.locator('.card', { hasText: 'Active Sessions' });

    const securityCard = page.locator('.card', { hasText: 'Security' });
    this.changePasswordBtn = securityCard.getByRole('button', { name: 'Change Password', exact: true });
    this.cancelPasswordBtn = securityCard.getByRole('button', { name: 'Cancel', exact: true });
    this.currentPasswordInput = securityCard.getByPlaceholder('Current password');
    this.newPasswordInput = securityCard.getByPlaceholder('New password');
    this.confirmPasswordInput = securityCard.getByPlaceholder('Confirm new password');
  }

  getInfoValue(label: string): Locator {
    return this.page
      .getByText(label, { exact: true })
      .locator('xpath=..')
      .locator('span.text-sm.font-semibold');
  }

  getStatValue(label: string): Locator {
    return this.page
      .getByText(label, { exact: true })
      .locator('xpath=following-sibling::p')
      .first();
  }

  getSessionRow(deviceName: string): Locator {
    return this.page
      .getByText(deviceName, { exact: true })
      .locator('xpath=ancestor::div[contains(@class, "rounded-xl")]')
      .first();
  }

  get emptySessionsMessage(): Locator {
    return this.page.getByText('No active sessions found.');
  }

  get darkModeRow(): Locator {
    return this.page
      .getByText('Dark Mode', { exact: true })
      .locator('xpath=ancestor::div[contains(@class, "rounded-xl")]')
      .first();
  }

  async startEditing() {
    await this.editBtn.click();
  }

  async toggleDarkMode() {
    await this.darkModeToggle.click();
  }

  async openChangePassword() {
    await this.changePasswordBtn.click();
  }
}
