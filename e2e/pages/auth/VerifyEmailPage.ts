import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class VerifyEmailPage extends BasePage {
  readonly pageTitle: Locator;
  readonly verifiedBtn: Locator;
  readonly resendBtn: Locator;

  constructor(page: Page) {
    super(page, '/verify-email');
    this.pageTitle = page.getByRole('heading', { name: 'Verify your email', exact: true });
    this.verifiedBtn = page.getByRole('button', { name: "I've verified my email", exact: true });
    this.resendBtn = page.getByRole('button', { name: 'Resend verification email', exact: true });
  }
}
