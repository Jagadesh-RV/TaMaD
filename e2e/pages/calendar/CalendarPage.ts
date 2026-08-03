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

  getTodayCell(): Locator {
    // Today's day cell has a day number rendered with white text on the accent color
    return this.page.locator('div[class*="flex flex-col p-2"]', {
      has: this.page.locator('div[style*="color: white"]'),
    });
  }

  getTaskChip(title: string): Locator {
    return this.page
      .getByText(title, { exact: true })
      .locator('xpath=ancestor::div[contains(@class, "cursor-grab")]');
  }

  getTaskInCell(title: string, cell: Locator): Locator {
    return cell.getByText(title, { exact: true });
  }

  async dragTaskToToday(title: string) {
    const chip = this.getTaskChip(title);
    const target = this.getTodayCell();
    const chipBox = await chip.boundingBox();
    const targetBox = await target.boundingBox();
    if (!chipBox || !targetBox) throw new Error(`Could not locate task '${title}' or today's cell`);

    const startX = chipBox.x + chipBox.width / 2;
    const startY = chipBox.y + chipBox.height / 2;
    const endX = targetBox.x + targetBox.width / 2;
    const endY = targetBox.y + targetBox.height / 2;

    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(startX + 10, startY + 10, { steps: 5 });
    await this.page.mouse.move(endX, endY, { steps: 20 });
    await this.page.mouse.up();
  }

  async mockCalendarApi(options: { tasks: Array<Record<string, unknown>> }) {
    const { tasks } = options;
    await this.page.route('**/api/projects*', (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ projects: [] }),
      });
    });
    await this.page.route('**/api/tasks*', (route) => {
      const req = route.request();
      const method = req.method();
      const path = new URL(req.url()).pathname;
      const id = path.split('/').filter(Boolean)[2] || '';

      if (method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ tasks }),
        });
      }
      if (method === 'PUT') {
        const body = (req.postDataJSON?.() || {}) as Record<string, unknown>;
        const existing = tasks.find(t => t._id === id) || tasks[0];
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...existing, ...body }),
        });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
  }
}
