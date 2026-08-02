import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class NotificationsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly allTab: Locator;
  readonly unreadTab: Locator;
  readonly mentionsTab: Locator;
  readonly assignmentsTab: Locator;
  readonly unreadBadge: Locator;
  readonly markAllReadBtn: Locator;
  readonly refreshBtn: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page, '/notifications');
    this.pageTitle = page.locator('h1', { hasText: 'Notifications' });
    this.allTab = page.getByRole('button', { name: 'All' });
    this.unreadTab = page.getByRole('button', { name: /Unread/ });
    this.mentionsTab = page.getByRole('button', { name: 'Mentions' });
    this.assignmentsTab = page.getByRole('button', { name: 'Assignments' });
    this.unreadBadge = page.locator('div', { hasText: /unread/ }).last();
    this.markAllReadBtn = page.getByRole('button', { name: 'Mark all as read' });
    this.refreshBtn = page.locator('button[title="Refresh"]');
    this.emptyState = page.locator('.empty-state-title', { hasText: 'No notifications' });
  }

  async switchToTab(tab: 'all' | 'unread' | 'mentions' | 'assignments') {
    if (tab === 'all') await this.allTab.click();
    else if (tab === 'unread') await this.unreadTab.click();
    else if (tab === 'mentions') await this.mentionsTab.click();
    else await this.assignmentsTab.click();
  }

  async refresh() {
    await this.refreshBtn.click();
  }

  getNotificationCard(title: string): Locator {
    return this.page.locator('p.text-sm.font-semibold', { hasText: title });
  }
}
