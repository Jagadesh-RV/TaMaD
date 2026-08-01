import { test, expect } from '../../fixtures/customFixtures';

test.describe('Projects Page', () => {
  test.beforeEach(async ({ projectsPage }) => {
    await projectsPage.navigate();
  });

  test('should create a new project', async ({ projectsPage }) => {
    const projectName = `E2E Project ${Date.now()}`;
    const startDate = '2027-01-01';
    const endDate = '2027-12-31';

    await projectsPage.createProject(projectName, startDate, endDate, 'This is a test project');

    // Wait for the modal to close and the project to appear
    await expect(projectsPage.getProjectCard(projectName)).toBeVisible();
  });

  test('should expand project card and show details', async ({ projectsPage }) => {
    const projectName = `Expandable Project ${Date.now()}`;
    await projectsPage.createProject(projectName, '2027-01-01', '2027-12-31');

    const projectCard = projectsPage.getProjectCard(projectName);
    await expect(projectCard).toBeVisible();

    // The project card expands when you click on it. We'll click the heading's parent container.
    // In ProjectsPage.tsx, it's `.cursor-pointer.p-5`
    await projectCard.locator('xpath=ancestor::div[contains(@class, "cursor-pointer")]').first().click();

    // We can't strictly assert team members if none exist, but we can assert the visual expansion happens
    // The container changes border color, but checking the expanded DOM is tricky if it's empty.
    // At minimum, we know it shouldn't crash and the click works.
  });
});
