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
    { label: 'New Task', icon: CheckSquare, onClick: () => openQuickCreate(), color: 'var(--color-accent)' },
    { label: 'New Project', icon: FolderKanban, onClick: () => navigate('/projects'), color: 'var(--color-success)' },
    { label: 'New Note', icon: Zap, onClick: () => navigate('/notes'), color: 'var(--color-warning)' },
    { label: 'Focus Now', icon: Target, onClick: () => navigate('/focus'), color: 'var(--color-info)' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={a.onClick}
          className="flex items-center gap-2.5 rounded-xl border transition-all text-left group"
          style={{
            padding: '10px 14px',
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <span
            className="flex items-center justify-center rounded-lg shrink-0 transition-transform group-hover:scale-110"
            style={{ width: 32, height: 32, background: a.color + '15', color: a.color }}
          >
            <a.icon size={15} />
          </span>
          <span className="text-[13px] font-medium" style={{ color: 'var(--color-foreground)' }}>
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
      className="stat-card cursor-pointer group"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
    >
      <div className="flex items-center justify-between">
        <span className="stat-card-label">{label}</span>
        <span
          className="flex items-center justify-center rounded-lg"
          style={{ width: 32, height: 32, background: color + '15', color }}
        >
          <Icon size={15} />
        </span>
      </div>
      <div
        className="stat-card-value"
        style={{ color: critical ? 'var(--color-danger)' : 'var(--color-foreground)' }}
      >
        {value}
      </div>
      <span className="stat-card-label">{sub}</span>
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
    <div className="page pb-20 max-w-[1200px] mx-auto pt-6">

      <AnimatePresence>
        {showEmailBanner && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between gap-4 rounded-2xl px-5 py-4" style={{ background: 'var(--color-warning-ghost)', border: '1px solid var(--color-warning-light)' }}>
              <div className="flex items-center gap-3">
                <AlertTriangle size={18} style={{ color: 'var(--color-warning)' }} />
                <span className="text-[14px] font-medium" style={{ color: 'var(--color-warning)' }}>Verify your email to unlock all features</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => navigate('/verify-email')} className="btn btn-sm" style={{ background: 'var(--color-warning)', color: '#fff', borderRadius: 'var(--radius-md)' }}>Verify</button>
                <button onClick={handleDismissEmailBanner} className="btn-icon-sm btn btn-ghost"><X size={14} /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="mb-12 flex items-end justify-between gap-6">
        <div>
          <h1 className="text-[32px] font-display font-semibold tracking-tight text-[color:var(--color-foreground)] leading-tight">
            Good {greeting}, {authName}
          </h1>
          <p className="text-[15px] mt-1 text-[color:var(--color-foreground-secondary)]">
            {format(new Date(), 'EEEE, MMMM d')}
            {overdueTasks > 0 ? (
              <span className="text-[color:var(--color-danger)] font-medium"> — {overdueTasks} overdue</span>
            ) : (
              <span> — Ready to focus?</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => navigate('/ai')} className="btn btn-md btn-secondary shadow-xs">
             <Sparkles size={14} className="text-[color:var(--color-accent)]" />
             Ask AI
           </button>
        </div>
      </header>

      {/* Lanes */}
      <div className="flex flex-col gap-14">
        
        {/* FOCUS LANE */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-display font-semibold tracking-tight">Focus Lane</h2>
            <button onClick={() => navigate('/focus')} className="text-[13px] font-medium text-[color:var(--color-accent)] hover:underline">Enter Focus Mode</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1 flex flex-col gap-3">
              <button onClick={() => navigate('/tasks')} className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-surface hover:border-foreground-tertiary transition-colors shadow-xs text-left">
                <div className="w-10 h-10 rounded-xl bg-accent-ghost text-accent flex items-center justify-center shrink-0">
                  <CheckSquare size={18} />
                </div>
                <div>
                  <div className="text-[14px] font-semibold">{inProgressTasks} Active</div>
                  <div className="text-[12px] text-foreground-tertiary">Tasks in progress</div>
                </div>
              </button>
              <button onClick={() => navigate('/tasks')} className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-surface hover:border-foreground-tertiary transition-colors shadow-xs text-left">
                <div className="w-10 h-10 rounded-xl bg-danger-ghost text-danger flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div className="text-[14px] font-semibold">{overdueTasks} Overdue</div>
                  <div className="text-[12px] text-foreground-tertiary">Needs attention</div>
                </div>
              </button>
            </div>
            
            <div className="lg:col-span-3 flex gap-4 overflow-x-auto pb-4 snap-x" style={{ scrollbarWidth: 'none' }}>
              {focusTasks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center bg-surface/50">
                  <Target size={24} className="text-muted mb-3" />
                  <p className="text-[14px] font-medium">Clear focus</p>
                  <p className="text-[13px] text-foreground-tertiary mt-1">No urgent tasks currently.</p>
                </div>
              ) : (
                focusTasks.slice(0, 3).map(task => (
                  <div
                    key={task._id}
                    role="button"
                    tabIndex={0}
                    className="min-w-[280px] flex-1 rounded-2xl border border-border bg-surface p-5 shadow-xs snap-start hover:border-foreground-tertiary transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
                    onClick={() => navigate('/tasks')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate('/tasks');
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className={`badge badge-${task.priority === 'urgent' ? 'danger' : 'accent'}`}>{task.priority}</span>
                      {task.dueDate && <span className="text-[11px] font-medium text-foreground-tertiary">{format(parseISO(task.dueDate), 'MMM d')}</span>}
                    </div>
                    <h3 className="text-[15px] font-semibold leading-tight mb-2">{task.title}</h3>
                    <p className="text-[13px] text-foreground-secondary line-clamp-2">{task.description || 'No description'}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* TODAY LANE */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-display font-semibold tracking-tight">Today</h2>
            <span className="badge badge-neutral">{todayTasks} due today</span>
          </div>
          <div className="rounded-3xl border border-border bg-surface shadow-xs overflow-hidden">
             {todayTasks === 0 ? (
               <div className="p-8 text-center flex flex-col items-center justify-center">
                 <CheckCircle2 size={32} className="text-success mb-3" />
                 <p className="text-[15px] font-semibold">You're all done for today!</p>
               </div>
             ) : (
               <div className="divide-y divide-border">
                 {filteredTasks.filter(t => t.dueDate === today).map(task => (
                   <div key={task._id} className="flex items-center gap-4 p-4 hover:bg-surface-hover transition-colors cursor-pointer group" onClick={() => navigate('/tasks')}>
                     <div className="w-5 h-5 rounded border-2 border-border group-hover:border-accent transition-colors" />
                     <div className="flex-1">
                       <p className="text-[14px] font-medium">{task.title}</p>
                     </div>
                     <ChevronRight size={16} className="text-foreground-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                 ))}
               </div>
             )}
          </div>
        </section>

        {/* ACTIVITY & INSIGHTS LANE */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-[18px] font-display font-semibold tracking-tight mb-4">Insights</h2>
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-xs h-[300px] flex flex-col">
              <AIInsightPanel tasks={tasks} projectsCount={projects.length} />
            </div>
          </div>
          <div>
            <h2 className="text-[18px] font-display font-semibold tracking-tight mb-4">Recent Activity</h2>
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-xs h-[300px] overflow-y-auto">
               {recentActivities.map(task => (
                 <div key={task._id} className="flex items-start gap-3 mb-4 last:mb-0">
                    <div className="w-8 h-8 rounded-full bg-surface-active flex items-center justify-center shrink-0">
                      <Activity size={14} className="text-foreground-secondary" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium">{task.title}</p>
                      <p className="text-[11px] text-foreground-tertiary">{format(new Date(task.updatedAt), 'MMM d, h:mm a')}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
