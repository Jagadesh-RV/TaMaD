import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class MeetingsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly instantMeetBtn: Locator;
  readonly scheduleBtn: Locator;
  readonly emptyState: Locator;

  // Instant meet modal
  readonly instantModalTitle: Locator;
  readonly scheduledModalTitle: Locator;
  readonly meetingTitleInput: Locator;
  readonly startTimeInput: Locator;
  readonly durationInput: Locator;
  readonly startNowBtn: Locator;
  readonly scheduleSubmitBtn: Locator;
  readonly cancelBtn: Locator;

  constructor(page: Page) {
    super(page, '/team/tamad-meet');
    this.pageTitle = page.locator('h1', { hasText: 'TaMaD Meet Dashboard' });
    this.instantMeetBtn = page.getByRole('button', { name: /Instant Meet/ });
    this.scheduleBtn = page.getByRole('button', { name: 'Schedule' });
    this.emptyState = page.locator('text=No meetings scheduled.');

    // Modals
    this.instantModalTitle = page.locator('h2', { hasText: 'Start Instant Meeting' });
    this.scheduledModalTitle = page.locator('h2', { hasText: 'Schedule Meeting' });
    this.meetingTitleInput = page.getByPlaceholder('Enter meeting title');
    this.startTimeInput = page.locator('input[type="datetime-local"]');
    this.durationInput = page.locator('input[type="number"]');
    this.startNowBtn = page.getByRole('button', { name: 'Start Now' });
    this.scheduleSubmitBtn = page.getByRole('button', { name: 'Schedule', exact: true });
    this.cancelBtn = page.getByRole('button', { name: 'Cancel' });
  }

  async openInstantMeetModal() {
    await this.instantMeetBtn.click();
    await this.instantModalTitle.waitFor({ state: 'visible' });
  }

  async openScheduleModal() {
    await this.scheduleBtn.click();
    await this.scheduledModalTitle.waitFor({ state: 'visible' });
  }

  getMeetingCard(title: string): Locator {
    return this.page.locator('.card', { has: this.page.locator('h3', { hasText: title }) });
  }

  async joinMeeting(title: string) {
    await this.getMeetingCard(title).getByRole('button', { name: /Join Room/ }).click();
  }
}
