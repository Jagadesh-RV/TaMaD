import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, AlertTriangle,
  Filter, AlertCircle, X, Inbox, FolderKanban, Activity,
  Radio, Target, Sparkles, ChevronRight, Zap,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { format, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import { useProjectStore } from '../store/projectStore';
import { useRealtime } from '../providers/RealtimeProvider';
import { EmptyState } from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { SkeletonTable } from '../components/ui/Skeleton';
import { staggerContainer, cardVariant } from '../lib/animations';
import TeamDashboardPage from './TeamDashboardPage';
import { Card } from '../components/ui/Card';
import AIInsightPanel from '../components/ai/AIInsightPanel';
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
  const { onlineUsers } = useRealtime();
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
  const doneToday = tasks.filter(t => t.status === 'done' && t.updatedAt && isToday(new Date(t.updatedAt))).length;

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

  const weekStory = useMemo(() => {
    const done = weeklyData.reduce((sum, d) => sum + d.completed, 0);
    const created = weeklyData.reduce((sum, d) => sum + d.created, 0);
    return { done, created };
  }, [weeklyData]);

  const storySentence = useMemo(() => {
    const parts: string[] = [];
    if (weekStory.done > 0) parts.push(`you've closed ${weekStory.done} ${weekStory.done === 1 ? 'task' : 'tasks'} this week`);
    if (weekStory.created > 0) parts.push(`opened ${weekStory.created} new ones`);
    if (parts.length === 0) parts.push('the week is just beginning — every surface is yours');
    if (overdueTasks > 0) {
      return `${parts.join(', ')}. ${overdueTasks} item${overdueTasks > 1 ? 's' : ''} need${overdueTasks > 1 ? '' : 's'} your attention right now.`;
    }
    if (inProgressTasks > 0) {
      return `${parts.join(', ')}. ${inProgressTasks} ${inProgressTasks === 1 ? 'item is' : 'items are'} in flight — momentum is alive.`;
    }
    return `${parts.join(', ')}.`;
  }, [weekStory, overdueTasks, inProgressTasks]);

  const pulse = [
    { label: 'In flight now', value: inProgressTasks, icon: Radio, tone: 'var(--color-info)', live: true },
    { label: 'Closed today', value: doneToday, icon: CheckCircle2, tone: 'var(--color-success)', live: true },
    { label: 'Needs attention', value: overdueTasks, icon: AlertTriangle, tone: 'var(--color-danger)', live: true },
    { label: 'Completion', value: completionRate, icon: Target, tone: 'var(--color-accent)', live: false },
  ];

  const recentTasks = filteredTasks.slice(0, 6);

  const focusTasks = useMemo(() => {
    return [...tasks]
      .filter(t => t.status !== 'done')
      .sort((a, b) => {
        const prio = { urgent: 0, high: 1, medium: 2, low: 3 };
        return (prio[a.priority as keyof typeof prio] ?? 4) - (prio[b.priority as keyof typeof prio] ?? 4);
      })
      .slice(0, 5);
  }, [tasks]);

  const attentionTasks = useMemo(() => {
    return [...tasks]
      .filter(t => t.dueDate && t.dueDate < today && t.status !== 'done')
      .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))
      .slice(0, 4);
  }, [tasks, today]);

  const recentActivities = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
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

      {/* ---------------- Narrative hero ---------------- */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="relative mb-8 overflow-hidden rounded-xl border border-border bg-[color:var(--color-surface)] px-8 py-8"
      >
        <div className="relative z-10">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-[color:var(--color-surface)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-muted)]">
              <Zap size={11} className="text-[color:var(--color-accent)]" />
              Command center
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-[color:var(--color-surface)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-foreground-secondary)]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[color:var(--color-success)] opacity-60 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--color-success)]" />
              </span>
              {onlineUsers.length + 1} online now
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[color:var(--color-foreground)]">
            Good {greeting}, {authName}
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[color:var(--color-foreground-secondary)]">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} — {storySentence}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/tasks')}
              className="btn btn-primary btn-md rounded-full"
            >
              Open today <ChevronRight size={16} />
            </button>
            <button
              onClick={() => navigate('/ai')}
              className="btn btn-secondary btn-md rounded-full"
            >
              <Sparkles size={15} className="text-[color:var(--color-accent)]" /> Ask AI
            </button>
          </div>
        </div>
      </motion.div>

      {/* ---------------- Live pulse strip ---------------- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {pulse.map((stat) => {
          const Icon = stat.icon;
          const critical = stat.label === 'Needs attention' && stat.value > 0;
          return (
            <div key={stat.label}>
              <Card
                className="group relative overflow-hidden p-5 cursor-pointer"
                onClick={() => navigate(stat.label === 'In flight now' ? '/tasks' : stat.label === 'Needs attention' ? '/tasks' : '/reports')}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-muted)]">{stat.label}</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${stat.tone}15`, color: stat.tone }}>
                    <Icon size={18} strokeWidth={2} />
                  </div>
                </div>
                <div
                  className={clsx(
                    'text-3xl font-bold tracking-tight',
                    critical ? 'text-danger' : 'text-[color:var(--color-foreground)]',
                  )}
                >
                  {stat.value}{stat.label === 'Completion' ? '%' : ''}
                </div>
                <div className="mt-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: stat.tone }}>
                  {stat.label === 'Needs attention' ? (critical ? 'Respond now' : 'All clear') : stat.label === 'Completion' ? 'of the week done' : 'live now'}
                </div>
              </Card>
            </div>
          );
        })}
      </motion.div>

      {/* ---------------- Focus tabs ---------------- */}
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
                'relative shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                isActive ? 'bg-[color:var(--color-accent)] text-white' : 'bg-surface border border-border text-[color:var(--color-foreground-secondary)] hover:border-[color:var(--color-foreground-tertiary)]'
              )}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                <span className={clsx(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  isActive ? 'bg-white/20 text-white' : 'bg-[color:var(--color-surface-active)] text-[color:var(--color-muted)]'
                )}>
                  {count}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {/* ---------------- Week at a glance ---------------- */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="p-6">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[color:var(--color-foreground)]">The week at a glance</h2>
                  <p className="mt-1 text-xs text-[color:var(--color-foreground-secondary)]">
                    {weekStory.done} closed &middot; {weekStory.created} opened
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-wider text-[color:var(--color-muted)]">
                  <span className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-md shadow-xs bg-[color:var(--color-accent)]" /> Closed</span>
                  <span className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-md shadow-xs bg-[color:var(--color-border)]" /> Opened</span>
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
                      <Bar dataKey="completed" fill="var(--color-accent)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="created" fill="var(--color-border-light)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </motion.div>

          {/* ---------------- Focus today ---------------- */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
            <Card  className="overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[color:var(--color-foreground)]">Your focus today</h2>
                  <p className="mt-1 text-xs text-[color:var(--color-foreground-secondary)]">Ordered by priority — start at the top</p>
                </div>
                <button
                  onClick={() => navigate('/tasks')}
                  className="text-xs font-medium text-[color:var(--color-accent)] hover:text-[color:var(--color-accent-hover)] transition-colors px-3 py-1.5 rounded-lg hover:bg-[color:var(--color-accent-ghost)]"
                >
                  View all
                </button>
              </div>
              <div className="overflow-x-auto">
                {tasksLoading ? (
                  <div className="p-6">
                    <SkeletonTable rows={5} cols={3} />
                  </div>
                ) : recentTasks.length === 0 && focusTasks.length === 0 ? (
                  <EmptyState
                    icon={Inbox}
                    title="No tasks yet"
                    description="Create your first task to get started"
                    action={{ label: 'Create Task', onClick: () => navigate('/tasks') }}
                  />
                ) : (
                  <div className="divide-y divide-[color:var(--color-border-light)]">
                    {(statusFilter === 'all' ? focusTasks : recentTasks).map((task, i) => {
                      const pColor = getPriorityColor(task.priority);
                      const sc = statusColors[task.status] || statusColors.todo;
                      const isOverdue = task.dueDate && task.dueDate < today && task.status !== 'done';
                      return (
                        <motion.div
                          key={task._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 30 }}
                          onClick={() => navigate('/tasks')}
                          className="group flex cursor-pointer items-center gap-4 px-6 py-4 transition-colors hover:bg-[color:var(--color-surface-hover)]"
                        >
                          <div
                            className={clsx('h-2.5 w-2.5 shrink-0 rounded-full', isOverdue && 'animate-pulse')}
                            style={{ background: isOverdue ? 'var(--color-danger)' : pColor.dot, boxShadow: isOverdue ? '0 0 10px var(--color-danger)' : 'none' }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[color:var(--color-foreground)] group-hover:text-[color:var(--color-accent)] transition-colors">
                              {task.title}
                            </p>
                            {task.tags && task.tags.length > 0 && (
                              <p className="truncate text-[11px] font-medium mt-0.5 text-[color:var(--color-muted)]">{task.tags[0].name}</p>
                            )}
                          </div>
                          <span
                            className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                            style={{ background: sc.bg, color: sc.text }}
                          >
                            {task.status.replace('-', ' ')}
                          </span>
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                            style={{ background: pColor.bg, color: pColor.text }}
                          >
                            {task.priority}
                          </span>
                          <span className={clsx('hidden md:block w-20 text-right text-xs font-semibold', isOverdue ? 'text-danger' : 'text-[color:var(--color-muted)]')}>
                            {!task.dueDate ? 'No date' : task.dueDate === today ? 'Today' : task.dueDate < today ? 'Overdue' : format(new Date(task.dueDate), 'MMM d')}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* ---------------- AI teammate ---------------- */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
            <AIInsightPanel tasks={tasks} projectsCount={projects.length} />
          </motion.div>

          {/* ---------------- Attention radar ---------------- */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
            <Card  className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[color:var(--color-foreground)]">Attention radar</h2>
                <span className={clsx(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider',
                  attentionTasks.length > 0 ? 'bg-[color:var(--color-danger-light)] text-danger' : 'bg-[color:var(--color-success-light)] text-[color:var(--color-success)]'
                )}>
                  {attentionTasks.length > 0 ? `${attentionTasks.length} risk` : 'All clear'}
                </span>
              </div>
              {attentionTasks.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--color-success-light)] text-[color:var(--color-success)]">
                    <CheckCircle2 size={26} />
                  </div>
                  <p className="text-sm font-bold text-[color:var(--color-foreground)]">Nothing is burning</p>
                  <p className="mt-1 text-xs font-medium text-[color:var(--color-foreground-secondary)]">Everything is within reach — enjoy the calm.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {attentionTasks.map(task => {
                    const pColor = getPriorityColor(task.priority);
                    return (
                      <div key={task._id} onClick={() => navigate('/tasks')} className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-[color:var(--color-danger-light)] bg-[color:var(--color-danger-light)]/40 p-3 transition-all hover:border-danger/40 hover:bg-[color:var(--color-danger-light)]/70">
                        <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-danger shadow-[0_0_10px_var(--color-danger)]" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-bold text-[color:var(--color-foreground)] group-hover:text-danger transition-colors">{task.title}</p>
                          <p className="text-[11px] font-semibold text-danger mt-0.5">
                            {format(new Date(task.dueDate!), 'MMM d')} &middot; {pColor.text === 'var(--color-muted)' ? 'Due' : task.priority}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </motion.div>

          {/* ---------------- Active projects ---------------- */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card  className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[color:var(--color-foreground)]">Active projects</h2>
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

          {/* ---------------- Recent activity ---------------- */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}>
            <Card  className="p-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-[color:var(--color-foreground)]">Recent activity</h2>
                <p className="mt-1 text-xs text-[color:var(--color-foreground-secondary)]">The workspace in motion</p>
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
