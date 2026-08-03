import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export interface MockTask {
  _id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description?: string;
  assignee?: string;
  tags?: string[];
  dueDate?: string;
  order?: number;
}

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

  getColumnBody(columnLabel: string): Locator {
    return this.page
      .locator('h3', { hasText: columnLabel })
      .locator('xpath=ancestor::div[contains(@class, "min-w-[280px]")]')
      .locator('div.rounded-2xl');
  }

  getTaskInColumn(title: string, columnLabel: string): Locator {
    return this.getColumnBody(columnLabel).locator('h4', { hasText: title });
  }

  getTaskCard(title: string): Locator {
    return this.page
      .locator('h4', { hasText: title })
      .locator('xpath=ancestor::div[contains(@class, "cursor-grab")]');
  }

  getFirstListRow(): Locator {
    return this.page.locator('tbody tr').first();
  }

  async dragTaskToColumn(title: string, columnLabel: string) {
    const card = this.getTaskCard(title);
    const target = this.getColumnBody(columnLabel);
    const cardBox = await card.boundingBox();
    const targetBox = await target.boundingBox();
    if (!cardBox || !targetBox) throw new Error(`Could not locate task '${title}' or column '${columnLabel}'`);

    const startX = cardBox.x + cardBox.width / 2;
    const startY = cardBox.y + cardBox.height / 2;
    const endX = targetBox.x + targetBox.width / 2;
    const endY = targetBox.y + targetBox.height / 2;

    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(startX + 10, startY + 10, { steps: 5 });
    await this.page.mouse.move(endX, endY, { steps: 20 });
    await this.page.mouse.up();
  }

  async mockTasksApi(options: { tasks: MockTask[] }) {
    const { tasks } = options;
    await this.page.route('**/api/tasks*', (route) => {
      const req = route.request();
      const method = req.method();
      const path = new URL(req.url()).pathname;

      if (method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ tasks }),
        });
      }
      if (method === 'POST') {
        const body = (req.postDataJSON?.() || {}) as Partial<MockTask>;
        const created: MockTask = {
          _id: 'e2e-created-task',
          title: body.title || 'E2E Task',
          status: body.status || 'todo',
          priority: body.priority || 'medium',
        };
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(created),
        });
      }
      if (method === 'PUT') {
        const id = path.split('/').pop() || '';
        const body = (req.postDataJSON?.() || {}) as Record<string, unknown>;
        const existing = tasks.find(t => t._id === id);
        const updated = { ...existing, ...body } as MockTask;
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(updated),
        });
      }
      if (method === 'DELETE') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
  }
}
