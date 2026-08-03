import { test, expect } from '../../fixtures/customFixtures';

test.describe('Calendar Page', () => {
  test.beforeEach(async ({ calendarPage }) => {
    await calendarPage.navigate();
  });

  test('should load the calendar with navigation controls', async ({ calendarPage }) => {
    await expect(calendarPage.pageTitle).toBeVisible();
    await expect(calendarPage.todayBtn).toBeVisible();
    await expect(calendarPage.prevMonthBtn).toBeVisible();
    await expect(calendarPage.nextMonthBtn).toBeVisible();
    await expect(calendarPage.monthLabel).toBeVisible();
  });

  test('should navigate between months', async ({ calendarPage }) => {
    const initialMonth = await calendarPage.getMonthLabel();
    expect(initialMonth).toBeTruthy();

    await calendarPage.goToNextMonth();
    const nextMonth = await calendarPage.getMonthLabel();
    expect(nextMonth).not.toBe(initialMonth);

    await calendarPage.goToPreviousMonth();
    await calendarPage.goToPreviousMonth();
    const prevMonth = await calendarPage.getMonthLabel();
    expect(prevMonth).not.toBe(initialMonth);

    await calendarPage.goToToday();
    await expect(calendarPage.monthLabel).toHaveText(initialMonth as string);
  });

  test('should display quick stats and upcoming sections', async ({ calendarPage }) => {
    await expect(calendarPage.quickStatsHeader).toBeVisible();
    await expect(calendarPage.upcomingHeader).toBeVisible();
    await expect(calendarPage.projectFilterHeader).toBeVisible();
  });

  test('should render the day grid', async ({ page, calendarPage }) => {
    // The grid has day name headers Sun through Sat
    await expect(page.locator('text=Sun').first()).toBeVisible();
    await expect(page.locator('text=Sat').first()).toBeVisible();
  });

  test('should render a task chip on its due date', async ({ page, calendarPage }) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const source = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2);
    const sourceKey = `${source.getFullYear()}-${pad(source.getMonth() + 1)}-${pad(source.getDate())}`;

    await calendarPage.mockCalendarApi({
      tasks: [
        {
          _id: 'task-cal-1',
          title: 'Calendar Chip Task',
          status: 'todo',
          priority: 'medium',
          dueDate: sourceKey,
          assignee: '',
        },
      ],
    });
    await calendarPage.navigate();

    await expect(page.getByText('Calendar Chip Task', { exact: true })).toBeVisible();
  });

  test('should drag a task to today to reschedule it', async ({ page, calendarPage }) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const source = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2);
    const sourceKey = `${source.getFullYear()}-${pad(source.getMonth() + 1)}-${pad(source.getDate())}`;

    await calendarPage.mockCalendarApi({
      tasks: [
        {
          _id: 'task-cal-2',
          title: 'Reschedulable Task',
          status: 'todo',
          priority: 'high',
          dueDate: sourceKey,
          assignee: '',
        },
      ],
    });
    await calendarPage.navigate();

    await calendarPage.dragTaskToToday('Reschedulable Task');

    const todayCell = calendarPage.getTodayCell();
    await expect(calendarPage.getTaskInCell('Reschedulable Task', todayCell)).toBeVisible();
    const toast = page.locator('.toast-message, [role="alert"]').first();
    await toast.waitFor({ state: 'visible', timeout: 5000 });
    await expect(toast).toContainText('Moved "Reschedulable Task"');
  });
});
