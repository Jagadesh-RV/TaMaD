import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ContactPage extends BasePage {
  readonly pageTitle: Locator;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly countrySelect: Locator;
  readonly phoneInput: Locator;
  readonly subjectInput: Locator;
  readonly messageInput: Locator;
  readonly sendMessageBtn: Locator;

  constructor(page: Page) {
    super(page, '/contact');
    this.pageTitle = page.locator('h1', { hasText: 'Contact Us' });
    this.fullNameInput = page.getByLabel('Full name');
    this.emailInput = page.getByLabel('Email');
    this.countrySelect = page.getByLabel('Country');
    this.phoneInput = page.getByLabel('Phone number');
    this.subjectInput = page.getByLabel('Subject');
    this.messageInput = page.getByLabel('Message');
    this.sendMessageBtn = page.getByRole('button', { name: 'Send message', exact: true });
  }

  async submitEmpty() {
    await this.sendMessageBtn.click();
  }
}
