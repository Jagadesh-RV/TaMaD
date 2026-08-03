import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export interface MockSprint {
  _id: string;
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'active' | 'completed';
  workspaceId: string;
}

export interface MockAgileTask {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  workspaceId: string;
  sprintId: string;
  taskType?: string;
  storyPoints?: number;
  assignees?: Array<{ _id: string; name: string; email: string }>;
  watchers?: Array<{ _id: string; name: string }>;
  votes?: string[];
  order?: number;
}

export interface MockWorkspace {
  _id: string;
  name: string;
  type: string;
  teamId?: string;
  ownerId: string;
  members: Array<{ userId: { _id: string; name: string; email: string }; role: string }>;
  isActive: boolean;
  settings: { allowGuests: boolean; isPublic: boolean };
}

export class AgileBoardPage extends BasePage {
  readonly activeSprintHeader: Locator;
  readonly noActiveSprint: Locator;
  readonly completeSprintBtn: Locator;
  readonly sprintName: Locator;
  readonly detailModal: Locator;
  readonly detailTitleInput: Locator;
  readonly watchBtn: Locator;
  readonly voteBtn: Locator;

  constructor(page: Page) {
    super(page, '/agile/board');
    this.activeSprintHeader = page.locator('h1', { hasText: 'Active Sprint' });
    this.noActiveSprint = page.locator('h2', { hasText: 'No Active Sprint' });
    this.completeSprintBtn = page.getByRole('button', { name: 'Complete Sprint' });
    this.sprintName = page.locator('p.text-sm', { hasText: /Sprint/i });

    this.detailModal = page.locator('[role="dialog"]');
    this.detailTitleInput = this.detailModal.locator('input[placeholder="Issue title"]');
    this.watchBtn = this.detailModal.getByRole('button', { name: /Watch/i });
    this.voteBtn = this.detailModal.getByRole('button', { name: /Vote/i });
  }

  getKanbanColumn(columnName: 'To Do' | 'In Progress' | 'In Review' | 'Done'): Locator {
    return this.page.locator('div').filter({ has: this.page.locator('h3', { hasText: columnName }) });
  }

  getTaskInBoard(taskTitle: string): Locator {
    return this.page.locator('h4', { hasText: taskTitle });
  }

  getTaskCard(taskTitle: string): Locator {
    return this.getTaskInBoard(taskTitle).locator('xpath=ancestor::div[contains(@class, "cursor-pointer")]');
  }

  getTaskInColumn(taskTitle: string, columnName: 'To Do' | 'In Progress' | 'In Review' | 'Done'): Locator {
    return this.getKanbanColumn(columnName).locator('h4', { hasText: taskTitle });
  }

  getDetailStatusDropdown(): Locator {
    return this.detailModal
      .locator('label', { hasText: 'Status' })
      .locator('xpath=parent::div')
      .getByRole('button');
  }

  getDetailPriorityDropdown(): Locator {
    return this.detailModal
      .locator('label', { hasText: 'Priority' })
      .locator('xpath=parent::div')
      .getByRole('button');
  }

  async openTaskDetail(taskTitle: string) {
    await this.getTaskCard(taskTitle).click();
    await this.detailModal.waitFor({ state: 'visible' });
  }

  async closeTaskDetail() {
    await this.detailModal.getByRole('button').filter({ has: this.page.locator('svg') }).last().click();
    await this.detailModal.waitFor({ state: 'hidden' });
  }

  async selectFromDetailDropdown(dropdown: Locator, optionLabel: string) {
    await dropdown.click();
    await this.page.getByRole('option', { name: optionLabel }).click();
  }

  async mockAgileApi(options: {
    workspace: MockWorkspace;
    sprints: MockSprint[];
    tasks: MockAgileTask[];
  }) {
    const { workspace, sprints, tasks } = options;

    await this.page.route('**/api/workspaces', (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([workspace]),
      });
    });

    await this.page.route('**/api/agile/sprints*', (route) => {
      const req = route.request();
      const method = req.method();
      const path = new URL(req.url()).pathname;

      if (method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(sprints),
        });
      }
      if (method === 'POST' && path.endsWith('/complete')) {
        const id = path.split('/').filter(Boolean)[path.split('/').filter(Boolean).length - 2];
        const sprint = sprints.find(s => s._id === id) || sprints[0];
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...sprint, status: 'completed' }),
        });
      }
      if (method === 'POST') {
        const body = (req.postDataJSON?.() || {}) as Partial<MockSprint>;
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ _id: 'e2e-created-sprint', ...body, status: 'planned' }),
        });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await this.page.route('**/api/tasks*', (route) => {
      const req = route.request();
      const method = req.method();
      const path = new URL(req.url()).pathname;
      const segments = path.split('/').filter(Boolean);
      const id = segments[2] || '';

      if (method === 'GET' && path.endsWith('/comments')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      }
      if (method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ tasks }),
        });
      }
      if (method === 'PUT') {
        const body = (req.postDataJSON?.() || {}) as Record<string, unknown>;
        const task = tasks.find(t => t._id === id) || tasks[0];
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...task, ...body }),
        });
      }
      if (method === 'POST' && path.endsWith('/watch')) {
        const task = tasks.find(t => t._id === id) || tasks[0];
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...task, watchers: [workspace.members[0].userId] }),
        });
      }
      if (method === 'POST' && path.endsWith('/vote')) {
        const task = tasks.find(t => t._id === id) || tasks[0];
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...task, votes: [workspace.members[0].userId._id] }),
        });
      }
      if (method === 'POST' && path.endsWith('/comments')) {
        const body = (req.postDataJSON?.() || {}) as { content?: string };
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            _id: 'e2e-comment-1',
            content: body.content || '',
            userId: workspace.members[0].userId,
            createdAt: new Date().toISOString(),
          }),
        });
      }
      if (method === 'POST') {
        const body = (req.postDataJSON?.() || {}) as Partial<MockAgileTask>;
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ _id: 'e2e-created-task', ...body, status: 'todo' }),
        });
      }
      if (method === 'DELETE') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
  }
}
