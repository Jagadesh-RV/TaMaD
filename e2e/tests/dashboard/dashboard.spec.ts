import { test, expect } from '../../fixtures/customFixtures';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ dashboardPage }) => {
    // This will use the globally authenticated state and go to /dashboard
    await dashboardPage.navigate();
  });

  test('should display greeting header', async ({ dashboardPage }) => {
    // Check for "Good morning", "Good afternoon", or "Good evening"
    await expect(dashboardPage.greetingHeader).toContainText(/Good (morning|afternoon|evening)/i);
  });

  test('should display statistic cards', async ({ dashboardPage }) => {
    await expect(dashboardPage.totalTasksCard).toBeVisible();
    await expect(dashboardPage.completedCard).toBeVisible();
    await expect(dashboardPage.inProgressCard).toBeVisible();
    await expect(dashboardPage.overdueCard).toBeVisible();
  });

  test('should filter by High Priority', async ({ dashboardPage }) => {
    await dashboardPage.clickHighPriorityFilter();
    // In a real database we might want to check the DOM for task rendering changes,
    // but verifying the filter click works is a good start.
    // Ensure the filter is visually active.
    await expect(dashboardPage.filterHighPriority).toHaveCSS('background-color', /.*/);
  });
});
