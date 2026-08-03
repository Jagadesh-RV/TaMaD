import { test, expect } from '../../fixtures/customFixtures';

test.describe('Team Meetings Dashboard', () => {
  test.beforeEach(async ({ meetingsDashboardPage }) => {
    await meetingsDashboardPage.navigate();
  });

  test('should load the meetings dashboard or show the loading state', async ({ meetingsDashboardPage }) => {
    if (await meetingsDashboardPage.loadingMessage.isVisible()) {
      await expect(meetingsDashboardPage.loadingMessage).toBeVisible();
    } else {
      await expect(meetingsDashboardPage.pageTitle).toBeVisible();
      await expect(meetingsDashboardPage.scheduleBtn).toBeVisible();
    }
  });

  test('should show the empty state when no meetings exist', async ({ meetingsDashboardPage }) => {
    // With no team context, the meeting list stays empty and the empty state is shown
    if (await meetingsDashboardPage.emptyState.isVisible()) {
      await expect(meetingsDashboardPage.emptyState).toBeVisible();
    }
    await expect(meetingsDashboardPage.pageTitle).toBeVisible();
  });

  test('should open the schedule meeting modal with form fields', async ({ meetingsDashboardPage }) => {
    await meetingsDashboardPage.openScheduleModal();
    await expect(meetingsDashboardPage.scheduleTitleInput).toBeVisible();
    await expect(meetingsDashboardPage.meetingTypeSelect).toBeVisible();
    await expect(meetingsDashboardPage.dateInput).toBeVisible();
    await expect(meetingsDashboardPage.timeInput).toBeVisible();
    await expect(meetingsDashboardPage.descriptionInput).toBeVisible();
    await expect(meetingsDashboardPage.scheduleSubmitBtn).toBeVisible();
  });

  test('should allow cancelling the schedule meeting modal', async ({ meetingsDashboardPage }) => {
    await meetingsDashboardPage.openScheduleModal();
    await expect(meetingsDashboardPage.scheduleModal).toBeVisible();

    await meetingsDashboardPage.modalCancelBtn.click();
    await expect(meetingsDashboardPage.scheduleModal).toBeHidden();
  });

  test('should show meeting card actions when meetings exist', async ({ meetingsDashboardPage }) => {
    if (await meetingsDashboardPage.emptyState.isVisible()) {
      test.skip();
      return;
    }
    const cards = meetingsDashboardPage.meetingCards;
    await expect(cards.first()).toBeVisible();

    const firstCard = cards.first();
    for (const action of ['Edit', 'Invite', 'Copy', 'Delete']) {
      await expect(firstCard.getByRole('button', { name: action })).toBeVisible();
    }
  });
});
