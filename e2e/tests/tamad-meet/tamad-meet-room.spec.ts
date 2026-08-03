import { test, expect } from '../../fixtures/customFixtures';
import { MockTamadMeetRoom } from '../../pages/tamad-meet/TamadMeetRoomPage';

const mockRoom: MockTamadMeetRoom = {
  room: {
    meetingId: 'e2e-meeting-id',
    roomId: 'e2e-room-id',
    isLocked: false,
    waitingRoomEnabled: false,
  },
  participant: {
    _id: 'e2e-participant-id',
    userId: 'e2e-user-id',
    role: 'host',
    status: 'active',
    isMuted: false,
    isVideoOn: true,
    isScreenSharing: false,
  },
};

test.describe('Tamad Meet Room', () => {
  test('should show the joining state while the room is being joined', async ({ tamadMeetRoomPage }) => {
    await tamadMeetRoomPage.holdJoinRoomPending();
    await tamadMeetRoomPage.gotoRoom('e2e-room-id');

    await expect(tamadMeetRoomPage.joiningMessage).toBeVisible();
  });

  test('should render the room header and media controls after joining', async ({ tamadMeetRoomPage }) => {
    await tamadMeetRoomPage.mockJoinRoom(mockRoom);
    await tamadMeetRoomPage.gotoRoom('e2e-room-id');

    await expect(tamadMeetRoomPage.roomTitle).toHaveText('TaMaD Meet: Room e2e-room-id');
    await expect(tamadMeetRoomPage.footerControls).toHaveCount(4);
  });

  test('should redirect to the dashboard when joining fails', async ({ tamadMeetRoomPage, page }) => {
    await tamadMeetRoomPage.mockJoinRoomFailure();
    await tamadMeetRoomPage.gotoRoom('invalid-room-id');

    await expect(page).toHaveURL(/\/team\/tamad-meet$/);
  });
});
