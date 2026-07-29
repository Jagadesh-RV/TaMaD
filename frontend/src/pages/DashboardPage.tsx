import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Clock, AlertTriangle, ArrowUpRight, ArrowDownRight,
  LayoutGrid, Filter, AlertCircle, X, Inbox, FolderKanban, Activity,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import { useProjectStore } from '../store/projectStore';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { SkeletonTable } from '../components/ui/Skeleton';
import { staggerContainer, cardVariant } from '../lib/animations';
import TeamDashboardPage from './TeamDashboardPage';
import clsx from 'clsx';

const STATUS_TABS = [
  { key: 'all', label: 'All Tasks' },
  { key: 'urgent', label: 'High Priority' },
  { key: 'today', label: 'Due Today' },
  { key: 'in-progress', label: 'In Progress' },
] as const;

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return { bg: '#fee2e2', text: '#dc2626', dot: '#ef4444' };
    case 'high': return { bg: '#fef3c7', text: '#d97706', dot: '#f59e0b' };
    case 'medium': return { bg: '#dbeafe', text: '#2563eb', dot: '#2563eb' };
    case 'low': return { bg: '#f1f5f9', text: '#64748b', dot: '#94a3b8' };
    default: return { bg: '#f1f5f9', text: '#64748b', dot: '#94a3b8' };
  }
};

const statusColors: Record<string, { bg: string; text: string }> = {
  'todo': { bg: 'var(--color-surface-active)', text: 'var(--color-muted)' },
  'in-progress': { bg: 'var(--color-accent-light)', text: 'var(--color-accent)' },
  'review': { bg: 'var(--color-warning-light)', text: 'var(--color-warning)' },
  'done': { bg: 'var(--color-success-light)', text: 'var(--color-success)' },
};

function useAuthName() {
  const user = useAuthStore(s => s.user);
  return user?.name?.split(' ')[0] || 'there';
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const workspace = useAuthStore(s => s.workspace);
  const user = useAuthStore(s => s.user);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [emailBannerDismissed, setEmailBannerDismissed] = useState(() => {
    if (user?.id) {
      return localStorage.getItem(`email_verify_dismissed_${user.id}`) === 'true';
    }
    return false;
  });
  const { tasks, loading: tasksLoading, fetchTasks } = useTaskStore();
  const { projects, loading: projectsLoading, fetchProjects } = useProjectStore();
  const workspaceId = workspace?._id || '';
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (workspaceId) {
      fetchTasks(workspaceId);
      fetchProjects(workspaceId);
    }
  }, [workspaceId, fetchTasks, fetchProjects]);

  const filteredTasks = useMemo(() => {
    switch (statusFilter) {
      case 'urgent': return tasks.filter(t => t.priority === 'urgent' || t.priority === 'high');
      case 'today': return tasks.filter(t => t.dueDate === today);
      case 'in-progress': return tasks.filter(t => t.status === 'in-progress');
      default: return tasks;
    }
  }, [statusFilter, today, tasks]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const overdueTasks = tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    return days.slice(1).map(day => {
      const dayTasks = tasks.filter(t => {
        if (!t.createdAt) return false;
        const created = new Date(t.createdAt);
        return created >= weekStart && created <= weekEnd &&
          created.toLocaleDateString('en-US', { weekday: 'short' }) === day;
      });
      const completedDayTasks = tasks.filter(t => {
        if (!t.updatedAt || t.status !== 'done') return false;
        const updated = new Date(t.updatedAt);
        return updated >= weekStart && updated <= weekEnd &&
          updated.toLocaleDateString('en-US', { weekday: 'short' }) === day;
      });
      return { day, completed: completedDayTasks.length, created: dayTasks.length };
    });
  }, [tasks]);

  const stats = [
    { label: 'Total Tasks', value: totalTasks, icon: LayoutGrid, change: `${tasks.length} total`, up: true, color: 'var(--color-accent)', bg: 'var(--color-accent-light)' },
    { label: 'Completed', value: completedTasks, icon: CheckCircle2, change: `${completionRate}% rate`, up: true, color: 'var(--color-success)', bg: 'var(--color-success-light)' },
    { label: 'In Progress', value: inProgressTasks, icon: Clock, change: 'Active now', up: true, color: 'var(--color-info)', bg: 'var(--color-info-light)' },
    { label: 'Overdue', value: overdueTasks, icon: AlertTriangle, change: overdueTasks > 0 ? 'Needs attention' : 'All clear', up: false, color: 'var(--color-danger)', bg: 'var(--color-danger-light)' },
  ];

  const recentTasks = filteredTasks.slice(0, 6);

  const recentActivities = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 6);
  }, [tasks]);

  const handleDismissEmailBanner = () => {
    if (user?.id) {
      localStorage.setItem(`email_verify_dismissed_${user.id}`, 'true');
    }
    setEmailBannerDismissed(true);
  };

  const showEmailBanner = user && user.emailVerified === false && user.authProvider === 'email' && !emailBannerDismissed;

  if (workspace?.type === 'team') {
    return <TeamDashboardPage />;
  }

  return (
    <div className="page">
      {/* Email verification banner */}
      {showEmailBanner && (
        <div
          className="mb-6 flex items-center justify-between gap-4 rounded-xl px-4 py-3"
          style={{
            background: 'var(--color-warning-light)',
            border: '1px solid var(--color-warning)',
          }}
        >
          <div className="flex items-center gap-3">
            <AlertCircle size={18} style={{ color: 'var(--color-warning)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--color-warning)' }}>
              Please verify your email address
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/verify-email')}
              className="rounded-lg px-3 py-1.5 text-xs font-bold transition-colors"
              style={{
                background: 'var(--color-warning)',
                color: 'white',
              }}
            >
              Verify Now
            </button>
            <button
              onClick={handleDismissEmailBanner}
              className="rounded-lg p-1 transition-colors"
              style={{ color: 'var(--color-warning)' }}
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="page-header flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--color-muted)' }}>
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
          <h1 className="page-title">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {useAuthName()}
          </h1>
          <p className="page-subtitle mt-1">Here's what's happening across your workspace.</p>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
        <Filter size={14} style={{ color: 'var(--color-muted)' }} className="shrink-0" />
        {STATUS_TABS.map(tab => {
          const count = tab.key === 'all' ? totalTasks
            : tab.key === 'urgent' ? tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length
            : tab.key === 'today' ? tasks.filter(t => t.dueDate === today).length
            : tasks.filter(t => t.status === 'in-progress').length;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={clsx(
                'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all',
              )}
              style={{
                background: statusFilter === tab.key ? 'var(--color-accent-light)' : 'var(--color-surface)',
                borderColor: statusFilter === tab.key ? 'var(--color-accent)' : 'var(--color-border)',
                color: statusFilter === tab.key ? 'var(--color-accent)' : 'var(--color-muted)',
              }}
            >
              {tab.label}
              <span className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]" style={{ background: statusFilter === tab.key ? 'var(--color-accent)' : 'var(--color-surface-active)', color: statusFilter === tab.key ? 'white' : 'var(--color-muted)' }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} custom={i} initial="hidden" animate="visible" variants={cardVariant}>
              <div className="stat-card">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>{stat.label}</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: stat.bg, color: stat.color }}>
                    <Icon size={18} />
                  </div>
                </div>
                <div className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-foreground)' }}>{stat.value}</div>
                <div className="mt-2 flex items-center gap-1 text-xs font-medium" style={{ color: stat.up ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.change}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Left: chart + tasks */}
        <div className="space-y-6 xl:col-span-2">
          {/* Weekly chart */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="card p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>Weekly Productivity</h2>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--color-muted)' }}>Tasks completed vs created this week</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--color-accent)' }} /> Completed</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--color-border)' }} /> Created</span>
                </div>
              </div>
              <div className="h-64">
                {tasksLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <LoadingSpinner size={24} />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                          borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 13,
                        }}
                      />
                      <Bar dataKey="completed" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="created" fill="var(--color-border)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </motion.div>

          {/* Recent tasks */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>Recent Tasks</h2>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--color-muted)' }}>Latest activity across your workspace</p>
                </div>
                <button
                  onClick={() => navigate('/tasks')}
                  className="text-xs font-semibold transition-colors"
                  style={{ color: 'var(--color-accent)' }}
                >
                  View all
                </button>
              </div>
              <div className="overflow-x-auto">
                {tasksLoading ? (
                  <div className="p-6">
                    <SkeletonTable rows={5} cols={4} />
                  </div>
                ) : recentTasks.length === 0 ? (
                  <EmptyState
                    icon={Inbox}
                    title="No tasks yet"
                    description="Create your first task to get started"
                    action={{ label: 'Create Task', onClick: () => navigate('/tasks') }}
                  />
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTasks.map(task => {
                        const pColor = getPriorityColor(task.priority);
                        const sc = statusColors[task.status] || statusColors.todo;
                        const isOverdue = task.dueDate && task.dueDate < today && task.status !== 'done';
                        return (
                          <tr key={task._id}>
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: pColor.dot }} />
                                <div>
                                  <p className="font-medium" style={{ color: 'var(--color-foreground)' }}>{task.title}</p>
                                  {task.tags && task.tags.length > 0 && (
                                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{task.tags[0].name}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="badge" style={{ background: sc.bg, color: sc.text }}>
                                {task.status.replace('-', ' ')}
                              </span>
                            </td>
                            <td>
                              <span className="badge" style={{ background: pColor.bg, color: pColor.text }}>
                                {task.priority}
                              </span>
                            </td>
                            <td>
                              <span className={clsx('text-xs font-medium', isOverdue && 'font-bold')} style={{ color: isOverdue ? 'var(--color-danger)' : 'var(--color-muted)' }}>
                                {!task.dueDate ? 'No date' : task.dueDate === today ? 'Today' : task.dueDate < today ? 'Overdue' : task.dueDate}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: projects + activity */}
        <div className="space-y-6">
          {/* Active projects */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>Active Projects</h2>
                <button
                  onClick={() => navigate('/projects')}
                  className="text-xs font-semibold transition-colors"
                  style={{ color: 'var(--color-accent)' }}
                >
                  View all
                </button>
              </div>
              {projectsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size={16} />
                </div>
              ) : projects.length === 0 ? (
                <EmptyState
                  icon={FolderKanban}
                  title="No projects yet"
                  description="Create your first project to get started"
                  action={{ label: 'Create Project', onClick: () => navigate('/projects') }}
                />
              ) : (
                <div className="space-y-4">
                  {projects.slice(0, 4).map(project => (
                    <div key={project._id} className="group cursor-pointer rounded-lg p-3 transition-all" style={{ background: 'var(--color-background)' }}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-3 w-3 shrink-0 rounded-full" style={{ background: project.color }} />
                        <span className="text-sm font-semibold truncate" style={{ color: 'var(--color-foreground)' }}>{project.name}</span>
                      </div>
                      {project.description && (
                        <p className="text-xs mb-2 truncate" style={{ color: 'var(--color-muted)' }}>{project.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent activity */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="card p-5">
              <div className="mb-4">
                <h2 className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>Recent Activity</h2>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--color-muted)' }}>Latest changes in your workspace</p>
              </div>
              <div className="space-y-3">
                {recentActivities.length === 0 ? (
                  <EmptyState
                    icon={Activity}
                    title="No recent activity"
                    description="Start working on tasks to see activity here"
                  />
                ) : (
                  recentActivities.map(task => (
                    <div key={task._id} className="flex items-start gap-3 rounded-lg p-2 transition-colors" style={{ background: 'var(--color-background)' }}>
                      <div className="avatar avatar-sm shrink-0" style={{ background: getPriorityColor(task.priority).dot, color: 'white' }}>
                        {task.title.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-foreground)' }}>
                          <span className="font-medium" style={{ color: 'var(--color-accent)' }}>{task.title}</span>
                        </p>
                        <p className="mt-0.5 text-[11px]" style={{ color: 'var(--color-muted)' }}>
                          {task.status.replace('-', ' ')} &middot; {format(new Date(task.updatedAt), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
