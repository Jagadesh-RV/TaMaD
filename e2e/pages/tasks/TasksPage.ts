import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class TasksPage extends BasePage {
  readonly quickAddInput: Locator;
  readonly quickAddButton: Locator;
  readonly searchInput: Locator;
  readonly statusFilter: Locator;
  readonly priorityFilter: Locator;
  readonly kanbanViewBtn: Locator;
  readonly listViewBtn: Locator;
  readonly calendarViewBtn: Locator;

  constructor(page: Page) {
    super(page, '/tasks');
    this.quickAddInput = page.getByPlaceholder('Quick add a task...');
    this.quickAddButton = page.getByRole('button', { name: 'Add' });
    this.searchInput = page.getByPlaceholder('Search tasks...');
    
    // Status and priority filters are both selects. We locate them by finding their specific options or order
    this.statusFilter = page.locator('select').first();
    this.priorityFilter = page.locator('select').nth(1);

    this.kanbanViewBtn = page.getByRole('button', { name: 'Kanban' });
    this.listViewBtn = page.getByRole('button', { name: 'List' });
    this.calendarViewBtn = page.getByRole('button', { name: 'Calendar' });
  }

  async quickAddTask(title: string) {
    await this.quickAddInput.fill(title);
    await this.quickAddInput.press('Enter');
  }

  async searchTasks(query: string) {
    await this.searchInput.fill(query);
  }

  async setStatusFilter(status: string) {
    await this.statusFilter.selectOption({ label: status });
  }

  async setPriorityFilter(priority: string) {
    await this.priorityFilter.selectOption({ label: priority });
  }

  async switchView(view: 'Kanban' | 'List' | 'Calendar') {
    if (view === 'Kanban') await this.kanbanViewBtn.click();
    else if (view === 'List') await this.listViewBtn.click();
    else await this.calendarViewBtn.click();
  }

  getTaskInKanban(title: string): Locator {
    // Looks for a heading with the task title within the kanban board
    return this.page.locator('h4', { hasText: title });
  }
}
