import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ProjectsPage extends BasePage {
  readonly newProjectBtn: Locator;
  
  // Modal locators
  readonly projectNameInput: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly descriptionInput: Locator;
  readonly saveProjectBtn: Locator;

  constructor(page: Page) {
    super(page, '/projects');
    this.newProjectBtn = page.getByRole('button', { name: /New Project|Create Project/i }).first();
    
    // Modal
    this.projectNameInput = page.getByPlaceholder('e.g., Q3 Marketing Site Redesign');
    this.startDateInput = page.locator('input[type="date"]').nth(0);
    this.endDateInput = page.locator('input[type="date"]').nth(1);
    this.descriptionInput = page.getByPlaceholder('Add details about this project...');
    this.saveProjectBtn = page.getByRole('button', { name: 'Save Project' });
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

  getProjectCard(name: string): Locator {
    // Looks for a heading with the project name within the projects grid
    return this.page.locator('h3', { hasText: name });
  }
}
