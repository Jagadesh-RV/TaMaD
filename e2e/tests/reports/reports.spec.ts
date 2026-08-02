import { test, expect } from '../../fixtures/customFixtures';

test.describe('Reports Page', () => {
  test.beforeEach(async ({ reportsPage }) => {
    await reportsPage.navigate();
  });

  test('should display reports summary and charts', async ({ reportsPage }) => {
    await expect(reportsPage.pageTitle).toBeVisible();

    for (const label of ['Total Tasks', 'Tasks Completed', 'Completion Rate', 'Productivity Score']) {
      await expect(reportsPage.getStatValue(label)).toBeVisible();
    }

    await expect(reportsPage.weeklyProductivityCard).toBeVisible();
    await expect(reportsPage.teamPerformanceCard).toBeVisible();
    await expect(reportsPage.completionTrendCard).toBeVisible();
    await expect(reportsPage.priorityDistributionCard).toBeVisible();
    await expect(reportsPage.statusOverviewCard).toBeVisible();
  });

  test('should switch between date ranges', async ({ reportsPage }) => {
    for (const range of ['This Week', 'This Month', 'Last 3 Months', 'Year']) {
      await reportsPage.selectDateRange(range);
      await expect(reportsPage.dateRangeButton(range)).toHaveClass(/btn-primary/);
    }
  });

  test('should trigger report export', async ({ reportsPage }) => {
    await expect(reportsPage.exportBtn).toBeVisible();
    await reportsPage.exportBtn.click();
    await expect(reportsPage.pageTitle).toBeVisible();
  });
});
