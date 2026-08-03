import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export interface MockOrgMember {
  userId: { _id: string; name: string; email: string };
  role: string;
}

export interface MockOrganization {
  _id: string;
  name: string;
  domain?: string;
  members: MockOrgMember[];
  billing?: { plan?: string; status?: string };
}

export class OrganizationDashboardPage extends BasePage {
  readonly loadingMessage: Locator;
  readonly orgName: Locator;
  readonly orgSubtitle: Locator;
  readonly totalMembersStat: Locator;
  readonly billingPlanStat: Locator;
  readonly inviteMemberBtn: Locator;
  readonly globalMembersSection: Locator;

  constructor(page: Page) {
    super(page, '/org/000000000000000000000000');
    this.loadingMessage = page.getByText('Loading Organization...');
    this.orgName = page.locator('main h1');
    this.orgSubtitle = page.locator('main p.text-sm', { hasText: 'Organization Dashboard' });
    this.totalMembersStat = this.getStatValue('Total Members');
    this.billingPlanStat = this.getStatValue('Billing Plan');
    this.inviteMemberBtn = page.getByRole('button', { name: 'Invite Member' });
    this.globalMembersSection = page
      .locator('h2', { hasText: 'Global Members' })
      .locator('xpath=ancestor::div[contains(@class, "rounded-xl")]');
  }

  getStatValue(label: string): Locator {
    return this.page
      .locator('h3', { hasText: label })
      .locator('xpath=ancestor::div[contains(@class, "rounded-xl")]')
      .locator('p.font-bold');
  }

  async navigateToOrg(id: string) {
    await this.page.goto(`/org/${id}`);
    await this.waitForLoad();
  }

  getMemberName(nameOrEmail: string): Locator {
    return this.page.locator('p.text-sm', { hasText: nameOrEmail });
  }

  async mockOrganization(org: MockOrganization) {
    await this.page.route('**/api/organizations', (route) => {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([org]),
      });
    });
  }
}
