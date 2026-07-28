import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

import AppLayout from "./components/layout/AppLayout";
import { RealtimeProvider } from "./providers/RealtimeProvider";

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
import AIAssistantPage from "./pages/AIAssistantPage";

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
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={isAuthenticated ? <VerifyEmailPage /> : <Navigate to="/login" replace />} />
      <Route path="/phone-login" element={isAuthenticated ? <Navigate to="/" replace /> : <PhoneLoginPage />} />
      <Route path="/contact" element={<ContactPage />} />

      <Route
        element={
          <ProtectedRoute>
            <RealtimeProvider>
              <AppLayout />
            </RealtimeProvider>
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
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
        <Route path="/ai" element={<AIAssistantPage />} />
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
}
