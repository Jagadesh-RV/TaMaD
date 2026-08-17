// ============================================================================
// TaMaD Shared Type Definitions
// Centralized types for the entire platform
// ============================================================================

// ---------------------------------------------------------------------------
// Core Entity Types
// ---------------------------------------------------------------------------

export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  authProvider: 'email' | 'google' | 'phone';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  _id: string;
  name: string;
  type: 'personal' | 'team';
  teamId?: string;
  organizationId?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  organizationId?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  _id: string;
  teamId: string;
  userId: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamInvitation {
  _id: string;
  teamId: string;
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'expired';
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
}

export interface Organization {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Task Types
// ---------------------------------------------------------------------------

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskType = 'task' | 'epic' | 'story' | 'bug';

export interface TaskTag {
  _id: string;
  name: string;
  color?: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type?: TaskType;
  workspaceId: string;
  projectId?: string;
  sprintId?: string;
  epicId?: string;
  assignee?: string;
  reporter?: string;
  tags: TaskTag[];
  dueDate?: string;
  storyPoints?: number;
  estimate?: number;
  order: number;
  parentTaskId?: string;
  dependencies?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilters {
  search?: string;
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  assignee?: string;
  projectId?: string;
  sprintId?: string;
  epicId?: string;
}

// ---------------------------------------------------------------------------
// Project Types
// ---------------------------------------------------------------------------

export type ProjectStatus = 'active' | 'completed' | 'on-hold' | 'archived';
export type ProjectHealth = 'on-track' | 'at-risk' | 'off-track';

export interface Project {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  status: ProjectStatus;
  health?: ProjectHealth;
  workspaceId: string;
  ownerId: string;
  members: string[];
  dueDate?: string;
  startDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Sprint / Agile Types
// ---------------------------------------------------------------------------

export type SprintStatus = 'planned' | 'active' | 'completed';

export interface Sprint {
  _id: string;
  name: string;
  goal?: string;
  projectId: string;
  workspaceId: string;
  status: SprintStatus;
  startDate?: string;
  endDate?: string;
  completedAt?: string;
  capacity?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Epic {
  _id: string;
  title: string;
  description?: string;
  color?: string;
  projectId: string;
  workspaceId: string;
  status: 'open' | 'in-progress' | 'done';
  progress: number;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Notes & Documents
// ---------------------------------------------------------------------------

export interface Note {
  _id: string;
  title: string;
  content: string;
  workspaceId: string;
  tags: string[];
  starred: boolean;
  folderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  _id: string;
  title: string;
  content: string;
  workspaceId: string;
  tags: string[];
  starred: boolean;
  folderId?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

export interface FileItem {
  _id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  workspaceId: string;
  projectId?: string;
  taskId?: string;
  uploadedBy: string;
  starred: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Goals & Habits
// ---------------------------------------------------------------------------

export type GoalStatus = 'not-started' | 'in-progress' | 'completed' | 'cancelled';

export interface Goal {
  _id: string;
  title: string;
  description?: string;
  workspaceId: string;
  status: GoalStatus;
  progress: number;
  dueDate?: string;
  milestones?: GoalMilestone[];
  createdAt: string;
  updatedAt: string;
}

export interface GoalMilestone {
  _id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface Habit {
  _id: string;
  name: string;
  description?: string;
  workspaceId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  currentCount: number;
  streak: number;
  completedDates: string[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Focus / Pomodoro
// ---------------------------------------------------------------------------

export interface FocusSession {
  _id: string;
  workspaceId: string;
  userId: string;
  taskId?: string;
  type: 'pomodoro' | 'deep-work' | 'break';
  duration: number;
  completed: boolean;
  startedAt: string;
  endedAt?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------

export interface CalendarEvent {
  _id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay: boolean;
  workspaceId: string;
  taskId?: string;
  meetingId?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Meetings
// ---------------------------------------------------------------------------

export type MeetingStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export interface Meeting {
  _id: string;
  title: string;
  description?: string;
  workspaceId: string;
  teamId: string;
  scheduledBy: string;
  scheduledAt: string;
  duration: number;
  status: MeetingStatus;
  liveKitRoom?: string;
  participants: MeetingParticipant[];
  createdAt: string;
  updatedAt: string;
}

export interface MeetingParticipant {
  userId: string;
  status: 'invited' | 'accepted' | 'declined' | 'attended';
  joinedAt?: string;
  leftAt?: string;
}

// ---------------------------------------------------------------------------
// TaMaD Meet
// ---------------------------------------------------------------------------

export interface TamadMeetRoom {
  _id: string;
  name: string;
  teamId: string;
  isLocked: boolean;
  hasWaitingRoom: boolean;
  createdAt: string;
}

export interface TamadMeetParticipant {
  _id: string;
  roomId: string;
  userId: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  joinedAt: string;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export type NotificationType =
  | 'task-assigned'
  | 'task-updated'
  | 'task-completed'
  | 'mention'
  | 'comment'
  | 'invitation'
  | 'sprint-started'
  | 'sprint-completed'
  | 'project-updated'
  | 'meeting-scheduled'
  | 'meeting-started'
  | 'meeting-ended'
  | 'goal-completed'
  | 'automation-triggered';

export interface Notification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  workspaceId: string;
  read: boolean;
  link?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------

export interface Comment {
  _id: string;
  content: string;
  authorId: string;
  authorName: string;
  entityType: 'task' | 'note' | 'document' | 'project';
  entityId: string;
  workspaceId: string;
  reactions?: CommentReaction[];
  createdAt: string;
  updatedAt: string;
}

export interface CommentReaction {
  emoji: string;
  userId: string;
}

// ---------------------------------------------------------------------------
// Tags & Categories
// ---------------------------------------------------------------------------

export interface Tag {
  _id: string;
  name: string;
  color?: string;
  workspaceId: string;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  color?: string;
  workspaceId: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Whiteboards
// ---------------------------------------------------------------------------

export interface Whiteboard {
  _id: string;
  title: string;
  workspaceId: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  config: Record<string, unknown>;
  position: { x: number; y: number; w: number; h: number };
}

export interface Dashboard {
  _id: string;
  name: string;
  workspaceId: string;
  userId: string;
  widgets: DashboardWidget[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export interface TaskTemplate {
  _id: string;
  name: string;
  description?: string;
  workspaceId: string;
  tasks: Partial<Task>[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
  tasksByPriority: Record<string, number>;
  tasksByStatus: Record<string, number>;
  weeklyTrend: { day: string; completed: number; created: number }[];
}

// ---------------------------------------------------------------------------
// AI Types
// ---------------------------------------------------------------------------

export interface ParsedTask {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  tags?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// API Response Types
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Socket Event Types
// ---------------------------------------------------------------------------

export interface SocketEvents {
  // Client -> Server
  'join-workspace': (workspaceId: string) => void;
  'leave-workspace': (workspaceId: string) => void;
  'task-update': (data: { taskId: string; updates: Partial<Task> }) => void;
  'typing-start': (data: { workspaceId: string; entityType: string; entityId: string }) => void;
  'typing-stop': (data: { workspaceId: string; entityType: string; entityId: string }) => void;

  // Server -> Client
  'task-updated': (task: Task) => void;
  'task-created': (task: Task) => void;
  'task-deleted': (taskId: string) => void;
  'notification': (notification: Notification) => void;
  'presence-update': (data: { userId: string; status: 'online' | 'offline' }) => void;
  'typing-indicator': (data: { userId: string; entityType: string; entityId: string; isTyping: boolean }) => void;
}

// ---------------------------------------------------------------------------
// Workspace Store Types
// ---------------------------------------------------------------------------

export interface WorkspaceMember {
  userId: string;
  role: string;
  joinedAt: string;
}

// ---------------------------------------------------------------------------
// Navigation Types
// ---------------------------------------------------------------------------

export interface NavLink {
  label: string;
  path: string;
  icon: string;
  badge?: number;
  children?: NavLink[];
}

export interface NavSection {
  label: string;
  links: NavLink[];
}
