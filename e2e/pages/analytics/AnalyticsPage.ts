import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class AnalyticsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly exportCsvBtn: Locator;
  readonly weeklyTrendCard: Locator;
  readonly statusDistributionCard: Locator;
  readonly priorityBreakdownCard: Locator;
  readonly projectsCard: Locator;
  readonly aiInsightsCard: Locator;

  constructor(page: Page) {
    super(page, '/analytics');
    this.pageTitle = page.locator('h1', { hasText: 'Analytics' });
    this.exportCsvBtn = page.getByRole('button', { name: 'Export CSV' });
    this.weeklyTrendCard = page.locator('.card', { has: page.locator('h3', { hasText: 'Weekly Trend' }) });
    this.statusDistributionCard = page.locator('.card', { has: page.locator('h3', { hasText: 'Status Distribution' }) });
    this.priorityBreakdownCard = page.locator('.card', { has: page.locator('h3', { hasText: 'Priority Breakdown' }) });
    this.projectsCard = page.locator('.card', { has: page.locator('h3', { hasText: 'Projects' }) });
    this.aiInsightsCard = page.locator('.card', { has: page.locator('h3', { hasText: 'AI Insights' }) });
  }

  getStatValue(label: string): Locator {
    return this.page
      .locator('.stat-card', { has: this.page.getByText(label, { exact: true }) })
      .locator('div.text-3xl');
  }

  getLegendValue(card: Locator, label: string): Locator {
    return card
      .locator('div.flex', { has: this.page.getByText(label, { exact: true }) })
      .locator('span.ml-auto');
  }

  async mockAnalyticsApi(options: { tasks: Array<Record<string, unknown>>; projects: Array<Record<string, unknown>> }) {
    const { tasks, projects } = options;
    await this.page.route('**/api/tasks*', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ tasks }),
        });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    await this.page.route('**/api/projects*', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ projects }),
        });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
  }
}
