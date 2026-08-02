import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { TasksPage } from '../pages/tasks/TasksPage';
import { ProjectsPage } from '../pages/projects/ProjectsPage';
import { AgileBoardPage } from '../pages/agile/AgileBoardPage';
import { TeamsPage } from '../pages/teams/TeamsPage';
import { NotesPage } from '../pages/notes/NotesPage';
import { WhiteboardPage } from '../pages/whiteboard/WhiteboardPage';
import { DocumentsPage } from '../pages/documents/DocumentsPage';
import { FilesPage } from '../pages/files/FilesPage';
import { CalendarPage } from '../pages/calendar/CalendarPage';
import { PlannerPage } from '../pages/planner/PlannerPage';
import { FocusPage } from '../pages/focus/FocusPage';
import { MeetingsPage } from '../pages/meetings/MeetingsPage';
import { AIAssistantPage } from '../pages/ai/AIAssistantPage';
import { TemplatesPage } from '../pages/templates/TemplatesPage';
import { NotificationsPage } from '../pages/notifications/NotificationsPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { RoadmapPage } from '../pages/roadmap/RoadmapPage';
import { AnalyticsPage } from '../pages/analytics/AnalyticsPage';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { SprintPlanningPage } from '../pages/sprint-planning/SprintPlanningPage';

type MyFixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  dashboardPage: DashboardPage;
  settingsPage: SettingsPage;
  tasksPage: TasksPage;
  projectsPage: ProjectsPage;
  agilePage: AgileBoardPage;
  teamsPage: TeamsPage;
  notesPage: NotesPage;
  whiteboardPage: WhiteboardPage;
  documentsPage: DocumentsPage;
  filesPage: FilesPage;
  calendarPage: CalendarPage;
  plannerPage: PlannerPage;
  focusPage: FocusPage;
  meetingsPage: MeetingsPage;
  aiAssistantPage: AIAssistantPage;
  templatesPage: TemplatesPage;
  notificationsPage: NotificationsPage;
  profilePage: ProfilePage;
  roadmapPage: RoadmapPage;
  analyticsPage: AnalyticsPage;
  reportsPage: ReportsPage;
  sprintPlanningPage: SprintPlanningPage;
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
  notesPage: async ({ page }, use) => {
    await use(new NotesPage(page));
  },
  whiteboardPage: async ({ page }, use) => {
    await use(new WhiteboardPage(page));
  },
  documentsPage: async ({ page }, use) => {
    await use(new DocumentsPage(page));
  },
  filesPage: async ({ page }, use) => {
    await use(new FilesPage(page));
  },
  calendarPage: async ({ page }, use) => {
    await use(new CalendarPage(page));
  },
  plannerPage: async ({ page }, use) => {
    await use(new PlannerPage(page));
  },
  focusPage: async ({ page }, use) => {
    await use(new FocusPage(page));
  },
  meetingsPage: async ({ page }, use) => {
    await use(new MeetingsPage(page));
  },
  aiAssistantPage: async ({ page }, use) => {
    await use(new AIAssistantPage(page));
  },
  templatesPage: async ({ page }, use) => {
    await use(new TemplatesPage(page));
  },
  notificationsPage: async ({ page }, use) => {
    await use(new NotificationsPage(page));
  },
  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },
  roadmapPage: async ({ page }, use) => {
    await use(new RoadmapPage(page));
  },
  analyticsPage: async ({ page }, use) => {
    await use(new AnalyticsPage(page));
  },
  reportsPage: async ({ page }, use) => {
    await use(new ReportsPage(page));
  },
  sprintPlanningPage: async ({ page }, use) => {
    await use(new SprintPlanningPage(page));
  },
});

export { expect } from '@playwright/test';
