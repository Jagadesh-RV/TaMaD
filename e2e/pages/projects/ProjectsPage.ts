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

  getProjectCardContainer(name: string): Locator {
    return this.page.locator('.card', { has: this.getProjectCard(name) });
  }

  getStatValue(label: string): Locator {
    return this.page
      .locator('.stat-card', { has: this.page.getByText(label, { exact: true }) })
      .locator('p.text-2xl');
  }

  async expandProject(name: string) {
    await this.getProjectCardContainer(name).locator('div.cursor-pointer').first().click();
  }

  async mockProjectsApi(options: { projects: Array<Record<string, unknown>>; tasks: Array<Record<string, unknown>> }) {
    const { projects, tasks } = options;
    await this.page.route('**/api/projects*', (route) => {
      const req = route.request();
      const method = req.method();

      if (method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ projects }),
        });
      }
      if (method === 'POST') {
        const body = (req.postDataJSON?.() || {}) as Record<string, string>;
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            _id: 'e2e-created-project',
            name: body.name || 'E2E Project',
            description: body.description || '',
            startDate: body.startDate || '',
            endDate: body.endDate || '',
            status: 'active',
            members: [],
          }),
        });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    await this.page.route('**/api/tasks*', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ tasks }),
        });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
  }
}
