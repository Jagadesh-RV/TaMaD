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
});
