import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class TemplatesPage extends BasePage {
  readonly pageTitle: Locator;
  readonly newTemplateBtn: Locator;
  readonly emptyState: Locator;

  // Modal locators
  readonly modalTitle: Locator;
  readonly templateNameInput: Locator;
  readonly taskTitleInput: Locator;
  readonly descriptionInput: Locator;
  readonly lowPriorityBtn: Locator;
  readonly mediumPriorityBtn: Locator;
  readonly highPriorityBtn: Locator;
  readonly urgentPriorityBtn: Locator;
  readonly cancelBtn: Locator;
  readonly createBtn: Locator;

  constructor(page: Page) {
    super(page, '/templates');
    this.pageTitle = page.locator('h1', { hasText: 'Task Templates' });
    this.newTemplateBtn = page.getByRole('button', { name: 'New Template' });
    this.emptyState = page.locator('h3', { hasText: 'No templates yet' });

    // Modal
    this.modalTitle = page.locator('h3', { hasText: /New Template|Edit Template/ });
    this.templateNameInput = page.getByPlaceholder('e.g. Bug Report');
    this.taskTitleInput = page.getByPlaceholder('e.g. Fix login redirect bug');
    this.descriptionInput = page.getByPlaceholder('Steps, context, etc.');
    this.lowPriorityBtn = page.getByRole('button', { name: 'Low' });
    this.mediumPriorityBtn = page.getByRole('button', { name: 'Medium' });
    this.highPriorityBtn = page.getByRole('button', { name: 'High' });
    this.urgentPriorityBtn = page.getByRole('button', { name: 'Urgent' });
    this.cancelBtn = page.getByRole('button', { name: 'Cancel' });
    this.createBtn = page.getByRole('button', { name: 'Create', exact: true });
  }

  async clickNewTemplate() {
    await this.newTemplateBtn.click();
    await this.modalTitle.waitFor({ state: 'visible' });
  }

  async createTemplate(name: string, title: string, priority: 'Low' | 'Medium' | 'High' | 'Urgent' = 'Medium', description?: string) {
    await this.clickNewTemplate();
    await this.templateNameInput.fill(name);
    await this.taskTitleInput.fill(title);
    if (description) {
      await this.descriptionInput.fill(description);
    }
    if (priority === 'Low') await this.lowPriorityBtn.click();
    else if (priority === 'High') await this.highPriorityBtn.click();
    else if (priority === 'Urgent') await this.urgentPriorityBtn.click();
    await this.createBtn.click();
  }

  getTemplateCard(name: string): Locator {
    return this.page.locator('.card', { has: this.page.locator('h3', { hasText: name }) });
  }
}
