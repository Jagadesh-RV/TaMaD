import { test, expect } from '../../fixtures/customFixtures';

const TEMPLATE_STORAGE_KEY = 'tamad_task_templates';

test.describe('Templates Page', () => {
  test.beforeEach(async ({ page, templatesPage }) => {
    await templatesPage.navigate();

    // Templates live in localStorage; clear them so each test starts fresh
    await page.evaluate((key) => {
      localStorage.removeItem(key);
    }, TEMPLATE_STORAGE_KEY);
    await page.reload();
  });

  test('should show the empty state when no templates exist', async ({ templatesPage }) => {
    await expect(templatesPage.emptyState).toBeVisible();
    await expect(templatesPage.newTemplateBtn).toBeVisible();
  });

  test('should create a new template', async ({ templatesPage }) => {
    const templateName = `E2E Template ${Date.now()}`;
    await templatesPage.createTemplate(templateName, 'Fix login redirect bug', 'High', 'Reproduce steps');

    await expect(templatesPage.getTemplateCard(templateName)).toBeVisible();
    await expect(templatesPage.getTemplateCard(templateName)).toContainText('Fix login redirect bug');
  });

  test('should cancel template creation without saving', async ({ templatesPage }) => {
    await templatesPage.clickNewTemplate();
    await templatesPage.templateNameInput.fill('Cancelled Template');
    await templatesPage.cancelBtn.click();

    await expect(templatesPage.modalTitle).toBeHidden();
    await expect(templatesPage.getTemplateCard('Cancelled Template')).toHaveCount(0);
  });

  test('should create and then delete a template', async ({ page, templatesPage }) => {
    const templateName = `Deletable Template ${Date.now()}`;
    await templatesPage.createTemplate(templateName, 'Clean up code');

    const card = templatesPage.getTemplateCard(templateName);
    await expect(card).toBeVisible();

    // The delete button is the last ghost button with a trash icon
    await card.locator('button[title="Delete"]').click();
    await expect(templatesPage.getTemplateCard(templateName)).toHaveCount(0);
  });
});
