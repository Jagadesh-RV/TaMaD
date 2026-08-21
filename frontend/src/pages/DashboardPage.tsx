import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, AlertTriangle,
  X, Inbox, FolderKanban, Activity,
  Target, Sparkles, ChevronRight, Zap,
  Plus, ArrowRight, Clock, TrendingUp,
  CheckSquare, Calendar,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { format, startOfWeek, endOfWeek, isToday, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import { useProjectStore } from '../store/projectStore';
import { useRealtime } from '../providers/RealtimeProvider';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonStatGrid, SkeletonList } from '../components/ui/Skeleton';
import TeamDashboardPage from './TeamDashboardPage';
import { Card } from '../components/ui/Card';
import AIInsightPanel from '../components/ai/AIInsightPanel';
import clsx from 'clsx';
import { useInteractionStore } from '../store/interactionStore';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'urgent', label: 'High Priority' },
  { key: 'today', label: 'Due Today' },
  { key: 'in-progress', label: 'In Progress' },
] as const;

const PRIORITY_CONFIG = {
  urgent: { color: 'var(--color-danger)', bg: 'var(--color-danger-light)', label: 'Urgent', dotClass: 'priority-dot-urgent' },
  high:   { color: 'var(--color-warning)', bg: 'var(--color-warning-light)', label: 'High', dotClass: 'priority-dot-high' },
  medium: { color: 'var(--color-accent)', bg: 'var(--color-accent-light)', label: 'Medium', dotClass: 'priority-dot-medium' },
  low:    { color: 'var(--color-muted)', bg: 'var(--color-surface-active)', label: 'Low', dotClass: 'priority-dot-low' },
} as const;

const STATUS_CONFIG = {
  'todo':        { color: 'var(--color-foreground-tertiary)', bg: 'var(--color-surface-active)', label: 'To Do' },
  'in-progress': { color: 'var(--color-accent)', bg: 'var(--color-accent-light)', label: 'In Progress' },
  'review':      { color: 'var(--color-warning)', bg: 'var(--color-warning-light)', label: 'In Review' },
  'done':        { color: 'var(--color-success)', bg: 'var(--color-success-light)', label: 'Done' },
} as const;

function useAuthName() {
  const user = useAuthStore(s => s.user);
  return user?.name?.split(' ')[0] || 'there';
}

function QuickActions() {
  const navigate = useNavigate();
  const { openQuickCreate } = useInteractionStore();

  const actions = [
    { label: 'New Task', icon: CheckSquare, onClick: () => openQuickCreate(), color: 'var(--color-foreground)' },
    { label: 'New Project', icon: FolderKanban, onClick: () => navigate('/projects'), color: 'var(--color-foreground)' },
    { label: 'New Note', icon: Zap, onClick: () => navigate('/notes'), color: 'var(--color-foreground)' },
    { label: 'Focus Now', icon: Target, onClick: () => navigate('/focus'), color: 'var(--color-foreground)' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={a.onClick}
          className="flex items-center gap-3 rounded-xl border transition-all text-left group hover:shadow-sm"
          style={{
            padding: '12px 14px',
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <span
            className="flex items-center justify-center rounded-md shrink-0 transition-all group-hover:scale-105 group-hover:bg-[color:var(--color-foreground)] group-hover:text-[color:var(--color-surface)]"
            style={{ width: 28, height: 28, background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', color: 'var(--color-foreground-secondary)' }}
          >
            <a.icon size={14} />
          </span>
          <span className="text-[13px] font-semibold tracking-tight" style={{ color: 'var(--color-foreground)' }}>
            {a.label}
          </span>
        </button>
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
  icon: Icon,
  onClick,
  critical = false,
}: {
  label: string;
  value: number | string;
  sub: string;
  color: string;
  icon: React.ElementType;
  onClick?: () => void;
  critical?: boolean;
}) {
  return (
    <div
      className="flex flex-col gap-2 rounded-xl border transition-all hover:border-[color:var(--color-foreground-tertiary)] cursor-pointer bg-[color:var(--color-surface)] p-4 shadow-xs"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-widest text-[color:var(--color-foreground-secondary)]">{label}</span>
        <span
          className="flex items-center justify-center rounded-md"
          style={{ width: 24, height: 24, color: critical ? 'var(--color-danger)' : 'var(--color-foreground-secondary)' }}
        >
          <Icon size={14} />
        </span>
      </div>
      <div
        className="text-3xl font-bold leading-none tracking-tight"
        style={{ color: critical ? 'var(--color-danger)' : 'var(--color-foreground)', fontFamily: 'var(--font-display)' }}
      >
        {value}
      </div>
      <span className="text-[12px] font-medium text-[color:var(--color-foreground-tertiary)] mt-1">{sub}</span>
    </div>
  );
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
  const greeting = currentHour < 5 ? 'night' : currentHour < 12 ? 'morning' : currentHour < 18 ? 'afternoon' : 'evening';

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
  const todayTasks = tasks.filter(t => t.dueDate === today && t.status !== 'done').length;

  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    return days.map(day => {
      const dayCompleted = tasks.filter(t => {
        if (!t.updatedAt || t.status !== 'done') return false;
        const u = new Date(t.updatedAt);
        return u >= weekStart && u <= weekEnd && u.toLocaleDateString('en-US', { weekday: 'short' }) === day;
      }).length;
      const dayCreated = tasks.filter(t => {
        if (!t.createdAt) return false;
        const c = new Date(t.createdAt);
        return c >= weekStart && c <= weekEnd && c.toLocaleDateString('en-US', { weekday: 'short' }) === day;
      }).length;
      return { day, completed: dayCompleted, created: dayCreated };
    });
  }, [tasks]);

  const focusTasks = useMemo(() => {
    return [...tasks]
      .filter(t => t.status !== 'done')
      .sort((a, b) => {
        const prio = { urgent: 0, high: 1, medium: 2, low: 3 };
        return (prio[a.priority as keyof typeof prio] ?? 4) - (prio[b.priority as keyof typeof prio] ?? 4);
      })
      .slice(0, 7);
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
      .slice(0, 6);
  }, [tasks]);

  const displayTasks = statusFilter === 'all' ? focusTasks : filteredTasks.slice(0, 7);

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

      {/* Email verification banner */}
      <AnimatePresence>
        {showEmailBanner && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div
              className="flex items-center justify-between gap-4 rounded-xl px-4 py-3"
              style={{
                background: 'var(--color-warning-ghost)',
                border: '1px solid var(--color-warning-light)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle size={15} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
                <span className="text-[13px] font-medium" style={{ color: 'var(--color-warning)' }}>
                  Verify your email to unlock all features
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/verify-email')}
                  className="btn btn-sm"
                  style={{ background: 'var(--color-warning)', color: '#fff', borderRadius: 'var(--radius-md)' }}
                >
                  Verify
                </button>
                <button
                  onClick={handleDismissEmailBanner}
                  className="btn-icon-xs btn-ghost"
                  aria-label="Dismiss"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Header --- */}
      <div className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap mb-1">
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}>
                Good {greeting}, {authName}
              </h1>
              <p className="text-[13px] mt-1.5 font-medium" style={{ color: 'var(--color-foreground-secondary)' }}>
                {format(new Date(), 'EEEE, MMMM d')}
                {overdueTasks > 0 && (
                  <span style={{ color: 'var(--color-danger)' }}>
                    {' '}— {overdueTasks} overdue {overdueTasks === 1 ? 'task' : 'tasks'} need attention
                  </span>
                )}
                {overdueTasks === 0 && inProgressTasks > 0 && (
                  <span>
                    {' '}— {inProgressTasks} {inProgressTasks === 1 ? 'task' : 'tasks'} in flight
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => navigate('/ai')}
              className="group flex items-center gap-1.5 rounded-full border px-4 py-2 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
            >
              <Sparkles size={14} className="group-hover:rotate-12 transition-transform text-[color:var(--color-accent)]" />
              <span className="text-[12px] font-semibold">Ask AI</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* --- Quick actions --- */}
      <QuickActions />

      {/* --- Stat cards --- */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mb-8"
      >
        {tasksLoading ? (
          <SkeletonStatGrid count={4} />
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              label="In Progress"
              value={inProgressTasks}
              sub="active tasks"
              color="var(--color-info)"
              icon={Activity}
              onClick={() => navigate('/tasks')}
            />
            <StatCard
              label="Due Today"
              value={todayTasks}
              sub={todayTasks === 1 ? 'task due' : 'tasks due'}
              color="var(--color-warning)"
              icon={Calendar}
              onClick={() => navigate('/tasks')}
            />
            <StatCard
              label="Overdue"
              value={overdueTasks}
              sub={overdueTasks > 0 ? 'needs attention' : 'all caught up'}
              color={overdueTasks > 0 ? 'var(--color-danger)' : 'var(--color-success)'}
              icon={AlertTriangle}
              onClick={() => navigate('/tasks')}
              critical={overdueTasks > 0}
            />
            <StatCard
              label="Completion"
              value={`${completionRate}%`}
              sub={`${completedTasks} of ${totalTasks} done`}
              color="var(--color-success)"
              icon={TrendingUp}
              onClick={() => navigate('/analytics')}
            />
          </div>
        )}
      </motion.div>

      {/* --- Main grid --- */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">

          {/* Task list with filters */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            <Card className="overflow-hidden">
              {/* Header + tabs */}
              <div className="px-5 pt-5 pb-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-[15px] font-semibold" style={{ color: 'var(--color-foreground)', letterSpacing: '-0.01em' }}>
                      Your focus
                    </h2>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-foreground-tertiary)' }}>
                      {statusFilter === 'all' ? 'Sorted by priority' : 'Filtered view'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/tasks')}
                      className="text-[12px] font-medium flex items-center gap-1 transition-colors"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      All tasks <ArrowRight size={12} />
                    </button>
                  </div>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-1 overflow-x-auto pb-0" style={{ scrollbarWidth: 'none' }}>
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
                        className={clsx('tab-item shrink-0', isActive && 'active')}
                      >
                        {tab.label}
                        <span
                          className="ml-1.5 inline-flex items-center justify-center rounded-full text-[10px] font-bold"
                          style={{
                            minWidth: 18,
                            height: 16,
                            padding: '0 5px',
                            background: isActive ? 'var(--color-accent-light)' : 'var(--color-surface-active)',
                            color: isActive ? 'var(--color-accent)' : 'var(--color-foreground-tertiary)',
                          }}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Task rows */}
              <div>
                {tasksLoading ? (
                  <div className="p-4">
                    <SkeletonList count={5} />
                  </div>
                ) : displayTasks.length === 0 ? (
                  <EmptyState
                    icon={Inbox}
                    title="No tasks here"
                    description={statusFilter === 'all' ? 'Create your first task to get started' : 'No tasks match this filter'}
                    action={statusFilter === 'all' ? { label: 'Create Task', onClick: () => navigate('/tasks') } : undefined}
                  />
                ) : (
                  <div style={{ borderTop: '1px solid var(--color-border-light)' }}>
                    {displayTasks.map((task, i) => {
                      const pConf = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.low;
                      const sConf = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.todo;
                      const isOverdue = task.dueDate && task.dueDate < today && task.status !== 'done';
                      return (
                        <motion.div
                          key={task._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() => navigate('/tasks')}
                          className="group flex cursor-pointer items-center gap-3 px-5 py-3 transition-colors"
                          style={{ borderBottom: i < displayTasks.length - 1 ? '1px solid var(--color-border-light)' : 'none' }}
                        >
                          {/* Priority dot */}
                          <span
                            className={clsx('priority-dot shrink-0', pConf.dotClass)}
                            style={{ opacity: isOverdue ? 1 : 0.9 }}
                          />

                          {/* Title */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium transition-colors"
                              style={{ color: 'var(--color-foreground)' }}>
                              {task.title}
                            </p>
                            {task.dueDate && (
                              <p className="text-[11px] mt-0.5"
                                style={{ color: isOverdue ? 'var(--color-danger)' : 'var(--color-foreground-tertiary)' }}>
                                {isOverdue
                                  ? `Overdue · ${format(parseISO(task.dueDate), 'MMM d')}`
                                  : task.dueDate === today
                                  ? 'Due today'
                                  : format(parseISO(task.dueDate), 'MMM d')}
                              </p>
                            )}
                          </div>

                          {/* Status badge */}
                          <span
                            className="hidden sm:inline-flex badge"
                            style={{ background: sConf.bg, color: sConf.color }}
                          >
                            {sConf.label}
                          </span>

                          {/* Priority badge */}
                          <span
                            className="inline-flex badge"
                            style={{ background: pConf.bg, color: pConf.color }}
                          >
                            {pConf.label}
                          </span>

                          {/* Hover arrow */}
                          <ChevronRight
                            size={14}
                            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--color-foreground-tertiary)' }}
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Weekly chart */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
          >
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-semibold" style={{ color: 'var(--color-foreground)', letterSpacing: '-0.01em' }}>
                    This week
                  </h2>
                  <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-foreground-tertiary)' }}>
                    Completed vs. created
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-medium" style={{ color: 'var(--color-foreground-tertiary)' }}>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--color-accent)' }} />
                    Completed
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--color-border)' }} />
                    Created
                  </span>
                </div>
              </div>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} barGap={4} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: 'var(--color-foreground-tertiary)', fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                      dy={8}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: 'var(--color-foreground-tertiary)', fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'var(--color-surface-hover)', radius: 4 }}
                      contentStyle={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 10,
                        boxShadow: 'var(--shadow-lg)',
                        fontSize: 12,
                        fontWeight: 500,
                        padding: '10px 14px',
                      }}
                      itemStyle={{ color: 'var(--color-foreground)' }}
                      labelStyle={{ color: 'var(--color-foreground-secondary)', fontWeight: 600, marginBottom: 4 }}
                    />
                    <Bar dataKey="completed" name="Completed" fill="var(--color-accent)" radius={[3, 3, 0, 0]} maxBarSize={32} />
                    <Bar dataKey="created" name="Created" fill="var(--color-border)" radius={[3, 3, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">

          {/* AI Insight */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <AIInsightPanel tasks={tasks} projectsCount={projects.length} />
          </motion.div>

          {/* Overdue / Attention */}
          {attentionTasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.16 }}
            >
              <Card className="overflow-hidden">
                <div className="px-5 pt-4 pb-3 flex items-center justify-between"
                  style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} style={{ color: 'var(--color-danger)' }} />
                    <span className="text-[13px] font-semibold" style={{ color: 'var(--color-foreground)' }}>
                      Overdue
                    </span>
                  </div>
                  <span className="badge badge-danger">{attentionTasks.length}</span>
                </div>
                <div className="p-3 space-y-1.5">
                  {attentionTasks.map(task => (
                    <div
                      key={task._id}
                      onClick={() => navigate('/tasks')}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 cursor-pointer transition-colors group"
                      style={{ background: 'var(--color-danger-ghost)' }}
                    >
                      <span className="priority-dot priority-dot-urgent shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium" style={{ color: 'var(--color-foreground)' }}>
                          {task.title}
                        </p>
                        <p className="text-[11px]" style={{ color: 'var(--color-danger)' }}>
                          Was due {format(parseISO(task.dueDate!), 'MMM d')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Active projects */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.22 }}
          >
            <Card className="overflow-hidden">
              <div className="px-5 pt-4 pb-3 flex items-center justify-between"
                style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                <span className="text-[13px] font-semibold" style={{ color: 'var(--color-foreground)' }}>
                  Projects
                </span>
                <button
                  onClick={() => navigate('/projects')}
                  className="text-[12px] font-medium flex items-center gap-1 transition-colors"
                  style={{ color: 'var(--color-accent)' }}
                >
                  View all <ArrowRight size={11} />
                </button>
              </div>
              {projectsLoading ? (
                <div className="p-3 space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3 px-2 py-2 animate-pulse">
                      <div className="rounded-lg shrink-0" style={{ width: 32, height: 32, background: 'var(--color-surface-active)' }} />
                      <div className="flex-1 space-y-1.5">
                        <div className="rounded" style={{ height: 12, width: '60%', background: 'var(--color-surface-active)' }} />
                        <div className="rounded" style={{ height: 10, width: '40%', background: 'var(--color-surface-active)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-[12px]" style={{ color: 'var(--color-foreground-tertiary)' }}>No projects yet</p>
                  <button
                    onClick={() => navigate('/projects')}
                    className="btn btn-xs btn-ghost mt-2"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    <Plus size={12} /> Create project
                  </button>
                </div>
              ) : (
                <div className="p-3 space-y-1">
                  {projects.slice(0, 5).map(project => (
                    <div
                      key={project._id}
                      onClick={() => navigate('/projects')}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 cursor-pointer transition-colors group"
                      style={{ borderRadius: 'var(--radius-md)' }}
                    >
                      <div
                        className="flex shrink-0 items-center justify-center rounded-lg text-white text-[12px] font-bold"
                        style={{
                          width: 30,
                          height: 30,
                          background: project.color || 'var(--color-accent)',
                        }}
                      >
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium" style={{ color: 'var(--color-foreground)' }}>
                          {project.name}
                        </p>
                        {project.description && (
                          <p className="truncate text-[11px] mt-0.5" style={{ color: 'var(--color-foreground-tertiary)' }}>
                            {project.description}
                          </p>
                        )}
                      </div>
                      <ChevronRight size={13} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: 'var(--color-foreground-tertiary)' }} />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Recent activity */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.28 }}
          >
            <Card className="overflow-hidden">
              <div className="px-5 pt-4 pb-3"
                style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                <span className="text-[13px] font-semibold" style={{ color: 'var(--color-foreground)' }}>
                  Recent activity
                </span>
              </div>
              {recentActivities.length === 0 ? (
                <EmptyState icon={Activity} title="No activity yet" description="Start working on tasks" />
              ) : (
                <div className="p-3 space-y-1">
                  {recentActivities.map(task => {
                    const sConf = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.todo;
                    return (
                      <div key={task._id} className="flex items-start gap-2.5 px-2 py-2">
                        <span
                          className="mt-1 flex items-center justify-center rounded-full shrink-0"
                          style={{ width: 20, height: 20, background: sConf.bg, color: sConf.color }}
                        >
                          <CheckCircle2 size={11} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-medium" style={{ color: 'var(--color-foreground)' }}>
                            {task.title}
                          </p>
                          <p className="text-[11px]" style={{ color: 'var(--color-foreground-tertiary)' }}>
                            {sConf.label} · {format(new Date(task.updatedAt), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
