import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ForgotPasswordPage extends BasePage {
  readonly pageTitle: Locator;
  readonly emailInput: Locator;
  readonly sendResetLinkBtn: Locator;
  readonly backToLoginLink: Locator;

  constructor(page: Page) {
    super(page, '/forgot-password');
    this.pageTitle = page.getByRole('heading', { name: 'Forgot your password?', exact: true });
    this.emailInput = page.getByLabel('Email');
    this.sendResetLinkBtn = page.getByRole('button', { name: 'Send reset link', exact: true });
    this.backToLoginLink = page.getByRole('link', { name: 'Back to login', exact: true });
  }
}
