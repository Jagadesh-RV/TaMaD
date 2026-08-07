import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  Map,
  Zap,
  Target,
  FileText,
  PenTool,
  BarChart3,
  FolderKanban,
  Users,
  Brain,
  HardDrive,
  Video,
  Settings,
  Trophy,
  Timer,
  User,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavLink {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface NavSection {
  label: string;
  links: NavLink[];
}

interface BuildNavOptions {
  isTeam?: boolean;
  teamId?: string;
}

export const PAGE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/tasks': 'Tasks',
  '/calendar': 'Calendar',
  '/projects': 'Projects',
  '/roadmap': 'Roadmap',
  '/focus': 'Focus Mode',
  '/planner': 'Planner',
  '/notes': 'Notes',
  '/documents': 'Documents',
  '/files': 'Files',
  '/whiteboard': 'Whiteboard',
  '/analytics': 'Analytics',
  '/reports': 'Reports',
  '/ai': 'AI Assistant',
  '/templates': 'Templates',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
  '/profile': 'Profile',
  '/agile/board': 'Active Sprint',
  '/agile/planning': 'Backlog',
  '/team/members': 'Members',
  '/team/settings': 'Team Settings',
};

export function pageLabelFor(pathname: string): string {
  for (const [prefix, label] of Object.entries(PAGE_LABELS)) {
    if (pathname === prefix) return label;
  }
  if (pathname.startsWith('/team/') && pathname.includes('/meetings')) return 'Meetings';
  return 'Unknown';
}

export const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  tasks: CheckSquare,
  calendar: CalendarDays,
  projects: FolderKanban,
  roadmap: Map,
  focus: Zap,
  planner: Target,
  notes: FileText,
  documents: FileText,
  files: HardDrive,
  whiteboard: PenTool,
  analytics: BarChart3,
  reports: BarChart3,
  ai: Brain,
  templates: FileText,
  notifications: Zap,
  settings: Settings,
  profile: User,
  sprint: Target,
  backlog: Map,
  members: Users,
  meetings: Video,
  task: CheckSquare,
  project: FolderKanban,
  note: FileText,
  document: FileText,
  member: Users,
  meeting: Video,
};

export const iconForName = (name: string): LucideIcon => ICONS[name] || LayoutDashboard;

export const pageIconFor = (pathname: string): LucideIcon => {
  const map: Record<string, LucideIcon> = {
    '/dashboard': LayoutDashboard,
    '/tasks': CheckSquare,
    '/calendar': CalendarDays,
    '/projects': FolderKanban,
    '/roadmap': Map,
    '/focus': Zap,
    '/planner': Target,
    '/notes': FileText,
    '/documents': FileText,
    '/files': HardDrive,
    '/whiteboard': PenTool,
    '/analytics': BarChart3,
    '/reports': BarChart3,
    '/ai': Brain,
    '/templates': FileText,
    '/notifications': Zap,
    '/settings': Settings,
    '/profile': User,
    '/agile/board': Target,
    '/agile/planning': Map,
    '/team/members': Users,
    '/team/settings': Settings,
  };
  return map[pathname] || LayoutDashboard;
}

export const iconNameFor = (pathname: string): string => {
  const map: Record<string, string> = {
    '/dashboard': 'dashboard',
    '/tasks': 'tasks',
    '/calendar': 'calendar',
    '/projects': 'projects',
    '/roadmap': 'roadmap',
    '/focus': 'focus',
    '/planner': 'planner',
    '/notes': 'notes',
    '/documents': 'documents',
    '/files': 'files',
    '/whiteboard': 'whiteboard',
    '/analytics': 'analytics',
    '/reports': 'reports',
    '/ai': 'ai',
    '/templates': 'templates',
    '/notifications': 'notifications',
    '/settings': 'settings',
    '/profile': 'profile',
    '/agile/board': 'sprint',
    '/agile/planning': 'backlog',
    '/team/members': 'members',
    '/team/settings': 'settings',
  };
  if (pathname.startsWith('/team/') && pathname.includes('/meetings')) return 'meetings';
  return map[pathname] || 'dashboard';
}

export function buildNav({ isTeam = false, teamId }: BuildNavOptions): NavSection[] {
  return [
    {
      label: 'MAIN',
      links: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Tasks', path: '/tasks', icon: CheckSquare },
        { label: 'Calendar', path: '/calendar', icon: CalendarDays },
        { label: 'Projects', path: '/projects', icon: FolderKanban },
        { label: 'Roadmap', path: '/roadmap', icon: Map },
        ...(isTeam
          ? [
              { label: 'Active Sprint', path: '/agile/board', icon: Target },
              { label: 'Backlog', path: '/agile/planning', icon: Map },
            ]
          : [
              { label: 'Focus', path: '/focus', icon: Zap },
              { label: 'Planner', path: '/planner', icon: Target },
            ]),
      ],
    },
    {
      label: 'CREATIVE',
      links: [
        { label: 'Notes', path: '/notes', icon: FileText },
        { label: 'Documents', path: '/documents', icon: FileText },
        { label: 'Files', path: '/files', icon: HardDrive },
        { label: 'Whiteboard', path: '/whiteboard', icon: PenTool },
      ],
    },
    ...(isTeam
      ? [
          {
            label: 'TEAM',
            links: [
              { label: 'Members', path: '/team/members', icon: Users },
              { label: 'Meetings', path: teamId ? `/team/${teamId}/meetings` : '/team/tamad-meet', icon: Video },
              { label: 'TaMaD Meet', path: '/team/tamad-meet', icon: Video },
              { label: 'Team Settings', path: '/team/settings', icon: Settings },
            ],
          } as NavSection,
        ]
      : []),
    {
      label: 'ANALYTICS',
      links: [
        { label: 'Analytics', path: '/analytics', icon: BarChart3 },
        { label: 'Reports', path: '/reports', icon: BarChart3 },
      ],
    },
    {
      label: 'AI & TOOLS',
      links: [
        { label: 'AI Assistant', path: '/ai', icon: Brain },
        { label: 'Planner', path: '/planner', icon: Trophy },
        { label: 'Focus Mode', path: '/focus', icon: Timer },
        { label: 'Templates', path: '/templates', icon: FileText },
      ],
    },
  ];
}
