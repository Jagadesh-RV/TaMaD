import { test, expect } from '../../fixtures/customFixtures';
import { MockWorkspace, MockSprint, MockAgileTask } from '../../pages/agile/AgileBoardPage';

const mockWorkspace: MockWorkspace = {
  _id: 'e2e-ws',
  name: 'E2E Workspace',
  type: 'team',
  teamId: 'e2e-team-id',
  ownerId: 'e2e-user-id',
  members: [
    { userId: { _id: 'e2e-user-id', name: 'E2E Test User', email: 'teste2e@example.com' }, role: 'owner' },
  ],
  isActive: true,
  settings: { allowGuests: false, isPublic: false },
};

const activeSprint: MockSprint = {
  _id: 's1',
  name: 'Sprint 1',
  goal: 'Ship the e2e flows',
  startDate: '2026-08-01',
  endDate: '2026-08-14',
  status: 'active',
  workspaceId: 'e2e-ws',
};

const boardTasks: MockAgileTask[] = [
  {
    _id: 'task-1',
    title: 'Board Task',
    description: 'Do the thing',
    status: 'todo',
    priority: 'high',
    workspaceId: 'e2e-ws',
    sprintId: 's1',
    taskType: 'task',
    storyPoints: 3,
  },
  {
    _id: 'task-2',
    title: 'In Review Task',
    status: 'review',
    priority: 'medium',
    workspaceId: 'e2e-ws',
    sprintId: 's1',
    taskType: 'bug',
  },
];

test.describe('Agile Board Page', () => {
  test('should render the active sprint with tasks across columns', async ({ agilePage }) => {
    await agilePage.mockAgileApi({ workspace: mockWorkspace, sprints: [activeSprint], tasks: boardTasks });
    await agilePage.navigate();

    await expect(agilePage.activeSprintHeader).toBeVisible();
    await expect(agilePage.sprintName).toContainText('Sprint 1');
    await expect(agilePage.completeSprintBtn).toBeVisible();

    await expect(agilePage.getTaskInColumn('Board Task', 'To Do')).toBeVisible();
    await expect(agilePage.getTaskInColumn('In Review Task', 'In Review')).toBeVisible();
  });

  test('should open the task detail modal when a card is clicked', async ({ agilePage }) => {
    await agilePage.mockAgileApi({ workspace: mockWorkspace, sprints: [activeSprint], tasks: boardTasks });
    await agilePage.navigate();

    await agilePage.openTaskDetail('Board Task');

    await expect(agilePage.detailModal).toBeVisible();
    await expect(agilePage.detailTitleInput).toHaveValue('Board Task');
    await expect(agilePage.watchBtn).toBeVisible();
    await expect(agilePage.voteBtn).toBeVisible();
    await expect(agilePage.getDetailStatusDropdown()).toContainText('To Do');
  });

  test('should change a task status from the detail modal', async ({ agilePage }) => {
    await agilePage.mockAgileApi({ workspace: mockWorkspace, sprints: [activeSprint], tasks: boardTasks });
    await agilePage.navigate();

    await agilePage.openTaskDetail('Board Task');
    await agilePage.selectFromDetailDropdown(agilePage.getDetailStatusDropdown(), 'In Progress');

    await expect(agilePage.getTaskInColumn('Board Task', 'In Progress')).toBeVisible();
    await expect(agilePage.getTaskInColumn('Board Task', 'To Do')).toBeHidden();
  });

  test('should add a comment from the detail modal', async ({ agilePage }) => {
    await agilePage.mockAgileApi({ workspace: mockWorkspace, sprints: [activeSprint], tasks: boardTasks });
    await agilePage.navigate();

    await agilePage.openTaskDetail('Board Task');
    const commentInput = agilePage.page.getByPlaceholder('Write a comment...');
    await expect(commentInput).toBeVisible();

    await commentInput.fill('Looks good to me');
    await commentInput.press('Enter');
    await expect(commentInput).toHaveValue('');
  });

  test('should complete the active sprint', async ({ agilePage }) => {
    await agilePage.mockAgileApi({ workspace: mockWorkspace, sprints: [activeSprint], tasks: boardTasks });
    await agilePage.navigate();

    await expect(agilePage.completeSprintBtn).toBeVisible();
    await agilePage.completeSprintBtn.click();

    await expect(agilePage.noActiveSprint).toBeVisible();
    await expect(agilePage.page.getByText('Go to Sprint Planning to start a sprint.')).toBeVisible();
    await expect(agilePage.completeSprintBtn).toBeHidden();
  });
});
