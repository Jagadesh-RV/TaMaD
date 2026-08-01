import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class RegisterPage extends BasePage {
  constructor(page: Page) {
    super(page, '/register');
  }

  async register(name: string, email: string, password: string = 'Password123') {
    await this.fillInputByLabel('Full Name', name);
    await this.fillInputByLabel('Email', email);
    await this.fillInputByLabel('Password', password);
    await this.fillInputByLabel('Confirm Password', password);
    await this.clickButtonByText('Create account');
  }
}
