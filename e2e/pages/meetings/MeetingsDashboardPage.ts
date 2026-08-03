import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

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
}
