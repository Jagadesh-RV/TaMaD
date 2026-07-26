import { format, subDays, addDays, startOfWeek, addWeeks } from 'date-fns';

const now = new Date();
const today = format(now, 'yyyy-MM-dd');
const yesterday = format(subDays(now, 1), 'yyyy-MM-dd');
const tomorrow = format(addDays(now, 1), 'yyyy-MM-dd');
const nextWeek = format(addDays(now, 7), 'yyyy-MM-dd');
const in3Days = format(addDays(now, 3), 'yyyy-MM-dd');
const lastWeek = format(subDays(now, 5), 'yyyy-MM-dd');

export const TEAM_MEMBERS = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@tamad.io', role: 'Product Lead', avatarColor: '#6366f1', initials: 'SC' },
  { id: '2', name: 'Marcus Johnson', email: 'marcus@tamad.io', role: 'Engineering', avatarColor: '#2563eb', initials: 'MJ' },
  { id: '3', name: 'Priya Patel', email: 'priya@tamad.io', role: 'Design', avatarColor: '#d946ef', initials: 'PP' },
  { id: '4', name: 'Alex Rivera', email: 'alex@tamad.io', role: 'Marketing', avatarColor: '#f59e0b', initials: 'AR' },
  { id: '5', name: 'Kim Tanaka', email: 'kim@tamad.io', role: 'Engineering', avatarColor: '#10b981', initials: 'KT' },
  { id: '6', name: 'Jordan Lee', email: 'jordan@tamad.io', role: 'QA Lead', avatarColor: '#ef4444', initials: 'JL' },
];

export const PROJECTS = [
  {
    id: 'p1',
    name: 'TaMaD v2.0',
    description: 'Complete platform redesign with AI features',
    color: '#6366f1',
    progress: 68,
    totalTasks: 42,
    completedTasks: 29,
    members: ['1', '2', '3', '5'],
    status: 'active',
    dueDate: nextWeek,
  },
  {
    id: 'p2',
    name: 'Marketing Launch',
    description: 'Q3 product launch campaign and materials',
    color: '#f59e0b',
    progress: 45,
    totalTasks: 20,
    completedTasks: 9,
    members: ['1', '4'],
    status: 'active',
    dueDate: in3Days,
  },
  {
    id: 'p3',
    name: 'Mobile App',
    description: 'React Native companion app',
    color: '#10b981',
    progress: 22,
    totalTasks: 35,
    completedTasks: 8,
    members: ['2', '5', '6'],
    status: 'active',
    dueDate: nextWeek,
  },
  {
    id: 'p4',
    name: 'Design System',
    description: 'Component library and design tokens',
    color: '#d946ef',
    progress: 85,
    totalTasks: 16,
    completedTasks: 14,
    members: ['3', '1'],
    status: 'active',
    dueDate: tomorrow,
  },
];

export const TAGS = ['frontend', 'backend', 'design', 'marketing', 'bug', 'feature', 'infra', 'docs', 'urgent', 'research'];

export const TASKS = [
  {
    _id: 't1',
    title: 'Finalize onboarding flow wireframes',
    description: 'Complete low-fi wireframes for the new user onboarding experience. Include accessibility review.',
    status: 'done',
    priority: 'high',
    projectId: 'p1',
    assignee: '3',
    tags: ['design', 'frontend'],
    dueDate: yesterday,
    createdAt: lastWeek,
    order: 1000,
  },
  {
    _id: 't2',
    title: 'Set up CI/CD pipeline for staging',
    description: 'Configure GitHub Actions for automated deployment to the staging environment.',
    status: 'done',
    priority: 'urgent',
    projectId: 'p1',
    assignee: '2',
    tags: ['infra', 'backend'],
    dueDate: yesterday,
    createdAt: lastWeek,
    order: 2000,
  },
  {
    _id: 't3',
    title: 'Write blog post for v2.0 announcement',
    description: 'Draft a 1500-word blog post covering key features and release timeline.',
    status: 'review',
    priority: 'medium',
    projectId: 'p2',
    assignee: '4',
    tags: ['marketing', 'docs'],
    dueDate: today,
    createdAt: subDays(now, 3),
    order: 3000,
  },
  {
    _id: 't4',
    title: 'Implement real-time collaboration engine',
    description: 'Build WebSocket-based collaborative editing for notes and whiteboards.',
    status: 'in-progress',
    priority: 'high',
    projectId: 'p1',
    assignee: '5',
    tags: ['backend', 'feature'],
    dueDate: tomorrow,
    createdAt: subDays(now, 5),
    order: 4000,
  },
  {
    _id: 't5',
    title: 'Design analytics dashboard charts',
    description: 'Create chart components for task completion, time tracking, and team velocity.',
    status: 'in-progress',
    priority: 'medium',
    projectId: 'p1',
    assignee: '3',
    tags: ['design', 'frontend'],
    dueDate: in3Days,
    createdAt: subDays(now, 4),
    order: 5000,
  },
  {
    _id: 't6',
    title: 'Audit accessibility compliance',
    description: 'Run full WCAG 2.1 AA audit on all public-facing pages.',
    status: 'todo',
    priority: 'high',
    projectId: 'p1',
    assignee: '6',
    tags: ['frontend', 'research'],
    dueDate: in3Days,
    createdAt: subDays(now, 2),
    order: 6000,
  },
  {
    _id: 't7',
    title: 'Prepare investor demo deck',
    description: 'Build a 12-slide presentation with live product demo and key metrics.',
    status: 'todo',
    priority: 'urgent',
    projectId: 'p2',
    assignee: '1',
    tags: ['marketing'],
    dueDate: tomorrow,
    createdAt: subDays(now, 2),
    order: 7000,
  },
  {
    _id: 't8',
    title: 'Optimize database query performance',
    description: 'Profile and optimize the slow queries identified in the last sprint. Target 50% improvement.',
    status: 'in-progress',
    priority: 'high',
    projectId: 'p1',
    assignee: '2',
    tags: ['backend', 'infra'],
    dueDate: nextWeek,
    createdAt: subDays(now, 6),
    order: 8000,
  },
  {
    _id: 't9',
    title: 'Write API documentation',
    description: 'Document all v2 REST endpoints with request/response examples.',
    status: 'todo',
    priority: 'medium',
    projectId: 'p1',
    assignee: '5',
    tags: ['docs', 'backend'],
    dueDate: nextWeek,
    createdAt: subDays(now, 3),
    order: 9000,
  },
  {
    _id: 't10',
    title: 'Create social media content calendar',
    description: 'Plan 4 weeks of social posts across Twitter, LinkedIn, and Product Hunt.',
    status: 'review',
    priority: 'medium',
    projectId: 'p2',
    assignee: '4',
    tags: ['marketing'],
    dueDate: today,
    createdAt: subDays(now, 4),
    order: 10000,
  },
  {
    _id: 't11',
    title: 'Fix auth token refresh race condition',
    description: 'Intercept 401 errors and queue concurrent requests while refreshing.',
    status: 'todo',
    priority: 'urgent',
    projectId: 'p1',
    assignee: '2',
    tags: ['bug', 'backend'],
    dueDate: today,
    createdAt: subDays(now, 1),
    order: 11000,
  },
  {
    _id: 't12',
    title: 'Build dark mode theme system',
    description: 'Implement CSS custom properties and theme toggle for light/dark modes.',
    status: 'done',
    priority: 'medium',
    projectId: 'p4',
    assignee: '3',
    tags: ['design', 'frontend'],
    dueDate: lastWeek,
    createdAt: subDays(now, 8),
    order: 12000,
  },
  {
    _id: 't13',
    title: 'Set up error monitoring with Sentry',
    description: 'Integrate Sentry for frontend and backend error tracking.',
    status: 'done',
    priority: 'high',
    projectId: 'p1',
    assignee: '5',
    tags: ['infra'],
    dueDate: lastWeek,
    createdAt: subDays(now, 10),
    order: 13000,
  },
  {
    _id: 't14',
    title: 'Mobile navigation prototype',
    description: 'Create interactive prototype for the mobile bottom navigation and swipe gestures.',
    status: 'todo',
    priority: 'medium',
    projectId: 'p3',
    assignee: '3',
    tags: ['design', 'frontend'],
    dueDate: nextWeek,
    createdAt: subDays(now, 2),
    order: 14000,
  },
  {
    _id: 't15',
    title: 'Performance load testing',
    description: 'Run k6 load tests simulating 1000 concurrent users on the API.',
    status: 'todo',
    priority: 'high',
    projectId: 'p1',
    assignee: '6',
    tags: ['infra', 'backend'],
    dueDate: nextWeek,
    createdAt: subDays(now, 1),
    order: 15000,
  },
];

export const ACTIVITIES = [
  { id: 'a1', user: TEAM_MEMBERS[0], action: 'completed', target: 'Finalize onboarding flow wireframes', time: '2 min ago', type: 'completion' },
  { id: 'a2', user: TEAM_MEMBERS[1], action: 'pushed to', target: 'Set up CI/CD pipeline for staging', time: '15 min ago', type: 'update' },
  { id: 'a3', user: TEAM_MEMBERS[2], action: 'commented on', target: 'Design analytics dashboard charts', time: '1 hr ago', type: 'comment' },
  { id: 'a4', user: TEAM_MEMBERS[4], action: 'started', target: 'Implement real-time collaboration engine', time: '2 hr ago', type: 'start' },
  { id: 'a5', user: TEAM_MEMBERS[3], action: 'submitted for review', target: 'Write blog post for v2.0 announcement', time: '3 hr ago', type: 'review' },
  { id: 'a6', user: TEAM_MEMBERS[5], action: 'flagged', target: 'Fix auth token refresh race condition', time: '5 hr ago', type: 'flag' },
  { id: 'a7', user: TEAM_MEMBERS[0], action: 'created project', target: 'Marketing Launch', time: '1 day ago', type: 'create' },
  { id: 'a8', user: TEAM_MEMBERS[1], action: 'merged PR in', target: 'Set up CI/CD pipeline for staging', time: '1 day ago', type: 'merge' },
];

export const WEEKLY_PRODUCTIVITY = [
  { day: 'Mon', completed: 8, created: 5 },
  { day: 'Tue', completed: 12, created: 7 },
  { day: 'Wed', completed: 6, created: 9 },
  { day: 'Thu', completed: 15, created: 4 },
  { day: 'Fri', completed: 10, created: 6 },
  { day: 'Sat', completed: 3, created: 1 },
  { day: 'Sun', completed: 2, created: 0 },
];

export const PRIORITY_DISTRIBUTION = [
  { name: 'Urgent', value: 3, color: '#ef4444' },
  { name: 'High', value: 5, color: '#f59e0b' },
  { name: 'Medium', value: 5, color: '#2563eb' },
  { name: 'Low', value: 2, color: '#94a3b8' },
];

export const STATUS_DISTRIBUTION = [
  { name: 'To Do', value: 7, color: '#94a3b8' },
  { name: 'In Progress', value: 3, color: '#2563eb' },
  { name: 'Review', value: 2, color: '#f59e0b' },
  { name: 'Done', value: 3, color: '#10b981' },
];

export const NOTIFICATIONS_DATA = [
  { id: 'n1', title: 'Task deadline approaching', body: 'Prepare investor demo deck is due tomorrow', type: 'warning', time: '5 min ago', read: false },
  { id: 'n2', title: 'New comment on your task', body: 'Priya commented on "Design analytics dashboard charts"', type: 'info', time: '1 hr ago', read: false },
  { id: 'n3', title: 'Sprint completed', body: 'Design System project reached 85% completion', type: 'success', time: '3 hr ago', read: true },
  { id: 'n4', title: 'Urgent task assigned', body: 'Fix auth token refresh race condition assigned to Marcus', type: 'danger', time: '5 hr ago', read: true },
  { id: 'n5', title: 'Weekly report ready', body: 'Your productivity report for this week is available', type: 'info', time: '1 day ago', read: true },
  { id: 'n6', title: 'Project milestone reached', body: 'TaMaD v2.0 completed 68% of tasks', type: 'success', time: '2 days ago', read: true },
];

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return { bg: '#fee2e2', text: '#dc2626', dot: '#ef4444' };
    case 'high': return { bg: '#fef3c7', text: '#d97706', dot: '#f59e0b' };
    case 'medium': return { bg: '#dbeafe', text: '#2563eb', dot: '#2563eb' };
    case 'low': return { bg: '#f1f5f9', text: '#64748b', dot: '#94a3b8' };
    default: return { bg: '#f1f5f9', text: '#64748b', dot: '#94a3b8' };
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'todo': return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
    case 'in-progress': return { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' };
    case 'review': return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
    case 'done': return { bg: '#d1fae5', text: '#047857', border: '#a7f3d0' };
    default: return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
  }
};
