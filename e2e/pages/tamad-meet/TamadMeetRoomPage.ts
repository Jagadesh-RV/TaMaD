import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export interface MockTamadMeetRoom {
  room: {
    meetingId: string;
    roomId: string;
    isLocked: boolean;
    waitingRoomEnabled: boolean;
  };
  participant: {
    _id: string;
    userId: string;
    role: string;
    status: string;
    isMuted: boolean;
    isVideoOn: boolean;
    isScreenSharing: boolean;
  };
}

export class TamadMeetRoomPage extends BasePage {
  readonly joiningMessage: Locator;
  readonly roomContainer: Locator;
  readonly roomTitle: Locator;
  readonly footerControls: Locator;

  constructor(page: Page) {
    super(page, '/team/tamad-meet/room/e2e-room-id');
    this.joiningMessage = page.getByText('Joining room...');
    this.roomContainer = page.locator('div.bg-black');
    this.roomTitle = this.roomContainer.locator('h1');
    this.footerControls = this.roomContainer.locator('footer button');
  }

  async gotoRoom(roomId: string) {
    await this.page.goto(`/team/tamad-meet/room/${roomId}`);
    await this.waitForLoad();
  }

  async mockJoinRoom(room: MockTamadMeetRoom) {
    await this.page.route('**/api/tamad-meet/room/*/join', (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(room),
      });
    });
  }

  async mockJoinRoomFailure() {
    await this.page.route('**/api/tamad-meet/room/*/join', (route) => {
      void route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Room not found' }),
      });
    });
  }

  async holdJoinRoomPending() {
    await this.page.route('**/api/tamad-meet/room/*/join', () => {
      // Keep the join request pending so the room stays in the joining state
    });
  }
}
