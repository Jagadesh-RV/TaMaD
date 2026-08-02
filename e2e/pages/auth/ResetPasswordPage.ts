import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ResetPasswordPage extends BasePage {
  readonly pageTitle: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly updatePasswordBtn: Locator;
  readonly backToLoginLink: Locator;

  constructor(page: Page) {
    super(page, '/reset-password');
    this.pageTitle = page.getByRole('heading', { name: 'Set a new password', exact: true });
    this.newPasswordInput = page.getByLabel('New Password');
    this.confirmPasswordInput = page.getByLabel('Confirm Password');
    this.updatePasswordBtn = page.getByRole('button', { name: 'Update password', exact: true });
    this.backToLoginLink = page.getByRole('link', { name: 'Back to login', exact: true });
  }
}
