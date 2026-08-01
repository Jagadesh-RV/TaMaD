import { test, expect } from '../../fixtures/customFixtures';

test.describe('Tasks Page', () => {
  test.beforeEach(async ({ tasksPage }) => {
    await tasksPage.navigate();
  });

  test('should create a task using Quick Add', async ({ tasksPage }) => {
    const taskName = `E2E Task ${Date.now()}`;
    await tasksPage.quickAddTask(taskName);

    // Verify task appears in the Kanban board
    await expect(tasksPage.getTaskInKanban(taskName)).toBeVisible();
  });

  test('should filter tasks by search query', async ({ page, tasksPage }) => {
    const uniqueTask = `Searchable Task ${Date.now()}`;
    await tasksPage.quickAddTask(uniqueTask);
    await expect(tasksPage.getTaskInKanban(uniqueTask)).toBeVisible();

    // Search for it
    await tasksPage.searchTasks(uniqueTask);
    await expect(tasksPage.getTaskInKanban(uniqueTask)).toBeVisible();

    // Search for something else
    await tasksPage.searchTasks('NON_EXISTENT_TASK_12345');
    await expect(tasksPage.getTaskInKanban(uniqueTask)).toBeHidden();
    
    // Clear search
    await tasksPage.searchTasks('');
    await expect(tasksPage.getTaskInKanban(uniqueTask)).toBeVisible();
  });

  test('should switch views', async ({ page, tasksPage }) => {
    const testTask = `View Task ${Date.now()}`;
    await tasksPage.quickAddTask(testTask);

    await tasksPage.switchView('List');
    // In List view, we expect to see a table with headers
    await expect(page.locator('th', { hasText: 'Task' })).toBeVisible();
    await expect(page.locator('table')).toContainText(testTask);

    await tasksPage.switchView('Calendar');
    // Calendar view displays month name, let's just check for S M T W T F S headers
    await expect(page.locator('text=M').first()).toBeVisible();
  });
});
