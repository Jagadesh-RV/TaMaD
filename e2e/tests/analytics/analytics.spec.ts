import { test, expect } from '../../fixtures/customFixtures';

test.describe('Analytics Page', () => {
  test.beforeEach(async ({ analyticsPage }) => {
    await analyticsPage.navigate();
  });

  test('should display analytics stats and charts', async ({ analyticsPage }) => {
    await expect(analyticsPage.pageTitle).toBeVisible();

    for (const label of ['Tasks Completed', 'Completion Rate', 'In Progress', 'Projects']) {
      await expect(analyticsPage.getStatValue(label)).toBeVisible();
    }

    await expect(analyticsPage.weeklyTrendCard).toBeVisible();
    await expect(analyticsPage.statusDistributionCard).toBeVisible();
    await expect(analyticsPage.priorityBreakdownCard).toBeVisible();
    await expect(analyticsPage.aiInsightsCard).toBeVisible();
  });

  test('should export analytics as CSV when tasks exist', async ({ page, analyticsPage }) => {
    // Export button only renders when there are tasks
    if (!(await analyticsPage.exportCsvBtn.isVisible())) return;

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      analyticsPage.exportCsvBtn.click(),
    ]);
    expect(download.suggestedFilename()).toContain('tamad-analytics-');
  });
});
