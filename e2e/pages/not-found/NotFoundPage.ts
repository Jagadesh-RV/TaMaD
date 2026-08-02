import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class NotFoundPage extends BasePage {
  readonly notFoundCode: Locator;
  readonly pageTitle: Locator;
  readonly goBackBtn: Locator;
  readonly dashboardLink: Locator;

  constructor(page: Page) {
    super(page, '/this-page-does-not-exist');
    this.notFoundCode = page.getByText('404', { exact: true });
    this.pageTitle = page.getByRole('heading', { name: 'Page Not Found', exact: true });
    this.goBackBtn = page.getByRole('button', { name: 'Go Back', exact: true });
    this.dashboardLink = page.getByRole('link', { name: 'Dashboard', exact: true });
  }
}
