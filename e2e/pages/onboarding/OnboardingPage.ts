import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class OnboardingPage extends BasePage {
  readonly welcomeHeading: Locator;
  readonly justMeBtn: Locator;
  readonly myTeamBtn: Locator;
  readonly skipBtn: Locator;
  readonly workspaceNameInput: Locator;
  readonly createWorkspaceBtn: Locator;
  readonly allSetHeading: Locator;
  readonly openDashboardBtn: Locator;

  constructor(page: Page) {
    super(page, '/onboarding');
    this.welcomeHeading = page.getByRole('heading', { name: /Welcome to TaMaD/ });
    this.justMeBtn = page.getByRole('button', { name: /Just me/ });
    this.myTeamBtn = page.getByRole('button', { name: /My team/ });
    this.skipBtn = page.getByRole('button', { name: 'Skip for now', exact: true }).first();
    this.workspaceNameInput = page.getByLabel(/Workspace name|Organization name/);
    this.createWorkspaceBtn = page.getByRole('button', { name: 'Create workspace', exact: true });
    this.allSetHeading = page.getByRole('heading', { name: /You're all set/ });
    this.openDashboardBtn = page.getByRole('button', { name: 'Open my dashboard', exact: true });
  }
}
