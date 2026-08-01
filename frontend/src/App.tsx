import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

import AppLayout from "./components/layout/AppLayout";
import { RealtimeProvider } from "./providers/RealtimeProvider";

import LandingPage from "./pages/LandingPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import TasksPage from "./pages/TasksPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import FocusPage from "./pages/FocusPage";
import CalendarPage from "./pages/CalendarPage";
import RoadmapPage from "./pages/RoadmapPage";
import PlannerPage from "./pages/PlannerPage";
import NotesPage from "./pages/NotesPage";
import WhiteboardPage from "./pages/WhiteboardPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProjectsPage from "./pages/ProjectsPage";
import ReportsPage from "./pages/ReportsPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import PhoneLoginPage from "./pages/auth/PhoneLoginPage";
import ContactPage from "./pages/ContactPage";
import DocumentsPage from "./pages/DocumentsPage";
import FilesPage from "./pages/FilesPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import TemplatesPage from "./pages/TemplatesPage";
import NotFoundPage from "./pages/NotFoundPage";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import AgileBoardPage from "./pages/AgileBoardPage";
import SprintPlanningPage from "./pages/SprintPlanningPage";
import MembersPage from "./pages/teams/MembersPage";
import TeamSettingsPage from "./pages/teams/TeamSettingsPage";
import OrganizationDashboardPage from "./pages/OrganizationDashboardPage";
import MeetingsDashboard from "./pages/meetings/MeetingsDashboard";
import MeetingRoom from "./pages/meetings/MeetingRoom";
import TamadMeetDashboard from "./pages/tamad-meet/TamadMeetDashboard";
import TamadMeetRoom from "./pages/tamad-meet/room/TamadMeetRoom";

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

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </ErrorBoundary>
  );
}
