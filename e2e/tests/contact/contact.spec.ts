import { test, expect } from '../../fixtures/customFixtures';

test.describe('Contact Page', () => {
  test.beforeEach(async ({ contactPage }) => {
    await contactPage.navigate();
  });

  test('should display contact details and the form', async ({ contactPage, page }) => {
    await expect(contactPage.pageTitle).toBeVisible();
    await expect(page.getByText('Get in touch')).toBeVisible();
    await expect(page.getByText('support@tamad.app')).toBeVisible();
    await expect(contactPage.fullNameInput).toBeVisible();
    await expect(contactPage.emailInput).toBeVisible();
    await expect(contactPage.subjectInput).toBeVisible();
    await expect(contactPage.messageInput).toBeVisible();
  });

  test('should validate required fields', async ({ contactPage, page }) => {
    await contactPage.submitEmpty();

    await expect(page.getByText('Enter your name')).toBeVisible();
    await expect(page.getByText('Enter a valid email address')).toBeVisible();
    await expect(page.getByText('Enter your phone number')).toBeVisible();
    await expect(page.getByText('Enter a subject')).toBeVisible();
    await expect(page.getByText('Message must be at least 10 characters')).toBeVisible();
  });
});
