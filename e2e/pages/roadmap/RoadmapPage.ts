import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class RoadmapPage extends BasePage {
  readonly pageTitle: Locator;
  readonly newProjectBtn: Locator;
  readonly projectsColumnHeader: Locator;
  readonly timelineDayCells: Locator;
  readonly modalHeading: Locator;
  readonly projectNameInput: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly descriptionInput: Locator;
  readonly saveProjectBtn: Locator;
  readonly cancelModalBtn: Locator;
  readonly emptyStateMessage: Locator;

  constructor(page: Page) {
    super(page, '/roadmap');
    this.pageTitle = page.locator('h1', { hasText: 'Roadmap' });
    this.newProjectBtn = page.getByRole('button', { name: 'New Project', exact: true });
    this.projectsColumnHeader = page.getByText('Projects', { exact: true });
    this.timelineDayCells = page.locator('.flex-1.border-r.border-gray-200\\/50');
    this.modalHeading = page.getByRole('heading', { name: 'Create project' });
    this.projectNameInput = page.getByPlaceholder('e.g., Q3 Marketing Site Redesign');
    this.startDateInput = page.locator('input[type="date"]').nth(0);
    this.endDateInput = page.locator('input[type="date"]').nth(1);
    this.descriptionInput = page.getByPlaceholder('Add details about this project...');
    this.saveProjectBtn = page.getByRole('button', { name: 'Save Project', exact: true });
    this.cancelModalBtn = page.getByRole('button', { name: 'Cancel', exact: true });
    this.emptyStateMessage = page.getByText('No projects yet. Create one to get started!');
  }

  async clickNewProject() {
    await this.newProjectBtn.click();
  }

  async createProject(name: string, startDate: string, endDate: string, description?: string) {
    await this.clickNewProject();
    await this.projectNameInput.waitFor({ state: 'visible' });
    await this.projectNameInput.fill(name);
    await this.startDateInput.fill(startDate);
    await this.endDateInput.fill(endDate);
    if (description) {
      await this.descriptionInput.fill(description);
    }
    await this.saveProjectBtn.click();
  }

  getProjectRow(name: string): Locator {
    return this.page.locator('h3', { hasText: name });
  }
}
