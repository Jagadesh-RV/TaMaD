import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ReportsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly exportBtn: Locator;
  readonly weeklyProductivityCard: Locator;
  readonly teamPerformanceCard: Locator;
  readonly completionTrendCard: Locator;
  readonly priorityDistributionCard: Locator;
  readonly statusOverviewCard: Locator;

  constructor(page: Page) {
    super(page, '/reports');
    this.pageTitle = page.locator('h1', { hasText: 'Reports' });
    this.exportBtn = page.getByRole('button', { name: 'Export', exact: true });
    this.weeklyProductivityCard = page.locator('.card', { has: page.locator('h3', { hasText: 'Weekly Productivity' }) });
    this.teamPerformanceCard = page.locator('.card', { has: page.locator('h3', { hasText: 'Team Performance' }) });
    this.completionTrendCard = page.locator('.card', { has: page.locator('h3', { hasText: 'Task Completion Trend' }) });
    this.priorityDistributionCard = page.locator('.card', { has: page.locator('h3', { hasText: 'Priority Distribution' }) });
    this.statusOverviewCard = page.locator('.card', { has: page.locator('h3', { hasText: 'Task Status Overview' }) });
  }

  getStatValue(label: string): Locator {
    return this.page
      .locator('.stat-card', { has: this.page.getByText(label, { exact: true }) })
      .locator('p.text-3xl');
  }

  dateRangeButton(range: string): Locator {
    return this.page.getByRole('button', { name: range, exact: true });
  }

  async selectDateRange(range: string) {
    await this.dateRangeButton(range).click();
  }
}
