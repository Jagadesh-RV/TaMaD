import { test, expect } from '../../fixtures/customFixtures';

const seededTasks = [
  { _id: 'a1', title: 'Completed high', status: 'done', priority: 'high', projectId: 'p1' },
  { _id: 'a2', title: 'Completed medium', status: 'done', priority: 'medium', projectId: 'p1' },
  { _id: 'a3', title: 'Urgent todo', status: 'todo', priority: 'urgent', projectId: 'p2' },
  { _id: 'a4', title: 'In progress low', status: 'in-progress', priority: 'low', projectId: 'p2' },
  { _id: 'a5', title: 'Review medium', status: 'review', priority: 'medium', projectId: 'p3' },
];

const seededProjects = [
  { _id: 'p1', name: 'Alpha Analytics' },
  { _id: 'p2', name: 'Beta Analytics' },
  { _id: 'p3', name: 'Gamma Analytics' },
];

test.describe('Analytics Page', () => {
  test('should display stats computed from mocked tasks', async ({ analyticsPage }) => {
    await analyticsPage.mockAnalyticsApi({ tasks: seededTasks, projects: seededProjects });
    await analyticsPage.navigate();

    await expect(analyticsPage.pageTitle).toBeVisible();
    await expect(analyticsPage.getStatValue('Tasks Completed')).toHaveText('2');
    await expect(analyticsPage.getStatValue('Completion Rate')).toHaveText('40%');
    await expect(analyticsPage.getStatValue('In Progress')).toHaveText('1');
    await expect(analyticsPage.getStatValue('Projects')).toHaveText('3');
  });

  test('should render status and priority distribution legends', async ({ analyticsPage }) => {
    await analyticsPage.mockAnalyticsApi({ tasks: seededTasks, projects: seededProjects });
    await analyticsPage.navigate();

    await expect(analyticsPage.statusDistributionCard).toBeVisible();
    for (const status of ['To Do', 'In Progress', 'Review', 'Done']) {
      await expect(analyticsPage.getLegendValue(analyticsPage.statusDistributionCard, status)).toBeVisible();
    }
    await expect(analyticsPage.getLegendValue(analyticsPage.statusDistributionCard, 'Done')).toHaveText('2');

    await expect(analyticsPage.priorityBreakdownCard).toBeVisible();
    await expect(analyticsPage.getLegendValue(analyticsPage.priorityBreakdownCard, 'Urgent')).toHaveText('1');
    await expect(analyticsPage.getLegendValue(analyticsPage.priorityBreakdownCard, 'Medium')).toHaveText('2');
  });

  test('should render AI insights that reflect the mocked tasks', async ({ analyticsPage }) => {
    await analyticsPage.mockAnalyticsApi({ tasks: seededTasks, projects: seededProjects });
    await analyticsPage.navigate();

    await expect(analyticsPage.aiInsightsCard).toContainText('Priority Alert');
    await expect(analyticsPage.aiInsightsCard).toContainText('1 urgent tasks need immediate attention.');
    await expect(analyticsPage.aiInsightsCard).toContainText('Great Progress');
  });

  test('should export analytics as CSV when tasks exist', async ({ page, analyticsPage }) => {
    await analyticsPage.mockAnalyticsApi({ tasks: seededTasks, projects: seededProjects });
    await analyticsPage.navigate();

    await expect(analyticsPage.exportCsvBtn).toBeVisible();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      analyticsPage.exportCsvBtn.click(),
    ]);
    expect(download.suggestedFilename()).toContain('tamad-analytics-');
  });
});
