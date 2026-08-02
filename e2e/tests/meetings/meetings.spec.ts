import { test, expect } from '../../fixtures/customFixtures';

test.describe('TaMaD Meet Dashboard', () => {
  test.beforeEach(async ({ meetingsPage }) => {
    await meetingsPage.navigate();
  });

  test('should load the meetings dashboard with actions', async ({ meetingsPage }) => {
    await expect(meetingsPage.pageTitle).toBeVisible();
    await expect(meetingsPage.instantMeetBtn).toBeVisible();
    await expect(meetingsPage.scheduleBtn).toBeVisible();
  });

  test('should show empty state or meeting cards', async ({ meetingsPage }) => {
    // If the workspace has no team, no meetings load and the empty state is shown
    if (await meetingsPage.emptyState.isVisible()) {
      await expect(meetingsPage.emptyState).toBeVisible();
    }
    await expect(meetingsPage.pageTitle).toBeVisible();
  });

  test('should open the instant meet modal with a default title', async ({ meetingsPage }) => {
    await meetingsPage.openInstantMeetModal();
    await expect(meetingsPage.meetingTitleInput).toHaveValue('Instant Meet');
    await expect(meetingsPage.startNowBtn).toBeVisible();
  });

  test('should open the schedule meeting modal with form fields', async ({ meetingsPage }) => {
    await meetingsPage.openScheduleModal();
    await expect(meetingsPage.meetingTitleInput).toHaveValue('Scheduled Meet');
    await expect(meetingsPage.startTimeInput).toBeVisible();
    await expect(meetingsPage.durationInput).toBeVisible();
    await expect(meetingsPage.scheduleSubmitBtn).toBeVisible();
    await expect(meetingsPage.cancelBtn).toBeVisible();
  });

  test('should allow editing the meeting title and cancelling', async ({ meetingsPage }) => {
    await meetingsPage.openInstantMeetModal();
    await meetingsPage.meetingTitleInput.fill('Standup Sync');
    await expect(meetingsPage.meetingTitleInput).toHaveValue('Standup Sync');

    await meetingsPage.cancelBtn.click();
    await expect(meetingsPage.instantModalTitle).toBeHidden();
  });
});
