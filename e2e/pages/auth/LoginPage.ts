import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page, '/login');
  }

  async login(email: string, password: string = 'password123') {
    await this.fillInputByLabel('Email', email);
    await this.fillInputByLabel('Password', password);
    await this.clickButtonByText('Sign in to TaMaD');
    // Wait for URL to change to dashboard
    await this.page.waitForURL('**/dashboard');
    await this.waitForLoad();
  }
}
