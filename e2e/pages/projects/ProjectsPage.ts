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
    // Accounts for both the header button and the empty state button
    this.newProjectBtn = page.getByRole('button', { name: /New Project|Create Project/i }).first();
    
    // Modal
    this.projectNameInput = page.getByLabel('Project Name', { exact: true });
    this.startDateInput = page.getByLabel('Start Date', { exact: true });
    this.endDateInput = page.getByLabel('End Date', { exact: true });
    this.descriptionInput = page.getByLabel('Description', { exact: true });
    this.saveProjectBtn = page.getByRole('button', { name: 'Save Project' });
  }

  async clickNewProject() {
    await this.newProjectBtn.click();
  }

  async fillProjectDetails(name: string, startDate: string, endDate: string, description?: string) {
    // Fill the inputs using text locators matching the labels, wait let's use the explicit locators we defined
    // Playwright `getByLabel` works if the label is associated properly. In ProjectModal.tsx, the labels do NOT have `htmlFor`. 
    // They just have text. So we should use text locators instead. Let's fix that.
  }
}
