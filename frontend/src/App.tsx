import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

import AppLayout from "./components/layout/AppLayout";

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
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";

export default function App() {
  const token = useAuthStore((state) => state.token);
  const init = useAuthStore((state) => state.init);
  const isAuthenticated = Boolean(token);

  useEffect(() => {
    void init();
  }, [init]);

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} />
      <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/" /> : <ForgotPasswordPage />} />

      <Route element={<AppLayout />}>
        <Route
          path="/"
          element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/tasks"
          element={isAuthenticated ? <TasksPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/calendar"
          element={isAuthenticated ? <CalendarPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/roadmap"
          element={isAuthenticated ? <RoadmapPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/focus"
          element={isAuthenticated ? <FocusPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/planner"
          element={isAuthenticated ? <PlannerPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/notes"
          element={isAuthenticated ? <NotesPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/whiteboard"
          element={isAuthenticated ? <WhiteboardPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/analytics"
          element={isAuthenticated ? <AnalyticsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/settings"
          element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/notifications"
          element={isAuthenticated ? <NotificationsPage /> : <Navigate to="/login" />}
        />
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
    </Routes>
  );
}