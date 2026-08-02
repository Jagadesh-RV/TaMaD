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
}
