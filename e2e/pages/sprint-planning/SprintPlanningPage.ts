import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class SprintPlanningPage extends BasePage {
  readonly pageTitle: Locator;
  readonly createSprintBtn: Locator;
  readonly createIssueBtn: Locator;
  readonly backlogHeading: Locator;
  readonly noSprintsMessage: Locator;
  readonly modalTitle: Locator;
  readonly taskTitleInput: Locator;
  readonly saveTaskBtn: Locator;
  readonly cancelTaskBtn: Locator;

  constructor(page: Page) {
    super(page, '/agile/planning');
    this.pageTitle = page.locator('h1', { hasText: 'Backlog & Planning' });
    this.createSprintBtn = page.getByRole('button', { name: 'Create Sprint', exact: true });
    this.createIssueBtn = page.getByRole('button', { name: /Create Issue/ });
    this.backlogHeading = page.getByRole('heading', { name: 'Backlog', exact: true });
    this.noSprintsMessage = page.getByRole('heading', { name: 'No Sprints Found', exact: true });
    this.modalTitle = page.locator('h3', { hasText: 'Create task' });
    this.taskTitleInput = page.getByPlaceholder('Finalize presentation slides');
    this.saveTaskBtn = page.getByRole('button', { name: 'Save task', exact: true });
    this.cancelTaskBtn = page.getByRole('button', { name: 'Cancel', exact: true });
  }

  async openCreateIssueModal() {
    await this.createIssueBtn.click();
  }

  getSprintCard(name: string): Locator {
    return this.page.locator('h2', { hasText: name });
  }

  getBacklogTask(title: string): Locator {
    return this.page.locator('p.text-sm.font-medium', { hasText: title }).first();
  }
}
