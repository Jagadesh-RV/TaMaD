import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class DocumentsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly newDocumentBtn: Locator;
  readonly searchInput: Locator;
  readonly archivedBtn: Locator;
  readonly sortSelect: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page, '/documents');
    this.pageTitle = page.locator('h1', { hasText: 'Documents' });
    this.newDocumentBtn = page.getByRole('button', { name: 'New Document' });
    this.searchInput = page.getByPlaceholder('Search documents...');
    this.archivedBtn = page.getByRole('button', { name: /Archived/ });
    this.sortSelect = page.locator('select');
    this.emptyState = page.locator('.empty-state-title', { hasText: /No documents yet|No matching documents|No archived documents/ });
  }

  async clickNewDocument() {
    await this.newDocumentBtn.click();
  }

  async searchDocuments(query: string) {
    await this.searchInput.fill(query);
  }

  async toggleArchived() {
    await this.archivedBtn.click();
  }

  async setSortBy(sort: 'Last modified' | 'Created' | 'Title') {
    await this.sortSelect.selectOption({ label: sort });
  }

  getDocumentCard(title: string): Locator {
    return this.page.locator('.group', { has: this.page.locator('h3', { hasText: title }) });
  }

  getDocumentCount(): Promise<number> {
    return this.page.locator('.group').count();
  }
}
