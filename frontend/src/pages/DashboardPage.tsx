import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Clock, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight,
  LayoutGrid, BarChart3, Zap, Filter,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { format } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { TASKS, ACTIVITIES, WEEKLY_PRODUCTIVITY, PROJECTS, TEAM_MEMBERS, getPriorityColor } from '../data/seedData';
import clsx from 'clsx';

const STATUS_TABS = [
  { key: 'all', label: 'All Tasks' },
  { key: 'urgent', label: 'High Priority' },
  { key: 'today', label: 'Due Today' },
  { key: 'in-progress', label: 'In Progress' },
] as const;

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export default function DashboardPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const today = format(new Date(), 'yyyy-MM-dd');

  const filteredTasks = useMemo(() => {
    switch (statusFilter) {
      case 'urgent': return TASKS.filter(t => t.priority === 'urgent' || t.priority === 'high');
      case 'today': return TASKS.filter(t => t.dueDate === today);
      case 'in-progress': return TASKS.filter(t => t.status === 'in-progress');
      default: return TASKS;
    }
  }, [statusFilter, today]);

  const totalTasks = TASKS.length;
  const completedTasks = TASKS.filter(t => t.status === 'done').length;
  const inProgressTasks = TASKS.filter(t => t.status === 'in-progress').length;
  const overdueTasks = TASKS.filter(t => t.dueDate < today && t.status !== 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    { label: 'Total Tasks', value: totalTasks, icon: LayoutGrid, change: '+3 this week', up: true, color: 'var(--color-accent)', bg: 'var(--color-accent-light)' },
    { label: 'Completed', value: completedTasks, icon: CheckCircle2, change: `${completionRate}% rate`, up: true, color: 'var(--color-success)', bg: 'var(--color-success-light)' },
    { label: 'In Progress', value: inProgressTasks, icon: Clock, change: 'On track', up: true, color: 'var(--color-info)', bg: 'var(--color-info-light)' },
    { label: 'Overdue', value: overdueTasks, icon: AlertTriangle, change: overdueTasks > 0 ? 'Needs attention' : 'All clear', up: false, color: 'var(--color-danger)', bg: 'var(--color-danger-light)' },
  ];

  const recentTasks = filteredTasks.slice(0, 6);

  const activityIcons: Record<string, string> = {
    completion: '✓', update: '↻', comment: '💬', start: '▶', review: '👁', flag: '⚑', create: '+', merge: '⑂',
  };

  return (
    <div className="page">
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
            : tab.key === 'urgent' ? TASKS.filter(t => t.priority === 'urgent' || t.priority === 'high').length
            : tab.key === 'today' ? TASKS.filter(t => t.dueDate === today).length
            : TASKS.filter(t => t.status === 'in-progress').length;
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
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={WEEKLY_PRODUCTIVITY} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                        borderRadius: 8, boxShadow: 'var(--shadow-medium)', fontSize: 13,
                      }}
                    />
                    <Bar dataKey="completed" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="created" fill="var(--color-border)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
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
                  onClick={() => window.location.href = '/tasks'}
                  className="text-xs font-semibold transition-colors"
                  style={{ color: 'var(--color-accent)' }}
                >
                  View all
                </button>
              </div>
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Assignee</th>
                      <th>Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTasks.map(task => {
                      const pColor = getPriorityColor(task.priority);
                      const assignee = TEAM_MEMBERS.find(m => m.id === task.assignee);
                      const statusColors: Record<string, { bg: string; text: string }> = {
                        'todo': { bg: 'var(--color-surface-active)', text: 'var(--color-muted)' },
                        'in-progress': { bg: 'var(--color-accent-light)', text: 'var(--color-accent)' },
                        'review': { bg: 'var(--color-warning-light)', text: 'var(--color-warning)' },
                        'done': { bg: 'var(--color-success-light)', text: 'var(--color-success)' },
                      };
                      const sc = statusColors[task.status] || statusColors.todo;
                      const isOverdue = task.dueDate < today && task.status !== 'done';
                      return (
                        <tr key={task._id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: pColor.dot }} />
                              <div>
                                <p className="font-medium" style={{ color: 'var(--color-foreground)' }}>{task.title}</p>
                                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{task.tags[0]}</p>
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
                            <div className="flex items-center gap-2">
                              <div className="avatar avatar-sm" style={{ background: assignee?.avatarColor || '#94a3b8', color: 'white' }}>
                                {assignee?.initials || '?'}
                              </div>
                              <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{assignee?.name?.split(' ')[0]}</span>
                            </div>
                          </td>
                          <td>
                            <span className={clsx('text-xs font-medium', isOverdue && 'font-bold')} style={{ color: isOverdue ? 'var(--color-danger)' : 'var(--color-muted)' }}>
                              {task.dueDate === today ? 'Today' : task.dueDate < today ? 'Overdue' : task.dueDate}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
                <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>{PROJECTS.length} projects</span>
              </div>
              <div className="space-y-4">
                {PROJECTS.map(project => (
                  <div key={project.id} className="group cursor-pointer rounded-lg p-3 transition-all" style={{ background: 'var(--color-background)' }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-3 w-3 shrink-0 rounded-full" style={{ background: project.color }} />
                      <span className="text-sm font-semibold truncate" style={{ color: 'var(--color-foreground)' }}>{project.name}</span>
                    </div>
                    <div className="mb-1.5 flex items-center justify-between text-xs" style={{ color: 'var(--color-muted)' }}>
                      <span>{project.completedTasks}/{project.totalTasks} tasks</span>
                      <span className="font-semibold" style={{ color: project.color }}>{project.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${project.progress}%`, background: project.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Team activity */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="card p-5">
              <div className="mb-4">
                <h2 className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>Team Activity</h2>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--color-muted)' }}>Recent actions from your team</p>
              </div>
              <div className="space-y-3">
                {ACTIVITIES.slice(0, 6).map(activity => (
                  <div key={activity.id} className="flex items-start gap-3 rounded-lg p-2 transition-colors" style={{ background: 'var(--color-background)' }}>
                    <div className="avatar avatar-sm shrink-0" style={{ background: activity.user.avatarColor, color: 'white' }}>
                      {activity.user.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-foreground)' }}>
                        <span className="font-semibold">{activity.user.name.split(' ')[0]}</span>
                        {' '}{activity.action}{' '}
                        <span className="font-medium" style={{ color: 'var(--color-accent)' }}>{activity.target}</span>
                      </p>
                      <p className="mt-0.5 text-[11px]" style={{ color: 'var(--color-muted)' }}>{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function useAuthName() {
  const user = useAuthStore(s => s.user);
  return user?.name?.split(' ')[0] || 'there';
}
