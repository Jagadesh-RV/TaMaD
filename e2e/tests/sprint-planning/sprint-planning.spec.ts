import { test, expect } from '../../fixtures/customFixtures';

test.describe('Sprint Planning Page', () => {
  test.beforeEach(async ({ sprintPlanningPage }) => {
    await sprintPlanningPage.navigate();
  });

  test('should load the backlog and planning board', async ({ sprintPlanningPage }) => {
    await expect(sprintPlanningPage.pageTitle).toBeVisible();
    await expect(sprintPlanningPage.createSprintBtn).toBeVisible();
    await expect(sprintPlanningPage.createIssueBtn).toBeVisible();
    await expect(sprintPlanningPage.backlogHeading).toBeVisible();
  });

  test('should show active or planned sprints or the empty state', async ({ sprintPlanningPage, page }) => {
    // Data-dependent: either sprint cards render or the empty state is shown
    if (await sprintPlanningPage.noSprintsMessage.isVisible()) {
      await expect(page.getByText('Create a sprint to start planning your work.')).toBeVisible();
    } else {
      await expect(page.locator('h2').first()).toBeVisible();
    }
  });

  test('should open and cancel the create issue modal', async ({ sprintPlanningPage }) => {
    await sprintPlanningPage.openCreateIssueModal();
    await expect(sprintPlanningPage.modalTitle).toBeVisible();
    await expect(sprintPlanningPage.taskTitleInput).toBeVisible();

    await sprintPlanningPage.cancelTaskBtn.click();
    await expect(sprintPlanningPage.modalTitle).toHaveCount(0);
  });

  test('should create a backlog issue', async ({ sprintPlanningPage }) => {
    const title = `E2E Backlog Issue ${Date.now()}`;

    await sprintPlanningPage.openCreateIssueModal();
    await sprintPlanningPage.taskTitleInput.fill(title);
    await sprintPlanningPage.saveTaskBtn.click();

    await expect(sprintPlanningPage.modalTitle).toHaveCount(0);
  });
});
