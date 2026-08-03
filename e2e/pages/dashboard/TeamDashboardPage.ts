import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export interface MockWorkspace {
  _id: string;
  name: string;
  type: 'personal' | 'team';
  teamId?: string;
  organizationId?: string;
  ownerId: string;
  members: unknown[];
  isActive: boolean;
  settings: { allowGuests: boolean; isPublic: boolean };
}

export interface MockDashboardWidget {
  id: string;
  type: 'active-sprint' | 'burndown' | 'velocity' | 'workload';
  x: number;
  y: number;
  w: number;
  h: number;
  visible: boolean;
}

export interface MockDashboard {
  _id: string;
  name: string;
  workspaceId: string;
  isDefault: boolean;
  layout: MockDashboardWidget[];
}

export class TeamDashboardPage extends BasePage {
  readonly pageTitle: Locator;
  readonly subtitle: Locator;
  readonly customizeBtn: Locator;
  readonly saveLayoutBtn: Locator;
  readonly cancelBtn: Locator;
  readonly loadingMessage: Locator;
  readonly noDashboardMessage: Locator;

  constructor(page: Page) {
    super(page, '/dashboard');
    this.pageTitle = page.locator('h1');
    this.subtitle = page.locator('p', { hasText: 'Command center for' });
    this.customizeBtn = page.getByRole('button', { name: 'Customize', exact: true });
    this.saveLayoutBtn = page.getByRole('button', { name: 'Save Layout' });
    this.cancelBtn = page.getByRole('button', { name: 'Cancel', exact: true });
    this.loadingMessage = page.getByText('Loading dashboard...');
    this.noDashboardMessage = page.getByText('No dashboard configured.');
  }

  getWidgetHeading(title: string): Locator {
    return this.page.locator('h3', { hasText: title });
  }

  async mockTeamContext(workspace: MockWorkspace, dashboard: MockDashboard) {
    // Auth workspace drives which dashboard variant /dashboard renders.
    await this.page.route('**/api/auth/workspace', (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ workspace }),
      });
    });

    // Workspace list so the workspace store resolves the current team workspace.
    await this.page.route('**/api/workspaces', (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([workspace]),
      });
    });

    // Dashboard lookup and layout save share the same resource path.
    await this.page.route('**/api/dashboards**', (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(dashboard),
      });
    });
  }

  async mockNoDashboard() {
    await this.page.route('**/api/dashboards**', (route) => {
      void route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'No dashboard configured' }),
      });
    });
  }

  async holdDashboardPending() {
    await this.page.route('**/api/dashboards**', () => {
      // Keep the dashboard request pending so the loading state stays visible
    });
  }
}
