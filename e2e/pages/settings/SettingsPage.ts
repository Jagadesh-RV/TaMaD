import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class SettingsPage extends BasePage {
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page, '/settings');
    this.saveButton = page.getByRole('button', { name: 'Save changes' });
  }

  async switchTab(tabName: 'Appearance' | 'Notifications' | 'Account' | 'Security' | 'Sessions') {
    await this.page.getByRole('button', { name: tabName, exact: true }).click();
  }

  async selectTheme(theme: 'Light' | 'Dark') {
    await this.page.getByRole('button', { name: theme, exact: true }).click();
  }

  async setFontSize(size: 'small' | 'medium' | 'large') {
    await this.page.getByRole('button', { name: size, exact: true }).click();
  }

  async togglePushNotifications() {
    // Select the toggle next to 'Push Notifications'
    await this.page.locator('text=Push Notifications').locator('xpath=..').locator('button').click();
  }

  async selectLanguage(langCode: string) {
    await this.page.locator('select').first().selectOption(langCode);
  }

  async saveChanges() {
    await this.saveButton.click();
  }
}
