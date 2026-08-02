import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class CalendarPage extends BasePage {
  readonly pageTitle: Locator;
  readonly todayBtn: Locator;
  readonly prevMonthBtn: Locator;
  readonly nextMonthBtn: Locator;
  readonly monthLabel: Locator;
  readonly quickStatsHeader: Locator;
  readonly upcomingHeader: Locator;
  readonly projectFilterHeader: Locator;

  constructor(page: Page) {
    super(page, '/calendar');
    this.pageTitle = page.locator('h1', { hasText: 'Calendar' });
    this.todayBtn = page.getByRole('button', { name: 'Today' });
    this.prevMonthBtn = page.locator('button').filter({ has: page.locator('svg.lucide-chevron-left') }).first();
    this.nextMonthBtn = page.locator('button').filter({ has: page.locator('svg.lucide-chevron-right') }).first();
    this.monthLabel = page.locator('span[class*="uppercase"]', { hasText: /^[A-Z][a-z]+ 20\d\d$/ });
    this.quickStatsHeader = page.locator('h3', { hasText: 'Quick Stats' });
    this.upcomingHeader = page.locator('h3', { hasText: 'Upcoming' });
    this.projectFilterHeader = page.locator('h3', { hasText: 'Filter by Project' });
  }

  async goToToday() {
    await this.todayBtn.click();
  }

  async goToNextMonth() {
    await this.nextMonthBtn.click();
  }

  async goToPreviousMonth() {
    await this.prevMonthBtn.click();
  }

  getMonthLabel(): Promise<string | null> {
    return this.monthLabel.textContent();
  }

  getDayCell(dateText: string): Locator {
    // Finds a day cell that contains the given day number
    return this.page.locator('div[class*="flex flex-col p-2"]', { hasText: dateText }).first();
  }
}
