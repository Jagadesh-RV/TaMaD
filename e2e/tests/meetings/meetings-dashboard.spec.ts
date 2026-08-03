import { test, expect } from '../../fixtures/customFixtures';
import { MockMeeting } from '../../pages/meetings/MeetingsDashboardPage';

const mockMeeting: MockMeeting = {
  _id: 'e2e-meeting-1',
  title: 'Sprint Planning',
  description: 'Plan the next sprint',
  teamId: 'e2e-team-id',
  hostId: 'e2e-user-id',
  roomName: 'sprint-planning',
  status: 'scheduled',
  startTime: '2026-08-10T09:00:00.000Z',
  duration: 30,
  meetingType: 'Sprint Planning',
};

const newMeeting: MockMeeting = {
  ...mockMeeting,
  _id: 'e2e-meeting-2',
  title: 'Daily Standup',
  roomName: 'daily-standup',
  startTime: '2026-08-11T09:30:00.000Z',
  meetingType: 'Daily Stand-up',
};

test.describe('Team Meetings Dashboard', () => {
  test('should load the meetings dashboard or show the loading state', async ({ meetingsDashboardPage }) => {
    await meetingsDashboardPage.navigate();
    if (await meetingsDashboardPage.loadingMessage.isVisible()) {
      await expect(meetingsDashboardPage.loadingMessage).toBeVisible();
    } else {
      await expect(meetingsDashboardPage.pageTitle).toBeVisible();
      await expect(meetingsDashboardPage.scheduleBtn).toBeVisible();
    }
  });

  test('should show the empty state when no meetings exist', async ({ meetingsDashboardPage }) => {
    await meetingsDashboardPage.navigate();
    if (await meetingsDashboardPage.emptyState.isVisible()) {
      await expect(meetingsDashboardPage.emptyState).toBeVisible();
    }
    await expect(meetingsDashboardPage.pageTitle).toBeVisible();
  });

  test('should open the schedule meeting modal with form fields', async ({ meetingsDashboardPage }) => {
    await meetingsDashboardPage.navigate();
    await meetingsDashboardPage.openScheduleModal();
    await expect(meetingsDashboardPage.scheduleTitleInput).toBeVisible();
    await expect(meetingsDashboardPage.meetingTypeSelect).toBeVisible();
    await expect(meetingsDashboardPage.dateInput).toBeVisible();
    await expect(meetingsDashboardPage.timeInput).toBeVisible();
    await expect(meetingsDashboardPage.descriptionInput).toBeVisible();
    await expect(meetingsDashboardPage.scheduleSubmitBtn).toBeVisible();
  });

  test('should allow cancelling the schedule meeting modal', async ({ meetingsDashboardPage }) => {
    await meetingsDashboardPage.navigate();
    await meetingsDashboardPage.openScheduleModal();
    await expect(meetingsDashboardPage.scheduleModal).toBeVisible();

    await meetingsDashboardPage.modalCancelBtn.click();
    await expect(meetingsDashboardPage.scheduleModal).toBeHidden();
  });

  test('should schedule a meeting through the modal', async ({ meetingsDashboardPage }) => {
    await meetingsDashboardPage.mockMeetingsApi({ meetings: [], createMeeting: newMeeting });
    await meetingsDashboardPage.navigate();

    await meetingsDashboardPage.openScheduleModal();
    await meetingsDashboardPage.scheduleTitleInput.fill('Daily Standup');
    await meetingsDashboardPage.dateInput.fill('2026-08-11');
    await meetingsDashboardPage.timeInput.fill('09:30');
    await meetingsDashboardPage.scheduleSubmitBtn.click();

    await expect(meetingsDashboardPage.scheduleModal).toBeHidden();
    const toast = meetingsDashboardPage.page.locator('.toast-message, [role="alert"]').first();
    await toast.waitFor({ state: 'visible', timeout: 5000 });
    await expect(toast).toContainText('Meeting scheduled successfully');
  });

  test('should show meeting card actions when meetings exist', async ({ meetingsDashboardPage }) => {
    await meetingsDashboardPage.mockMeetingsApi({ meetings: [mockMeeting] });
    await meetingsDashboardPage.navigate();

    const card = meetingsDashboardPage.getMeetingCard('Sprint Planning');
    await expect(card).toBeVisible();
    for (const action of ['Edit', 'Invite', 'Copy', 'Delete']) {
      await expect(card.getByRole('button', { name: action })).toBeVisible();
    }
  });

  test('should open the edit meeting modal prefilled and save changes', async ({ meetingsDashboardPage }) => {
    const updated = { ...mockMeeting, title: 'Sprint Planning (Updated)' };
    await meetingsDashboardPage.mockMeetingsApi({ meetings: [mockMeeting], updateMeeting: updated });
    await meetingsDashboardPage.navigate();

    await meetingsDashboardPage.openEditModal('Sprint Planning');
    await expect(meetingsDashboardPage.editTitleInput).toHaveValue('Sprint Planning');
    await expect(meetingsDashboardPage.editDescriptionInput).toHaveValue('Plan the next sprint');

    await meetingsDashboardPage.editTitleInput.fill('Sprint Planning (Updated)');
    await meetingsDashboardPage.editSaveBtn.click();

    await expect(meetingsDashboardPage.editModal).toBeHidden();
    const toast = meetingsDashboardPage.page.locator('.toast-message, [role="alert"]').first();
    await toast.waitFor({ state: 'visible', timeout: 5000 });
    await expect(toast).toContainText('Meeting updated');
  });

  test('should open the invite modal with a share link', async ({ meetingsDashboardPage }) => {
    await meetingsDashboardPage.mockMeetingsApi({ meetings: [mockMeeting] });
    await meetingsDashboardPage.navigate();

    await meetingsDashboardPage.openInviteModal('Sprint Planning');
    await expect(meetingsDashboardPage.inviteModal).toContainText('Invite to Sprint Planning');
    await expect(meetingsDashboardPage.shareLinkInput).toBeVisible();
    await expect(meetingsDashboardPage.copyLinkBtn).toBeVisible();
  });
});
