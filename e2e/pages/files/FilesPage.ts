import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class FilesPage extends BasePage {
  readonly pageTitle: Locator;
  readonly totalFilesStat: Locator;
  readonly storageUsedStat: Locator;
  readonly searchInput: Locator;
  readonly sortByNameBtn: Locator;
  readonly sortBySizeBtn: Locator;
  readonly archivedBtn: Locator;
  readonly gridViewBtn: Locator;
  readonly listViewBtn: Locator;
  readonly uploadBtn: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page, '/files');
    this.pageTitle = page.locator('h1', { hasText: 'Files' });
    this.totalFilesStat = page.locator('.card', { hasText: 'Total Files' });
    this.storageUsedStat = page.locator('.card', { hasText: 'Storage Used' });
    this.searchInput = page.getByPlaceholder('Search files...');
    this.sortByNameBtn = page.getByRole('button', { name: /Name/ });
    this.sortBySizeBtn = page.getByRole('button', { name: /Size/ });
    this.archivedBtn = page.getByRole('button', { name: /Archived/ });
    this.gridViewBtn = page.locator('button').filter({ has: page.locator('svg.lucide-grid-3x3') }).first();
    this.listViewBtn = page.locator('button').filter({ has: page.locator('svg.lucide-list') }).first();
    this.uploadBtn = page.getByText('Upload', { exact: true });
    this.emptyState = page.locator('h3', { hasText: /No files yet|No files found/ });
  }

  async searchFiles(query: string) {
    await this.searchInput.fill(query);
  }

  async sortByName() {
    await this.sortByNameBtn.click();
  }

  async sortBySize() {
    await this.sortBySizeBtn.click();
  }

  async toggleArchived() {
    await this.archivedBtn.click();
  }

  async switchToGridView() {
    await this.gridViewBtn.click();
  }

  async switchToListView() {
    await this.listViewBtn.click();
  }

  getFileCard(name: string): Locator {
    return this.page.locator('.card.group', { hasText: name });
  }

  getFileRow(name: string): Locator {
    return this.page.locator('div[class*="flex items-center border-b"]', { hasText: name });
  }
}
