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
  PenTool
} from "lucide-react";

import { NavLink } from "react-router-dom";

const links = [
  {
    label: "Dashboard",
    path: "/",
    icon: <LayoutDashboard size={20} />
  },
  {
    label: "Tasks",
    path: "/tasks",
    icon: <CheckSquare size={20} />
  },
  {
    label: "Calendar",
    path: "/calendar",
    icon: <CalendarDays size={20} />
  },
  {
    label: "Roadmap",
    path: "/roadmap",
    icon: <Map size={20} />
  },
  {
    label: "Focus",
    path: "/focus",
    icon: <Zap size={20} />
  },
  {
    label: "Planner",
    path: "/planner",
    icon: <Target size={20} />
  },
  {
    label: "Notes",
    path: "/notes",
    icon: <FileText size={20} />
  },
  {
    label: "Whiteboard",
    path: "/whiteboard",
    icon: <PenTool size={20} />
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: <BarChart3 size={20} />
  },
  {
    label: "Notifications",
    path: "/notifications",
    icon: <Bell size={20} />
  },
  {
    label: "Profile",
    path: "/profile",
    icon: <User size={20} />
  },
  {
    label: "Settings",
    path: "/settings",
    icon: <Settings size={20} />
  }
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="mb-8 flex justify-center">
        <img src="/logo.png" alt="TaMaD Logo" className="h-32 w-auto object-contain drop-shadow-md" />
      </div>

      <nav className="sidebar-nav flex-1 overflow-y-auto w-full">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === "/"}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}