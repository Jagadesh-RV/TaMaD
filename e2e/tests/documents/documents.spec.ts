import { test, expect } from '../../fixtures/customFixtures';

test.describe('Documents Page', () => {
  test.beforeEach(async ({ documentsPage }) => {
    await documentsPage.navigate();
  });

  test('should load the documents page with toolbar', async ({ documentsPage }) => {
    await expect(documentsPage.pageTitle).toBeVisible();
    await expect(documentsPage.newDocumentBtn).toBeVisible();
    await expect(documentsPage.searchInput).toBeVisible();
    await expect(documentsPage.sortSelect).toBeVisible();
    await expect(documentsPage.archivedBtn).toBeVisible();
  });

  test('should create a new document', async ({ page, documentsPage }) => {
    // The page auto-creates an "Untitled Document"; we count cards before and after
    await documentsPage.searchDocuments('');
    const beforeCount = await documentsPage.getDocumentCount();
    await documentsPage.clickNewDocument();
    await expect
      .poll(async () => documentsPage.getDocumentCount())
      .toBeGreaterThan(beforeCount);
  });

  test('should filter documents by search query', async ({ documentsPage }) => {
    await documentsPage.searchDocuments('NON_EXISTENT_DOCUMENT_12345');
    await expect(documentsPage.emptyState).toBeVisible();
    await expect(documentsPage.emptyState).toContainText('No matching documents');

    await documentsPage.searchDocuments('');
    await expect(documentsPage.emptyState).toBeHidden({ timeout: 10000 });
  });

  test('should toggle sort direction and archived view', async ({ documentsPage }) => {
    await documentsPage.setSortBy('Title');
    await expect(documentsPage.sortSelect).toHaveValue('title');

    await documentsPage.toggleArchived();
    // The Archived button becomes primary (active) when toggled
    await expect(documentsPage.archivedBtn).toHaveClass(/btn-primary/);
  });
});
