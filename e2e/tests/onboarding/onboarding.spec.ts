import { test, expect } from '../../fixtures/customFixtures';

test.describe('Onboarding Page', () => {
  test.beforeEach(async ({ onboardingPage }) => {
    await onboardingPage.navigate();
  });

  test('should show workspace mode selection', async ({ onboardingPage }) => {
    await expect(onboardingPage.welcomeHeading).toBeVisible();
    await expect(onboardingPage.justMeBtn).toBeVisible();
    await expect(onboardingPage.myTeamBtn).toBeVisible();
  });

  test('should walk through personal workspace setup', async ({ onboardingPage }) => {
    await onboardingPage.justMeBtn.click();
    await expect(onboardingPage.workspaceNameInput).toBeVisible();
    await onboardingPage.workspaceNameInput.fill('E2E Personal Workspace');
    await expect(onboardingPage.createWorkspaceBtn).toBeVisible();
  });

  test('should skip setup and show the completion state', async ({ onboardingPage }) => {
    await onboardingPage.skipBtn.click();
    await expect(onboardingPage.allSetHeading).toBeVisible();
    await expect(onboardingPage.openDashboardBtn).toBeVisible();
  });
});
