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
  StickyNote,
  BookOpen,
  Rocket,
  ListTodo,
  TrendingUp,
  Webhook,
  Bell,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavLink {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavSection {
  label?: string;
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
  '/team/tamad-meet': 'TaMaD Meet',
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
  notes: StickyNote,
  documents: BookOpen,
  files: HardDrive,
  whiteboard: PenTool,
  analytics: BarChart3,
  reports: TrendingUp,
  ai: Brain,
  templates: ListTodo,
  notifications: Bell,
  settings: Settings,
  profile: User,
  sprint: Rocket,
  backlog: ListTodo,
  members: Users,
  meetings: Video,
  meet: Video,
  task: CheckSquare,
  project: FolderKanban,
  note: StickyNote,
  document: BookOpen,
  member: Users,
  meeting: Video,
  automation: Webhook,
  goals: Trophy,
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
    '/notes': StickyNote,
    '/documents': BookOpen,
    '/files': HardDrive,
    '/whiteboard': PenTool,
    '/analytics': BarChart3,
    '/reports': TrendingUp,
    '/ai': Brain,
    '/templates': ListTodo,
    '/notifications': Bell,
    '/settings': Settings,
    '/profile': User,
    '/agile/board': Rocket,
    '/agile/planning': ListTodo,
    '/team/members': Users,
    '/team/settings': Settings,
    '/team/tamad-meet': Video,
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
    '/team/tamad-meet': 'meet',
  };
  if (pathname.startsWith('/team/') && pathname.includes('/meetings')) return 'meetings';
  return map[pathname] || 'dashboard';
}

export function buildNav({ isTeam = false, teamId }: BuildNavOptions): NavSection[] {
  if (!isTeam) {
    return [
      {
        links: [
          { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { label: 'My Tasks', path: '/tasks', icon: CheckSquare },
          { label: 'Projects', path: '/projects', icon: FolderKanban },
          { label: 'Calendar', path: '/calendar', icon: CalendarDays },
          { label: 'Planner', path: '/planner', icon: Target },
        ],
      },
      {
        label: 'Personal',
        links: [
          { label: 'Focus', path: '/focus', icon: Zap },
          { label: 'Goals', path: '/analytics', icon: Trophy },
          { label: 'Roadmap', path: '/roadmap', icon: Map },
        ],
      },
      {
        label: 'Knowledge',
        links: [
          { label: 'Notes', path: '/notes', icon: StickyNote },
          { label: 'Documents', path: '/documents', icon: BookOpen },
          { label: 'Files', path: '/files', icon: HardDrive },
          { label: 'Whiteboard', path: '/whiteboard', icon: PenTool },
        ],
      },
      {
        label: 'Insights',
        links: [
          { label: 'Analytics', path: '/analytics', icon: BarChart3 },
          { label: 'Reports', path: '/reports', icon: TrendingUp },
        ],
      },
      {
        label: 'Tools',
        links: [
          { label: 'AI Assistant', path: '/ai', icon: Brain },
          { label: 'Templates', path: '/templates', icon: ListTodo },
        ],
      },
    ];
  }

  return [
    {
      links: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Tasks', path: '/tasks', icon: CheckSquare },
        { label: 'Projects', path: '/projects', icon: FolderKanban },
        { label: 'Calendar', path: '/calendar', icon: CalendarDays },
        { label: 'Roadmap', path: '/roadmap', icon: Map },
      ],
    },
    {
      label: 'Agile',
      links: [
        { label: 'Active Sprint', path: '/agile/board', icon: Rocket },
        { label: 'Backlog', path: '/agile/planning', icon: ListTodo },
      ],
    },
    {
      label: 'Collaborate',
      links: [
        { label: 'Notes', path: '/notes', icon: StickyNote },
        { label: 'Documents', path: '/documents', icon: BookOpen },
        { label: 'Files', path: '/files', icon: HardDrive },
        { label: 'Whiteboard', path: '/whiteboard', icon: PenTool },
      ],
    },
    {
      label: 'Team',
      links: [
        { label: 'Members', path: '/team/members', icon: Users },
        { label: 'Meetings', path: teamId ? `/team/${teamId}/meetings` : '/team/tamad-meet', icon: Video },
        { label: 'TaMaD Meet', path: '/team/tamad-meet', icon: Video },
        { label: 'Team Settings', path: '/team/settings', icon: Settings },
      ],
    },
    {
      label: 'Insights',
      links: [
        { label: 'Analytics', path: '/analytics', icon: BarChart3 },
        { label: 'Reports', path: '/reports', icon: TrendingUp },
      ],
    },
    {
      label: 'Tools',
      links: [
        { label: 'AI Assistant', path: '/ai', icon: Brain },
        { label: 'Automations', path: '/templates', icon: Webhook },
        { label: 'Templates', path: '/templates', icon: ListTodo },
      ],
    },
  ];
}
