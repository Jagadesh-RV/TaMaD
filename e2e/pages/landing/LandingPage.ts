import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class LandingPage extends BasePage {
  readonly heroHeading: Locator;
  readonly openAppLink: Locator;
  readonly contactNavBtn: Locator;
  readonly navbar: Locator;

  constructor(page: Page) {
    super(page, '/');
    this.heroHeading = page.getByRole('heading', { level: 1, name: /One workspace for/ });
    this.openAppLink = page.getByRole('link', { name: 'Open App' });
    this.contactNavBtn = page.getByRole('button', { name: 'Contact', exact: true }).first();
    this.navbar = page.getByRole('navigation', { name: 'Main' });
  }

  navItem(label: string): Locator {
    return this.navbar.getByRole('link', { name: label, exact: true });
  }
}
