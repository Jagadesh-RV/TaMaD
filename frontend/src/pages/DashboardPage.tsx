import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Clock, AlertTriangle, ArrowUpRight, ArrowDownRight,
  LayoutGrid, Filter, AlertCircle, X, Inbox, FolderKanban, Activity,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell
} from 'recharts';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import { useProjectStore } from '../store/projectStore';
import { EmptyState } from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { SkeletonTable } from '../components/ui/Skeleton';
import { staggerContainer, cardVariant } from '../lib/animations';
import TeamDashboardPage from './TeamDashboardPage';
import { Card } from '../components/ui/Card';
import clsx from 'clsx';

const STATUS_TABS = [
  { key: 'all', label: 'All Tasks' },
  { key: 'urgent', label: 'High Priority' },
  { key: 'today', label: 'Due Today' },
  { key: 'in-progress', label: 'In Progress' },
] as const;

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return { bg: 'var(--color-danger-light)', text: 'var(--color-danger)', dot: 'var(--color-danger)' };
    case 'high': return { bg: 'var(--color-warning-light)', text: 'var(--color-warning)', dot: 'var(--color-warning)' };
    case 'medium': return { bg: 'var(--color-accent-light)', text: 'var(--color-accent)', dot: 'var(--color-accent)' };
    case 'low': return { bg: 'var(--color-surface-active)', text: 'var(--color-muted)', dot: 'var(--color-muted)' };
    default: return { bg: 'var(--color-surface-active)', text: 'var(--color-muted)', dot: 'var(--color-muted)' };
  }
};

const statusColors: Record<string, { bg: string; text: string }> = {
  'todo': { bg: 'var(--color-surface-active)', text: 'var(--color-muted)' },
  'in-progress': { bg: 'var(--color-accent-ghost)', text: 'var(--color-accent)' },
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
  const authName = useAuthName();
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'morning' : currentHour < 18 ? 'afternoon' : 'evening';

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
    { label: 'Total Tasks', value: totalTasks, icon: LayoutGrid, change: `${tasks.length} total`, up: true, color: 'var(--color-accent)', bg: 'var(--color-accent-ghost)' },
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
    <div className="page pb-20">
      <AnimatePresence>
        {showEmailBanner && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between gap-4 rounded-xl px-5 py-4 border bg-warning-light border-warning/20 shadow-xs">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-warning" />
                <span className="text-sm font-semibold text-warning-dark">
                  Please verify your email address to unlock all features
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/verify-email')}
                  className="rounded-full px-4 py-1.5 text-xs font-bold transition-transform hover:scale-105 bg-warning text-white shadow-sm"
                >
                  Verify Now
                </button>
                <button
                  onClick={handleDismissEmailBanner}
                  className="rounded-full p-1.5 transition-colors hover:bg-warning/20 text-warning"
                  aria-label="Dismiss"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="page-header flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[color:var(--color-muted)]">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-[color:var(--color-foreground)]">
            Good {greeting}, {authName}
          </h1>
          <p className="mt-2 text-[color:var(--color-foreground-secondary)] text-sm max-w-xl leading-relaxed">
            Here's what's happening across your workspace today. Stay focused and productive.
          </p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        <Filter size={14} className="text-[color:var(--color-muted)] shrink-0 ml-1 mr-2" />
        {STATUS_TABS.map(tab => {
          const count = tab.key === 'all' ? totalTasks
            : tab.key === 'urgent' ? tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length
            : tab.key === 'today' ? tasks.filter(t => t.dueDate === today).length
            : tasks.filter(t => t.status === 'in-progress').length;
          
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={clsx(
                'relative shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-300 overflow-hidden group border',
                isActive ? 'border-transparent text-white' : 'border-border bg-surface text-[color:var(--color-foreground-secondary)] hover:border-[color:var(--color-foreground-tertiary)]'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="dashboard-tab"
                  className="absolute inset-0 bg-[color:var(--color-foreground)] z-0"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {tab.label}
                <span className={clsx(
                  "rounded-full px-1.5 py-0.5 text-[10px] transition-colors",
                  isActive ? 'bg-white/20 text-white' : 'bg-[color:var(--color-surface-active)] text-[color:var(--color-muted)] group-hover:bg-[color:var(--color-border-light)]'
                )}>
                  {count}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <motion.div 
        variants={staggerContainer} 
        initial="hidden" 
        animate="visible"
        className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={cardVariant}>
              <Card interactive className="p-5 overflow-hidden relative group">
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity" style={{ background: stat.color }} />
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-[color:var(--color-muted)]">{stat.label}</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm" style={{ background: stat.bg, color: stat.color }}>
                    <Icon size={18} strokeWidth={2.5} />
                  </div>
                </div>
                <div className="text-3xl font-extrabold tracking-tight text-[color:var(--color-foreground)]">{stat.value}</div>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: stat.up ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {stat.up ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
                  {stat.change}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="p-6">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[color:var(--color-foreground)]">Weekly Productivity</h2>
                  <p className="mt-1 text-xs text-[color:var(--color-foreground-secondary)]">Tasks completed vs created this week</p>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-wider text-[color:var(--color-muted)]">
                  <span className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-md shadow-xs bg-[color:var(--color-accent)]" /> Completed</span>
                  <span className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-md shadow-xs bg-[color:var(--color-border)]" /> Created</span>
                </div>
              </div>
              <div className="h-72">
                {tasksLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <LoadingSpinner size={24} />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} barGap={6} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--color-muted)', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)', fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: 'var(--color-surface-hover)' }}
                        contentStyle={{
                          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                          borderRadius: '12px', boxShadow: 'var(--shadow-lg)', fontSize: 12, fontWeight: 500,
                          padding: '12px 16px'
                        }}
                        itemStyle={{ color: 'var(--color-foreground)', fontWeight: 600 }}
                      />
                      <Bar dataKey="completed" fill="var(--color-accent)" radius={[4, 4, 0, 0]} maxBarSize={40}>
                        {weeklyData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={`var(--color-accent)`} />
                        ))}
                      </Bar>
                      <Bar dataKey="created" fill="var(--color-border-light)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card className="overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[color:var(--color-foreground)]">Recent Tasks</h2>
                  <p className="mt-1 text-xs text-[color:var(--color-foreground-secondary)]">Latest activity across your workspace</p>
                </div>
                <button
                  onClick={() => navigate('/tasks')}
                  className="text-xs font-bold text-[color:var(--color-accent)] hover:text-[color:var(--color-accent-dark)] transition-colors px-3 py-1.5 rounded-full hover:bg-[color:var(--color-accent-ghost)]"
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
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[color:var(--color-surface-hover)] border-b border-border">
                        <th className="px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-[color:var(--color-muted)]">Task</th>
                        <th className="px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-[color:var(--color-muted)]">Status</th>
                        <th className="px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-[color:var(--color-muted)]">Priority</th>
                        <th className="px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-[color:var(--color-muted)]">Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTasks.map((task, i) => {
                        const pColor = getPriorityColor(task.priority);
                        const sc = statusColors[task.status] || statusColors.todo;
                        const isOverdue = task.dueDate && task.dueDate < today && task.status !== 'done';
                        return (
                          <tr key={task._id} className={clsx("group transition-colors hover:bg-[color:var(--color-surface-hover)] cursor-pointer", i !== recentTasks.length - 1 && "border-b border-border-light")} onClick={() => navigate('/tasks')}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-2.5 w-2.5 shrink-0 rounded-full shadow-xs" style={{ background: pColor.dot }} />
                                <div>
                                  <p className="text-sm font-semibold text-[color:var(--color-foreground)] group-hover:text-[color:var(--color-accent)] transition-colors">{task.title}</p>
                                  {task.tags && task.tags.length > 0 && (
                                    <p className="text-[11px] font-medium mt-0.5 text-[color:var(--color-muted)]">{task.tags[0]}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: sc.bg, color: sc.text }}>
                                {task.status.replace('-', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: pColor.bg, color: pColor.text }}>
                                {task.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={clsx('text-xs font-semibold', isOverdue ? 'text-danger' : 'text-[color:var(--color-muted)]')}>
                                {!task.dueDate ? 'No date' : task.dueDate === today ? 'Today' : task.dueDate < today ? 'Overdue' : format(new Date(task.dueDate), 'MMM d')}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[color:var(--color-foreground)]">Active Projects</h2>
                <button
                  onClick={() => navigate('/projects')}
                  className="text-xs font-bold text-[color:var(--color-accent)] hover:text-[color:var(--color-accent-dark)] transition-colors"
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
                <div className="space-y-3">
                  {projects.slice(0, 4).map(project => (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={project._id} onClick={() => navigate('/projects')} className="group flex items-center gap-4 cursor-pointer rounded-xl p-3 transition-colors bg-[color:var(--color-background)] hover:bg-[color:var(--color-surface-hover)] border border-transparent hover:border-border">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm text-white font-bold text-sm" style={{ background: project.color || 'var(--color-accent)' }}>
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-sm font-bold truncate text-[color:var(--color-foreground)]">{project.name}</span>
                        {project.description && (
                          <span className="block text-[11px] font-medium mt-0.5 truncate text-[color:var(--color-muted)]">{project.description}</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-[color:var(--color-foreground)]">Recent Activity</h2>
                <p className="mt-1 text-xs text-[color:var(--color-foreground-secondary)]">Latest changes in your workspace</p>
              </div>
              <div className="space-y-4">
                {recentActivities.length === 0 ? (
                  <EmptyState
                    icon={Activity}
                    title="No recent activity"
                    description="Start working on tasks to see activity here"
                  />
                ) : (
                  recentActivities.map(task => (
                    <div key={task._id} className="relative pl-4 border-l-2 border-border-light before:absolute before:-left-[5px] before:top-1.5 before:h-2 before:w-2 before:rounded-full before:bg-[color:var(--color-border)] hover:border-[color:var(--color-accent)] hover:before:bg-[color:var(--color-accent)] transition-colors cursor-default">
                      <p className="text-sm font-medium text-[color:var(--color-foreground)] leading-snug">
                        Updated <span className="font-bold text-[color:var(--color-accent)]">{task.title}</span>
                      </p>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-[color:var(--color-muted)]">
                        {task.status.replace('-', ' ')} &middot; {format(new Date(task.updatedAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
