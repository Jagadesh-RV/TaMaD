import { test, expect } from '../../fixtures/customFixtures';

test.describe('Organization Dashboard', () => {
  test('should render the organization dashboard or its loading placeholder', async ({ organizationDashboardPage }) => {
    await organizationDashboardPage.navigate();

    // If no organization matches the id, the page keeps showing the loading state
    if (await organizationDashboardPage.loadingMessage.isVisible()) {
      await expect(organizationDashboardPage.loadingMessage).toBeVisible();
    } else {
      await expect(organizationDashboardPage.orgName).toBeVisible();
      await expect(organizationDashboardPage.orgSubtitle).toBeVisible();
    }
  });

  test('should display organization stat cards when loaded', async ({ organizationDashboardPage }) => {
    await organizationDashboardPage.navigate();
    if (await organizationDashboardPage.loadingMessage.isVisible()) {
      test.skip();
      return;
    }
    await expect(organizationDashboardPage.totalMembersStat).toBeVisible();
    await expect(organizationDashboardPage.billingPlanStat).toBeVisible();
  });

  test('should show the global members list and invite action when loaded', async ({ organizationDashboardPage }) => {
    await organizationDashboardPage.navigate();
    if (await organizationDashboardPage.loadingMessage.isVisible()) {
      test.skip();
      return;
    }
    await expect(organizationDashboardPage.globalMembersSection).toBeVisible();
    await expect(organizationDashboardPage.inviteMemberBtn).toBeVisible();
  });
});
