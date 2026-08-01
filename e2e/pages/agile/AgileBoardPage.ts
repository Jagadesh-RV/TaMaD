import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class AgileBoardPage extends BasePage {
  readonly completeSprintBtn: Locator;

  constructor(page: Page) {
    super(page, '/agile');
    this.completeSprintBtn = page.getByRole('button', { name: 'Complete Sprint' });
  }

  getKanbanColumn(columnName: 'To Do' | 'In Progress' | 'In Review' | 'Done'): Locator {
    return this.page.locator('div').filter({ has: this.page.locator('h3', { hasText: columnName }) });
  }

  getTaskInBoard(taskTitle: string): Locator {
    return this.page.locator('h4', { hasText: taskTitle });
  }
}
