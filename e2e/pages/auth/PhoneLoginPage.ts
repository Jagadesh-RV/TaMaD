import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class PhoneLoginPage extends BasePage {
  readonly pageTitle: Locator;
  readonly countryCodeSelect: Locator;
  readonly phoneNumberInput: Locator;
  readonly sendCodeBtn: Locator;
  readonly backToLoginLink: Locator;

  constructor(page: Page) {
    super(page, '/phone-login');
    this.pageTitle = page.getByRole('heading', { name: 'Sign in with your phone', exact: true });
    this.countryCodeSelect = page.getByLabel('Country code');
    this.phoneNumberInput = page.getByLabel('Phone Number');
    this.sendCodeBtn = page.getByRole('button', { name: 'Send verification code', exact: true });
    this.backToLoginLink = page.getByRole('link', { name: 'Back to login', exact: true });
  }
}
