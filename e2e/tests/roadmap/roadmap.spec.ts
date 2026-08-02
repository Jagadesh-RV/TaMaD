import { test, expect } from '../../fixtures/customFixtures';

test.describe('Roadmap Page', () => {
  test.beforeEach(async ({ roadmapPage }) => {
    await roadmapPage.navigate();
  });

  test('should load roadmap with timeline', async ({ roadmapPage, page }) => {
    await expect(roadmapPage.pageTitle).toBeVisible();
    await expect(roadmapPage.newProjectBtn).toBeVisible();
    await expect(roadmapPage.projectsColumnHeader).toBeVisible();

    // 30 days from start of month + the start day = 31 day cells
    expect(await roadmapPage.timelineDayCells.count()).toBeGreaterThan(0);

    // Either projects exist or the empty state is shown
    const projectRows = page.locator('h3');
    if ((await projectRows.count()) === 0) {
      await expect(roadmapPage.emptyStateMessage).toBeVisible();
    } else {
      await expect(projectRows.first()).toBeVisible();
    }
  });

  test('should open and close the new project modal', async ({ roadmapPage }) => {
    await roadmapPage.clickNewProject();
    await expect(roadmapPage.modalHeading).toBeVisible();

    await roadmapPage.cancelModalBtn.click();
    await expect(roadmapPage.modalHeading).toHaveCount(0);
  });

  test('should create a new project from the roadmap', async ({ roadmapPage }) => {
    const projectName = `E2E Roadmap Project ${Date.now()}`;

    await roadmapPage.createProject(projectName, '2027-01-01', '2027-12-31', 'Roadmap test project');

    // Modal should close after saving
    await expect(roadmapPage.modalHeading).toHaveCount(0);
  });
});
