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
  duration?: number;
  meetingType: string;
}

export class MeetingsDashboardPage extends BasePage {
  readonly pageTitle: Locator;
  readonly loadingMessage: Locator;
  readonly scheduleBtn: Locator;
  readonly emptyState: Locator;
  readonly meetingCards: Locator;

  // Schedule meeting modal
  readonly scheduleModal: Locator;
  readonly scheduleTitleInput: Locator;
  readonly meetingTypeSelect: Locator;
  readonly dateInput: Locator;
  readonly timeInput: Locator;
  readonly descriptionInput: Locator;
  readonly scheduleSubmitBtn: Locator;
  readonly modalCancelBtn: Locator;

  // Edit meeting modal
  readonly editModal: Locator;
  readonly editTitleInput: Locator;
  readonly editDescriptionInput: Locator;
  readonly editStartTimeInput: Locator;
  readonly editSaveBtn: Locator;
  readonly editCancelBtn: Locator;

  // Invite modal
  readonly inviteModal: Locator;
  readonly shareLinkInput: Locator;
  readonly copyLinkBtn: Locator;

  constructor(page: Page) {
    super(page, '/team/000000000000000000000000/meetings');
    this.pageTitle = page.locator('h1', { hasText: 'Meetings' });
    this.loadingMessage = page.getByText('Loading meetings...');
    this.scheduleBtn = page.getByRole('button', { name: 'Schedule Meeting', exact: true });
    this.emptyState = page.locator('.empty-state', { hasText: 'No meetings found' });
    this.meetingCards = page.locator('.card');

    this.scheduleModal = page.locator('.modal-overlay', { has: page.locator('h2', { hasText: 'Schedule Meeting' }) });
    this.scheduleTitleInput = this.scheduleModal.getByPlaceholder('E.g., Sprint 42 Planning');
    this.meetingTypeSelect = this.scheduleModal.locator('select');
    this.dateInput = this.scheduleModal.locator('input[type="date"]');
    this.timeInput = this.scheduleModal.locator('input[type="time"]');
    this.descriptionInput = this.scheduleModal.locator('textarea');
    this.scheduleSubmitBtn = this.scheduleModal.getByRole('button', { name: 'Schedule Meeting' });
    this.modalCancelBtn = this.scheduleModal.getByRole('button', { name: 'Cancel' });

    this.editModal = page.locator('.modal-overlay', { has: page.locator('h2', { hasText: 'Edit Meeting' }) });
    this.editTitleInput = this.editModal.locator('input[type="text"]');
    this.editDescriptionInput = this.editModal.locator('textarea');
    this.editStartTimeInput = this.editModal.locator('input[type="datetime-local"]');
    this.editSaveBtn = this.editModal.getByRole('button', { name: 'Save Changes' });
    this.editCancelBtn = this.editModal.getByRole('button', { name: 'Cancel' });

    this.inviteModal = page.locator('.modal-overlay', { has: page.locator('h2', { hasText: 'Invite to' }) });
    this.shareLinkInput = this.inviteModal.locator('input[readonly]');
    this.copyLinkBtn = this.inviteModal.getByRole('button').first();
  }

  async navigateToTeam(teamId: string) {
    await this.page.goto(`/team/${teamId}/meetings`);
    await this.waitForLoad();
  }

  async openScheduleModal() {
    await this.scheduleBtn.click();
    await this.scheduleModal.waitFor({ state: 'visible' });
  }

  getMeetingCard(title: string): Locator {
    return this.page.locator('.card', { has: this.page.locator('h3', { hasText: title }) });
  }

  getCardAction(title: string, action: string): Locator {
    return this.getMeetingCard(title).getByRole('button', { name: action });
  }

  async openEditModal(title: string) {
    await this.getCardAction(title, 'Edit').click();
    await this.editModal.waitFor({ state: 'visible' });
  }

  async openInviteModal(title: string) {
    await this.getCardAction(title, 'Invite').click();
    await this.inviteModal.waitFor({ state: 'visible' });
  }

  async mockMeetingsApi(options: {
    meetings: MockMeeting[];
    createMeeting?: MockMeeting;
    updateMeeting?: MockMeeting;
  }) {
    const { meetings, createMeeting, updateMeeting } = options;
    await this.page.route('**/api/meetings*', (route) => {
      const req = route.request();
      const method = req.method();
      const path = new URL(req.url()).pathname;

      if (method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ meetings }),
        });
      }
      if (method === 'POST' && path.endsWith('/join')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ token: 'e2e-token', roomName: 'e2e-room', meeting: meetings[0] }),
        });
      }
      if (method === 'POST' && path.endsWith('/cancel')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ meeting: meetings[0] }),
        });
      }
      if (method === 'POST' && path.endsWith('/duplicate')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ meeting: createMeeting || meetings[0] }),
        });
      }
      if (method === 'POST') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ meeting: createMeeting || { _id: 'e2e-created-meeting' } }),
        });
      }
      if (method === 'PATCH') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ meeting: updateMeeting || meetings[0] }),
        });
      }
      if (method === 'DELETE') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'deleted' }),
        });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
  }
}
