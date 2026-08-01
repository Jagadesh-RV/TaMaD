import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class DashboardPage extends BasePage {
  readonly greetingHeader: Locator;
  readonly totalTasksCard: Locator;
  readonly completedCard: Locator;
  readonly inProgressCard: Locator;
  readonly overdueCard: Locator;
  readonly filterAllTasks: Locator;
  readonly filterHighPriority: Locator;
  
  constructor(page: Page) {
    super(page, '/dashboard');
    // Using role heading or generic text for locators
    this.greetingHeader = page.locator('.page-title');
    this.totalTasksCard = page.locator('.stat-card', { hasText: 'Total Tasks' });
    this.completedCard = page.locator('.stat-card', { hasText: 'Completed' });
    this.inProgressCard = page.locator('.stat-card', { hasText: 'In Progress' });
    this.overdueCard = page.locator('.stat-card', { hasText: 'Overdue' });

    this.filterAllTasks = page.getByRole('button', { name: 'All Tasks' });
    this.filterHighPriority = page.getByRole('button', { name: 'High Priority' });
  }

  async clickAllTasksFilter() {
    await this.filterAllTasks.click();
  }

  async clickHighPriorityFilter() {
    await this.filterHighPriority.click();
  }
}
