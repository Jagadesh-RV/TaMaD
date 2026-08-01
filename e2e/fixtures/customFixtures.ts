import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { TasksPage } from '../pages/tasks/TasksPage';
import { ProjectsPage } from '../pages/projects/ProjectsPage';
import { AgileBoardPage } from '../pages/agile/AgileBoardPage';
import { TeamsPage } from '../pages/teams/TeamsPage';

type MyFixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  dashboardPage: DashboardPage;
  settingsPage: SettingsPage;
  tasksPage: TasksPage;
  projectsPage: ProjectsPage;
  agilePage: AgileBoardPage;
  teamsPage: TeamsPage;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },
  tasksPage: async ({ page }, use) => {
    await use(new TasksPage(page));
  },
  projectsPage: async ({ page }, use) => {
    await use(new ProjectsPage(page));
  },
  agilePage: async ({ page }, use) => {
    await use(new AgileBoardPage(page));
  },
  teamsPage: async ({ page }, use) => {
    await use(new TeamsPage(page));
  },
});

export { expect } from '@playwright/test';
