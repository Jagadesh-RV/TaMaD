import { test, expect } from '../../fixtures/customFixtures';

const seededProjects = [
  {
    _id: 'pa',
    name: 'Alpha Project',
    description: 'First seeded project',
    status: 'active',
    color: '#6366f1',
    dueDate: '2026-12-31',
    members: ['alice@example.com', 'bob@example.com'],
  },
  {
    _id: 'pb',
    name: 'Beta Project',
    description: 'Second seeded project',
    status: 'on-hold',
    color: '#f59e0b',
    dueDate: '2026-10-15',
    members: [],
  },
];

const seededTasks = [
  { _id: 't1', title: 'Alpha task one', status: 'done', priority: 'high', projectId: 'pa' },
  { _id: 't2', title: 'Alpha task two', status: 'todo', priority: 'medium', projectId: 'pa' },
  { _id: 't3', title: 'Beta task one', status: 'done', priority: 'low', projectId: 'pb' },
];

test.describe('Projects Page', () => {
  test('should create a new project', async ({ projectsPage }) => {
    const projectName = `E2E Project ${Date.now()}`;
    const startDate = '2027-01-01';
    const endDate = '2027-12-31';

    await projectsPage.mockProjectsApi({ projects: [], tasks: [] });
    await projectsPage.navigate();
    await projectsPage.createProject(projectName, startDate, endDate, 'This is a test project');

    // Wait for the modal to close and the project to appear
    await expect(projectsPage.getProjectCard(projectName)).toBeVisible();
  });

  test('should render summary stats and progress from mocked data', async ({ projectsPage }) => {
    await projectsPage.mockProjectsApi({ projects: seededProjects, tasks: seededTasks });
    await projectsPage.navigate();

    await expect(projectsPage.getStatValue('Total Projects')).toHaveText('2');
    await expect(projectsPage.getStatValue('Total Tasks')).toHaveText('3');
    await expect(projectsPage.getStatValue('Avg Progress')).toHaveText('75%');

    const alphaCard = projectsPage.getProjectCardContainer('Alpha Project');
    await expect(alphaCard).toContainText('1 of 2 tasks');
    await expect(alphaCard).toContainText('50%');
    await expect(alphaCard.locator('.badge')).toContainText('active');

    const betaCard = projectsPage.getProjectCardContainer('Beta Project');
    await expect(betaCard).toContainText('1 of 1 tasks');
    await expect(betaCard).toContainText('100%');
    await expect(betaCard.locator('.badge')).toContainText('on-hold');
  });

  test('should expand a project card to show team members', async ({ projectsPage }) => {
    await projectsPage.mockProjectsApi({ projects: seededProjects, tasks: seededTasks });
    await projectsPage.navigate();

    const alphaCard = projectsPage.getProjectCardContainer('Alpha Project');
    await projectsPage.expandProject('Alpha Project');

    await expect(alphaCard).toContainText('Team Members');
    await expect(alphaCard).toContainText('alice@example.com');
    await expect(alphaCard).toContainText('bob@example.com');
  });
});
