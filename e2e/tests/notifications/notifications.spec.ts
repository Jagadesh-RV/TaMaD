import { test, expect } from '../../fixtures/customFixtures';

test.describe('Notifications Page', () => {
  test.beforeEach(async ({ notificationsPage }) => {
    await notificationsPage.navigate();
  });

  test('should load the notification center with filter tabs', async ({ notificationsPage }) => {
    await expect(notificationsPage.pageTitle).toBeVisible();
    await expect(notificationsPage.allTab).toBeVisible();
    await expect(notificationsPage.unreadTab).toBeVisible();
    await expect(notificationsPage.mentionsTab).toBeVisible();
    await expect(notificationsPage.assignmentsTab).toBeVisible();
    await expect(notificationsPage.refreshBtn).toBeVisible();
  });

  test('should show empty state or a list of notifications', async ({ notificationsPage }) => {
    if (await notificationsPage.emptyState.isVisible()) {
      await expect(notificationsPage.emptyState).toBeVisible();
      await expect(notificationsPage.emptyState).toContainText('No notifications');
    } else {
      await expect(notificationsPage.allTab).toBeVisible();
    }
  });

  test('should switch between filter tabs', async ({ page, notificationsPage }) => {
    await notificationsPage.switchToTab('unread');
    await expect(notificationsPage.unreadTab).toHaveClass(/btn-primary/);

    await notificationsPage.switchToTab('mentions');
    await expect(notificationsPage.mentionsTab).toHaveClass(/btn-primary/);

    await notificationsPage.switchToTab('assignments');
    await expect(notificationsPage.assignmentsTab).toHaveClass(/btn-primary/);

    await notificationsPage.switchToTab('all');
    await expect(notificationsPage.allTab).toHaveClass(/btn-primary/);
  });

  test('should refresh notifications without errors', async ({ notificationsPage }) => {
    await notificationsPage.refresh();
    await expect(notificationsPage.pageTitle).toBeVisible();
  });
});
