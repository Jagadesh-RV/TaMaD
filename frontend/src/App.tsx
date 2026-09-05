import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

import AppLayout from "./components/layout/AppLayout";
import { RealtimeProvider } from "./providers/RealtimeProvider";
import ErrorBoundary from "./components/ui/ErrorBoundary";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const TasksPage = lazy(() => import("./pages/TasksPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const FocusPage = lazy(() => import("./pages/FocusPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const RoadmapPage = lazy(() => import("./pages/RoadmapPage"));
const PlannerPage = lazy(() => import("./pages/PlannerPage"));
const NotesPage = lazy(() => import("./pages/NotesPage"));
const WhiteboardPage = lazy(() => import("./pages/WhiteboardPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("./pages/auth/VerifyEmailPage"));
const PhoneLoginPage = lazy(() => import("./pages/auth/PhoneLoginPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const DocumentsPage = lazy(() => import("./pages/DocumentsPage"));
const FilesPage = lazy(() => import("./pages/FilesPage"));
const AIAssistantPage = lazy(() => import("./pages/AIAssistantPage"));
const TemplatesPage = lazy(() => import("./pages/TemplatesPage"));
const AutomationsPage = lazy(() => import("./pages/AutomationsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const AgileBoardPage = lazy(() => import("./pages/AgileBoardPage"));
const SprintPlanningPage = lazy(() => import("./pages/SprintPlanningPage"));
const MembersPage = lazy(() => import("./pages/teams/MembersPage"));
const TeamSettingsPage = lazy(() => import("./pages/teams/TeamSettingsPage"));
const OrganizationDashboardPage = lazy(() => import("./pages/OrganizationDashboardPage"));
const MeetingsDashboard = lazy(() => import("./pages/meetings/MeetingsDashboard"));
const MeetingRoom = lazy(() => import("./pages/meetings/MeetingRoom"));
const TamadMeetDashboard = lazy(() => import("./pages/tamad-meet/TamadMeetDashboard"));
const TamadMeetRoom = lazy(() => import("./pages/tamad-meet/room/TamadMeetRoom"));

// Admin Pages
const AdminLayout = lazy(() => import("./components/admin/layout/AdminLayout"));
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminSecurityPage = lazy(() => import("./pages/admin/AdminSecurityPage"));
const AdminHealthPage = lazy(() => import("./pages/admin/AdminHealthPage"));

function LoadingSpinner() {
  return (
    <div className="auth-loading">
      <div className="auth-spinner" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = Boolean(useAuthStore((state) => state.user));
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const init = useAuthStore((state) => state.init);
  const isAuthenticated = Boolean(user);

  useEffect(() => {
    void init();
  }, [init]);

  if (loading) return <LoadingSpinner />;

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
          <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={isAuthenticated ? <VerifyEmailPage /> : <Navigate to="/login" replace />} />
          <Route path="/phone-login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <PhoneLoginPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          <Route
            element={
              <ProtectedRoute>
                <RealtimeProvider>
                  <AppLayout />
                </RealtimeProvider>
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/focus" element={<FocusPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/whiteboard" element={<WhiteboardPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/files" element={<FilesPage />} />
            <Route path="/ai" element={<AIAssistantPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/automations" element={<AutomationsPage />} />
            <Route path="/agile/board" element={<AgileBoardPage />} />
            <Route path="/agile/planning" element={<SprintPlanningPage />} />
            <Route path="/team/members" element={<MembersPage />} />
            <Route path="/team/settings" element={<TeamSettingsPage />} />
            <Route path="/team/:teamId/meetings" element={<MeetingsDashboard />} />
            <Route path="/team/:teamId/meetings/:meetingId/room" element={<MeetingRoom />} />
            <Route path="/team/tamad-meet" element={<TamadMeetDashboard />} />
            <Route path="/team/tamad-meet/room/:roomId" element={<TamadMeetRoom />} />
            <Route path="/org/:id" element={<OrganizationDashboardPage />} />
          </Route>

          {/* Super Admin Control Center */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="security" element={<AdminSecurityPage />} />
            <Route path="health" element={<AdminHealthPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
