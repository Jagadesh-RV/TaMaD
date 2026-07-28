import { useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, CheckCircle2, ListTodo, Clock, Zap, Target, Download,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { useTaskStore } from '../store/taskStore';
import { useProjectStore } from '../store/projectStore';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import toast from 'react-hot-toast';

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export default function AnalyticsPage() {
  const { tasks, fetchTasks, loading: tasksLoading, error: tasksError } = useTaskStore();
  const { projects, fetchProjects, loading: projectsLoading, error: projectsError } = useProjectStore();
  const workspace = useAuthStore(s => s.workspace);
  const workspaceId = workspace?._id || '';

  const isLoading = tasksLoading || projectsLoading;
  const error = tasksError || projectsError;

  const retry = useCallback(() => {
    if (workspaceId) {
      fetchTasks(workspaceId);
      fetchProjects(workspaceId);
    }
  }, [fetchTasks, fetchProjects, workspaceId]);

  const exportCSV = useCallback(() => {
    try {
      const header = 'Title,Status,Priority,Project,Created,Updated,Assignee';
      const rows = tasks.map((t: any) => {
        const project = projects.find((p: any) => p._id === t.projectId);
        return [
          `"${(t.title || '').replace(/"/g, '""')}"`,
          t.status || '',
          t.priority || '',
          project?.name || '',
          t.createdAt ? new Date(t.createdAt).toISOString().slice(0, 10) : '',
          t.updatedAt ? new Date(t.updatedAt).toISOString().slice(0, 10) : '',
          t.assigneeName || t.assignee || '',
        ].join(',');
      });
      const csv = [header, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tamad-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Analytics exported as CSV');
    } catch {
      toast.error('Failed to export analytics');
    }
  }, [tasks, projects]);

  useEffect(() => {
    if (workspaceId) {
      fetchTasks(workspaceId);
      fetchProjects(workspaceId);
    }
  }, [fetchTasks, fetchProjects, workspaceId]);

  const totalTasks = tasks.length;
  const completed = tasks.filter((t: any) => t.status === 'done').length;
  const inProgress = tasks.filter((t: any) => t.status === 'in-progress').length;
  const efficiency = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

  const weeklyProductivity = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    return days.map((day, i) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (6 - i));
      const dateStr = date.toISOString().slice(0, 10);
      const completedCount = tasks.filter((t: any) => {
        if (!t.updatedAt) return false;
        return t.updatedAt.slice(0, 10) === dateStr && t.status === 'done';
      }).length;
      const createdCount = tasks.filter((t: any) => {
        if (!t.createdAt) return false;
        return t.createdAt.slice(0, 10) === dateStr;
      }).length;
      return { day, completed: completedCount, created: createdCount };
    });
  }, [tasks]);

  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((t: any) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return [
      { name: 'To Do', value: counts['todo'] || 0, color: 'var(--color-muted)' },
      { name: 'In Progress', value: counts['in-progress'] || 0, color: 'var(--color-accent)' },
      { name: 'Review', value: counts['review'] || 0, color: 'var(--color-warning)' },
      { name: 'Done', value: counts['done'] || 0, color: 'var(--color-success)' },
    ].filter(s => s.value > 0);
  }, [tasks]);

  const priorityDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((t: any) => {
      counts[t.priority] = (counts[t.priority] || 0) + 1;
    });
    return [
      { name: 'Urgent', value: counts['urgent'] || 0, color: 'var(--color-danger)' },
      { name: 'High', value: counts['high'] || 0, color: 'var(--color-warning)' },
      { name: 'Medium', value: counts['medium'] || 0, color: 'var(--color-accent)' },
      { name: 'Low', value: counts['low'] || 0, color: 'var(--color-muted)' },
    ].filter(p => p.value > 0);
  }, [tasks]);

  const stats = [
    { label: 'Tasks Completed', value: completed, sub: `of ${totalTasks} total`, icon: CheckCircle2, color: 'var(--color-success)', bg: 'var(--color-success-light)' },
    { label: 'Completion Rate', value: `${efficiency}%`, sub: 'overall efficiency', icon: TrendingUp, color: 'var(--color-accent)', bg: 'var(--color-accent-light)' },
    { label: 'In Progress', value: inProgress, sub: 'active tasks', icon: Clock, color: 'var(--color-info)', bg: 'var(--color-info-light)' },
    { label: 'Projects', value: projects.length, sub: 'total projects', icon: Zap, color: 'var(--color-warning)', bg: 'var(--color-warning-light)' },
  ];

  const insights = [
    { title: 'Focus Opportunity', text: `${inProgress} tasks are in progress. Consider finishing before starting new ones.`, icon: Target, color: 'var(--color-info)' },
    { title: 'Great Progress', text: `You've completed ${completed} tasks so far. Keep up the momentum!`, icon: CheckCircle2, color: 'var(--color-success)' },
    { title: 'Priority Alert', text: `${tasks.filter((t: any) => t.priority === 'urgent').length} urgent tasks need immediate attention.`, icon: Zap, color: 'var(--color-warning)' },
  ];

  const tooltipStyle = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    boxShadow: 'var(--shadow-medium)',
    fontSize: 13,
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Track productivity and performance insights across your workspace.</p>
        </div>
        {!isLoading && !error && tasks.length > 0 && (
          <button onClick={exportCSV} className="btn btn-ghost btn-sm">
            <Download size={14} />
            Export CSV
          </button>
        )}
      </div>

      {isLoading && <LoadingSpinner text="Loading analytics..." />}

      {!isLoading && error && <ErrorState message={error} onRetry={retry} />}

      {!isLoading && !error && (
        <>
          {/* Stat cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                <p className="mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>{stat.sub}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts grid */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Weekly trend */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="xl:col-span-2">
          <div className="card p-5">
            <h3 className="mb-1 text-base font-bold" style={{ color: 'var(--color-foreground)' }}>Weekly Trend</h3>
            <p className="mb-5 text-xs" style={{ color: 'var(--color-muted)' }}>Tasks completed vs created</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyProductivity} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="completed" fill="var(--color-accent)" radius={[4, 4, 0, 0]} name="Completed" />
                  <Bar dataKey="created" fill="var(--color-border)" radius={[4, 4, 0, 0]} name="Created" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Status distribution */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="card p-5">
            <h3 className="mb-1 text-base font-bold" style={{ color: 'var(--color-foreground)' }}>Status Distribution</h3>
            <p className="mb-4 text-xs" style={{ color: 'var(--color-muted)' }}>Current task breakdown</p>
            <div className="flex h-52 items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {statusDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {statusDistribution.map(item => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: item.color }} />
                  <span style={{ color: 'var(--color-muted)' }}>{item.name}</span>
                  <span className="ml-auto font-semibold" style={{ color: 'var(--color-foreground)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* Priority breakdown */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="card p-5">
            <h3 className="mb-1 text-base font-bold" style={{ color: 'var(--color-foreground)' }}>Priority Breakdown</h3>
            <p className="mb-5 text-xs" style={{ color: 'var(--color-muted)' }}>Tasks by priority level</p>
            <div className="space-y-3">
              {priorityDistribution.map(item => {
                const maxVal = Math.max(...priorityDistribution.map(d => d.value));
                const width = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
                return (
                  <div key={item.name}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium" style={{ color: 'var(--color-foreground)' }}>{item.name}</span>
                      <span className="font-semibold" style={{ color: item.color }}>{item.value}</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--color-border-light)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${width}%` }}
                        transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full"
                        style={{ background: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Project breakdown */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="xl:col-span-1">
          <div className="card p-5">
            <h3 className="mb-1 text-base font-bold" style={{ color: 'var(--color-foreground)' }}>Projects</h3>
            <p className="mb-4 text-xs" style={{ color: 'var(--color-muted)' }}>Active project count</p>
            <div className="space-y-3">
              {projects.slice(0, 5).map((project: any) => {
                const maxTasks = Math.max(...tasks.map((t: any) => 1), 1);
                return (
                  <div key={project._id} className="flex items-center gap-3">
                    <div className="avatar avatar-sm shrink-0" style={{ background: project.color || 'var(--color-accent)', color: 'white' }}>
                      {project.name?.charAt(0) || 'P'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium truncate" style={{ color: 'var(--color-foreground)' }}>{project.name}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {projects.length === 0 && (
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>No projects yet</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* AI Insights */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="card p-5">
            <h3 className="mb-4 text-base font-bold" style={{ color: 'var(--color-foreground)' }}>AI Insights</h3>
            <div className="space-y-3">
              {insights.map((insight, i) => {
                const Icon = insight.icon;
                return (
                  <div key={i} className="rounded-lg p-3.5" style={{ background: 'var(--color-background)' }}>
                    <div className="mb-1.5 flex items-center gap-2">
                      <Icon size={14} style={{ color: insight.color }} />
                      <span className="text-xs font-bold" style={{ color: insight.color }}>{insight.title}</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{insight.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
        </>
      )}
    </div>
  );
}
