import { test, expect } from '../../fixtures/customFixtures';

test.describe('Agile Board Page', () => {
  test.beforeEach(async ({ agilePage }) => {
    // Wait for auth to be restored and navigation to complete
    await agilePage.navigate();
  });

  test('should display active sprint or empty state', async ({ page, agilePage }) => {
    // We don't know if a sprint is active right now due to data seeding,
    // so we can assert that either the "No Active Sprint" message or the "Complete Sprint" button is visible
    const noSprintMsg = page.locator('h2', { hasText: 'No Active Sprint' });
    const activeSprintHeader = page.locator('h1', { hasText: 'Active Sprint' });
    
    // We just expect the page to load and not crash
    await expect(activeSprintHeader).toBeVisible();
    
    if (await noSprintMsg.isVisible()) {
      await expect(page.locator('text=Go to Sprint Planning to start a sprint.')).toBeVisible();
    } else {
      await expect(agilePage.getKanbanColumn('To Do')).toBeVisible();
      await expect(agilePage.getKanbanColumn('In Progress')).toBeVisible();
    }
  });
});
