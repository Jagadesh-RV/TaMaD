import { test, expect } from '../../fixtures/customFixtures';
import { MockMeeting } from '../../pages/meetings/MeetingRoomPage';

const mockMeeting: MockMeeting = {
  _id: 'e2e-meeting-room-id',
  title: 'E2E Standup',
  description: 'Mocked meeting for e2e testing',
  teamId: 'e2e-team-id',
  hostId: 'e2e-host-id',
  roomName: 'e2e-room',
  status: 'scheduled',
  startTime: new Date().toISOString(),
  meetingType: 'Daily Stand-up',
};

test.describe('Meeting Room', () => {
  test('should show the connecting state while the meeting is being joined', async ({ meetingRoomPage }) => {
    await meetingRoomPage.holdJoinMeetingPending();
    await meetingRoomPage.gotoRoom('e2e-team-id', 'e2e-meeting-id');

    await expect(meetingRoomPage.connectingMessage).toBeVisible();
  });

  test('should render the meeting room header with title and type after joining', async ({ meetingRoomPage }) => {
    await meetingRoomPage.mockJoinMeeting(mockMeeting);
    await meetingRoomPage.gotoRoom('e2e-team-id', 'e2e-meeting-id');

    await expect(meetingRoomPage.meetingTitle).toHaveText('E2E Standup');
    await expect(meetingRoomPage.meetingTypeBadge).toHaveText('Daily Stand-up');
    await expect(meetingRoomPage.endMeetingBtn).toBeVisible();
  });

  test('should toggle the meeting notes sidebar', async ({ meetingRoomPage }) => {
    await meetingRoomPage.mockJoinMeeting(mockMeeting);
    await meetingRoomPage.gotoRoom('e2e-team-id', 'e2e-meeting-id');

    await expect(meetingRoomPage.showNotesBtn).toBeVisible();
    await meetingRoomPage.showNotesBtn.click();

    await expect(meetingRoomPage.hideNotesBtn).toBeVisible();
    await expect(meetingRoomPage.notesSidebar).toBeVisible();
    await expect(meetingRoomPage.notesTextarea).toBeVisible();

    await meetingRoomPage.hideNotesBtn.click();
    await expect(meetingRoomPage.showNotesBtn).toBeVisible();
    await expect(meetingRoomPage.notesSidebar).toBeHidden();
  });
});
