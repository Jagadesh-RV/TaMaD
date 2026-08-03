import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export interface MockMeeting {
  _id: string;
  title: string;
  description?: string;
  teamId: string;
  hostId: string;
  roomName: string;
  status: string;
  startTime: string;
  meetingType: string;
}

export class MeetingRoomPage extends BasePage {
  readonly connectingMessage: Locator;
  readonly roomContainer: Locator;
  readonly meetingTitle: Locator;
  readonly meetingTypeBadge: Locator;
  readonly showNotesBtn: Locator;
  readonly hideNotesBtn: Locator;
  readonly endMeetingBtn: Locator;
  readonly notesSidebar: Locator;
  readonly notesTextarea: Locator;

  constructor(page: Page) {
    super(page, '/team/000000000000000000000000/meetings/000000000000000000000000/room');
    this.connectingMessage = page.getByText('Connecting to meeting room...');
    this.roomContainer = page.locator('div.bg-gray-950');
    this.meetingTitle = this.roomContainer.locator('h2');
    this.meetingTypeBadge = this.roomContainer.locator('span.bg-gray-800');
    this.showNotesBtn = this.roomContainer.getByRole('button', { name: 'Show Notes' });
    this.hideNotesBtn = this.roomContainer.getByRole('button', { name: 'Hide Notes' });
    this.endMeetingBtn = this.roomContainer.getByRole('button', { name: 'End Meeting' });
    this.notesSidebar = this.roomContainer.locator('div.w-96');
    this.notesTextarea = this.notesSidebar.locator('textarea[placeholder*="meeting notes"]');
  }

  async gotoRoom(teamId: string, meetingId: string) {
    await this.page.goto(`/team/${teamId}/meetings/${meetingId}/room`);
    await this.waitForLoad();
  }

  async mockJoinMeeting(meeting: MockMeeting) {
    await this.page.route('**/api/meetings/*/join', (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-livekit-token',
          roomName: meeting.roomName,
          meeting,
        }),
      });
    });
  }

  async holdJoinMeetingPending() {
    await this.page.route('**/api/meetings/*/join', () => {
      // Keep the join request pending so the room stays in the connecting state
    });
  }
}
