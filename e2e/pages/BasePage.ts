import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;
  readonly path: string;

  constructor(page: Page, path: string) {
    this.page = page;
    this.path = path;
  }

  async navigate() {
    await this.page.goto(this.path);
    await this.waitForLoad();
  }

  async waitForLoad() {
    // Wait for network to be idle, or wait for specific loading spinners to disappear
    await this.page.waitForLoadState('networkidle');
  }

  async getNotificationMessage() {
    // Modify based on the app's actual toast/notification implementation
    const toast = this.page.locator('.toast-message, [role="alert"]').first();
    await toast.waitFor({ state: 'visible', timeout: 5000 });
    return toast.textContent();
  }

  async clickButtonByText(text: string) {
    await this.page.getByRole('button', { name: text, exact: true }).click();
  }

  async fillInputByLabel(label: string, text: string) {
    await this.page.getByLabel(label, { exact: true }).fill(text);
  }
}
