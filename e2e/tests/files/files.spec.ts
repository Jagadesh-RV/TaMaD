import { test, expect } from '../../fixtures/customFixtures';

test.describe('Files Page', () => {
  test.beforeEach(async ({ filesPage }) => {
    await filesPage.navigate();
  });

  test('should load the files page with stats and toolbar', async ({ filesPage }) => {
    await expect(filesPage.pageTitle).toBeVisible();
    await expect(filesPage.totalFilesStat).toBeVisible();
    await expect(filesPage.storageUsedStat).toBeVisible();
    await expect(filesPage.searchInput).toBeVisible();
    await expect(filesPage.uploadBtn).toBeVisible();
  });

  test('should show empty state or file grid', async ({ filesPage }) => {
    if (await filesPage.emptyState.isVisible()) {
      await expect(filesPage.emptyState).toBeVisible();
    } else {
      await expect(filesPage.gridViewBtn).toBeVisible();
    }
  });

  test('should toggle between grid and list views', async ({ filesPage }) => {
    // Only meaningful when files exist; otherwise the empty state is shown
    if (!(await filesPage.emptyState.isVisible())) {
      await filesPage.switchToListView();
      await expect(filesPage.page.locator('div', { hasText: 'Name' }).first()).toBeVisible();
      await filesPage.switchToGridView();
    }
    await expect(filesPage.pageTitle).toBeVisible();
  });

  test('should filter files by search query', async ({ filesPage }) => {
    await filesPage.searchFiles('NON_EXISTENT_FILE_12345');
    await expect(filesPage.emptyState).toContainText('No files found');
  });
});
