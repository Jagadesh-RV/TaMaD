import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  Bell,
  User,
  Settings,
  CalendarDays,
  Map,
  Zap,
  Target,
  FileText,
  PenTool,
  Sparkles,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const links = [
  { label: "Dashboard", path: "/", icon: <LayoutDashboard size={18} /> },
  { label: "Tasks", path: "/tasks", icon: <CheckSquare size={18} /> },
  { label: "Calendar", path: "/calendar", icon: <CalendarDays size={18} /> },
  { label: "Roadmap", path: "/roadmap", icon: <Map size={18} /> },
  { label: "Focus", path: "/focus", icon: <Zap size={18} /> },
  { label: "Planner", path: "/planner", icon: <Target size={18} /> },
  { label: "Notes", path: "/notes", icon: <FileText size={18} /> },
  { label: "Whiteboard", path: "/whiteboard", icon: <PenTool size={18} /> },
  { label: "Analytics", path: "/analytics", icon: <BarChart3 size={18} /> },
  { label: "Notifications", path: "/notifications", icon: <Bell size={18} /> },
  { label: "Profile", path: "/profile", icon: <User size={18} /> },
  { label: "Settings", path: "/settings", icon: <Settings size={18} /> },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--color-accent)]/10 text-[color:var(--color-accent)]">
          <Sparkles size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-[color:var(--color-foreground)]">TaMaD</p>
          <p className="text-xs text-[color:var(--color-muted)]">Studio</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--color-muted)]">Workspace</p>
        <div className="rounded-2xl border border-border bg-[color:var(--color-surface-hover)] p-3 text-sm text-[color:var(--color-foreground)]">
          Product design sprint
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === "/"}
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}