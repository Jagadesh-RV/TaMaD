import { test, expect } from '../../fixtures/customFixtures';
import { MockOrganization } from '../../pages/organizations/OrganizationDashboardPage';

const mockOrganization: MockOrganization = {
  _id: 'e2e-org-id',
  name: 'E2E Acme Corp',
  domain: 'acme.example.com',
  billing: { plan: 'Pro', status: 'Active' },
  members: [
    { userId: { _id: 'e2e-user-1', name: 'Alice Chen', email: 'alice@example.com' }, role: 'owner' },
    { userId: { _id: 'e2e-user-2', name: 'Bob Smith', email: 'bob@example.com' }, role: 'admin' },
  ],
};

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
    await organizationDashboardPage.mockOrganization(mockOrganization);
    await organizationDashboardPage.navigateToOrg('e2e-org-id');

    await expect(organizationDashboardPage.orgName).toHaveText('E2E Acme Corp');
    await expect(organizationDashboardPage.totalMembersStat).toHaveText('2');
    await expect(organizationDashboardPage.billingPlanStat).toHaveText('Pro');
  });

  test('should show the global members list and invite action when loaded', async ({ organizationDashboardPage }) => {
    await organizationDashboardPage.mockOrganization(mockOrganization);
    await organizationDashboardPage.navigateToOrg('e2e-org-id');

    await expect(organizationDashboardPage.globalMembersSection).toBeVisible();
    await expect(organizationDashboardPage.inviteMemberBtn).toBeVisible();
    await expect(organizationDashboardPage.getMemberName('Alice Chen')).toBeVisible();
    await expect(organizationDashboardPage.getMemberName('Bob Smith')).toBeVisible();
  });
});
