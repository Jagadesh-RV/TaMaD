import { test, expect } from '../../fixtures/customFixtures';
import { MockTask } from '../../pages/tasks/TasksPage';

const seededTasks: MockTask[] = [
  { _id: 't1', title: 'Seed Task A', status: 'todo', priority: 'medium' },
  { _id: 't2', title: 'Seed Task B', status: 'done', priority: 'low' },
  { _id: 't3', title: 'Seed Task C', status: 'in-progress', priority: 'high' },
  { _id: 't4', title: 'Urgent Task', status: 'todo', priority: 'urgent' },
];

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

  test('should drag a task from one kanban column to another', async ({ tasksPage }) => {
    await tasksPage.mockTasksApi({ tasks: [seededTasks[0]] });
    await tasksPage.navigate();

    await expect(tasksPage.getTaskInColumn('Seed Task A', 'To Do')).toBeVisible();

    await tasksPage.dragTaskToColumn('Seed Task A', 'In Progress');

    await expect(tasksPage.getTaskInColumn('Seed Task A', 'In Progress')).toBeVisible();
    await expect(tasksPage.getTaskInColumn('Seed Task A', 'To Do')).toBeHidden();
  });

  test('should filter tasks by status', async ({ tasksPage }) => {
    await tasksPage.mockTasksApi({ tasks: seededTasks });
    await tasksPage.navigate();

    await tasksPage.setStatusFilter('Done');
    await expect(tasksPage.getTaskInKanban('Seed Task B')).toBeVisible();
    await expect(tasksPage.getTaskInKanban('Seed Task A')).toBeHidden();
    await expect(tasksPage.getTaskInKanban('Seed Task C')).toBeHidden();

    await tasksPage.setStatusFilter('All Statuses');
    await expect(tasksPage.getTaskInKanban('Seed Task A')).toBeVisible();
    await expect(tasksPage.getTaskInKanban('Seed Task C')).toBeVisible();
  });

  test('should filter tasks by priority', async ({ tasksPage }) => {
    await tasksPage.mockTasksApi({ tasks: seededTasks });
    await tasksPage.navigate();

    await tasksPage.setPriorityFilter('High');
    await expect(tasksPage.getTaskInKanban('Seed Task C')).toBeVisible();
    await expect(tasksPage.getTaskInKanban('Urgent Task')).toBeHidden();
    await expect(tasksPage.getTaskInKanban('Seed Task B')).toBeHidden();

    await tasksPage.setPriorityFilter('All Priorities');
    await expect(tasksPage.getTaskInKanban('Urgent Task')).toBeVisible();
  });

  test('should clear filters with the clear button', async ({ page, tasksPage }) => {
    await tasksPage.mockTasksApi({ tasks: seededTasks });
    await tasksPage.navigate();

    await tasksPage.setStatusFilter('In Progress');
    await expect(tasksPage.getTaskInKanban('Seed Task C')).toBeVisible();
    await expect(tasksPage.getTaskInKanban('Seed Task A')).toBeHidden();

    await page.getByRole('button', { name: 'Clear' }).click();
    await expect(tasksPage.getTaskInKanban('Seed Task A')).toBeVisible();
    await expect(tasksPage.getTaskInKanban('Seed Task B')).toBeVisible();
  });

  test('should sort the list view by priority', async ({ tasksPage }) => {
    await tasksPage.mockTasksApi({ tasks: [seededTasks[3], seededTasks[0]] });
    await tasksPage.navigate();

    await tasksPage.switchView('List');
    await expect(tasksPage.getFirstListRow()).toContainText('Seed Task A');

    await tasksPage.page.locator('th', { hasText: 'Priority' }).click();
    await expect(tasksPage.getFirstListRow()).toContainText('Urgent Task');
  });
});
