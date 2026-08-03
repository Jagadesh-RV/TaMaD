import { test, expect } from '../../fixtures/customFixtures';
import { MockWorkspace, MockDashboard } from '../../pages/dashboard/TeamDashboardPage';

const mockWorkspace: MockWorkspace = {
  _id: 'e2e-workspace-id',
  name: 'E2E Product Team',
  type: 'team',
  teamId: 'e2e-team-id',
  ownerId: 'e2e-user-id',
  members: [],
  isActive: true,
  settings: { allowGuests: false, isPublic: false },
};

const mockDashboard: MockDashboard = {
  _id: 'e2e-dashboard-id',
  name: 'Team Operations',
  workspaceId: 'e2e-workspace-id',
  isDefault: true,
  layout: [
    { id: 'widget-burndown', type: 'burndown', x: 0, y: 0, w: 2, h: 2, visible: true },
    { id: 'widget-velocity', type: 'velocity', x: 2, y: 0, w: 2, h: 2, visible: true },
    { id: 'widget-workload', type: 'workload', x: 0, y: 2, w: 2, h: 2, visible: true },
    { id: 'widget-active-sprint', type: 'active-sprint', x: 2, y: 2, w: 2, h: 2, visible: true },
  ],
};

const WIDGET_TITLES = ['Sprint Burndown', 'Team Velocity', 'Workload Distribution', 'Active Sprint Progress'];

test.describe('Team Dashboard', () => {
  test('should show the loading state while the dashboard is being fetched', async ({ teamDashboardPage }) => {
    await teamDashboardPage.mockTeamContext(mockWorkspace, mockDashboard);
    await teamDashboardPage.holdDashboardPending();
    await teamDashboardPage.page.goto('/dashboard');

    await expect(teamDashboardPage.loadingMessage).toBeVisible();
  });

  test('should render the team dashboard header and customize action', async ({ teamDashboardPage }) => {
    await teamDashboardPage.mockTeamContext(mockWorkspace, mockDashboard);
    await teamDashboardPage.navigate();

    await expect(teamDashboardPage.pageTitle).toHaveText('Team Operations');
    await expect(teamDashboardPage.subtitle).toContainText('Command center for E2E Product Team');
    await expect(teamDashboardPage.customizeBtn).toBeVisible();
  });

  test('should render all dashboard widgets', async ({ teamDashboardPage }) => {
    await teamDashboardPage.mockTeamContext(mockWorkspace, mockDashboard);
    await teamDashboardPage.navigate();

    for (const title of WIDGET_TITLES) {
      await expect(teamDashboardPage.getWidgetHeading(title)).toBeVisible();
    }
  });

  test('should show the empty state when no dashboard is configured', async ({ teamDashboardPage }) => {
    await teamDashboardPage.mockTeamContext(mockWorkspace, mockDashboard);
    await teamDashboardPage.mockNoDashboard();
    await teamDashboardPage.navigate();

    await expect(teamDashboardPage.noDashboardMessage).toBeVisible();
  });

  test('should enter customize mode and reveal save and cancel actions', async ({ teamDashboardPage }) => {
    await teamDashboardPage.mockTeamContext(mockWorkspace, mockDashboard);
    await teamDashboardPage.navigate();

    await teamDashboardPage.customizeBtn.click();

    await expect(teamDashboardPage.saveLayoutBtn).toBeVisible();
    await expect(teamDashboardPage.cancelBtn).toBeVisible();
    await expect(teamDashboardPage.customizeBtn).toBeHidden();
  });

  test('should cancel customize mode without saving', async ({ teamDashboardPage }) => {
    await teamDashboardPage.mockTeamContext(mockWorkspace, mockDashboard);
    await teamDashboardPage.navigate();

    await teamDashboardPage.customizeBtn.click();
    await teamDashboardPage.cancelBtn.click();

    await expect(teamDashboardPage.customizeBtn).toBeVisible();
    await expect(teamDashboardPage.saveLayoutBtn).toBeHidden();
  });

  test('should save the layout and exit customize mode', async ({ teamDashboardPage }) => {
    await teamDashboardPage.mockTeamContext(mockWorkspace, mockDashboard);
    await teamDashboardPage.navigate();

    await teamDashboardPage.customizeBtn.click();
    await teamDashboardPage.saveLayoutBtn.click();

    const toast = teamDashboardPage.page.locator('.toast-message, [role="alert"]').first();
    await toast.waitFor({ state: 'visible', timeout: 5000 });
    await expect(toast).toContainText('Dashboard saved');
    await expect(teamDashboardPage.customizeBtn).toBeVisible();
  });
});
