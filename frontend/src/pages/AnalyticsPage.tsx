import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, CheckCircle2, ListTodo, Clock, Zap, Target,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  TASKS, STATUS_DISTRIBUTION, PRIORITY_DISTRIBUTION, WEEKLY_PRODUCTIVITY, TEAM_MEMBERS,
} from '../data/seedData';
import clsx from 'clsx';

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export default function AnalyticsPage() {
  const totalTasks = TASKS.length;
  const completed = TASKS.filter(t => t.status === 'done').length;
  const inProgress = TASKS.filter(t => t.status === 'in-progress').length;
  const efficiency = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

  const teamVelocity = useMemo(() => {
    return TEAM_MEMBERS.map(member => {
      const memberTasks = TASKS.filter(t => t.assignee === member.id);
      const done = memberTasks.filter(t => t.status === 'done').length;
      return { name: member.name.split(' ')[0], tasks: memberTasks.length, completed: done, color: member.avatarColor };
    });
  }, []);

  const stats = [
    { label: 'Tasks Completed', value: completed, sub: `of ${totalTasks} total`, icon: CheckCircle2, color: 'var(--color-success)', bg: 'var(--color-success-light)' },
    { label: 'Completion Rate', value: `${efficiency}%`, sub: 'overall efficiency', icon: TrendingUp, color: 'var(--color-accent)', bg: 'var(--color-accent-light)' },
    { label: 'In Progress', value: inProgress, sub: 'active tasks', icon: Clock, color: 'var(--color-info)', bg: 'var(--color-info-light)' },
    { label: 'Team Velocity', value: `${Math.round(completed / 7 * 10) / 10}`, sub: 'tasks/day avg', icon: Zap, color: 'var(--color-warning)', bg: 'var(--color-warning-light)' },
  ];

  const insights = [
    { title: 'Focus Opportunity', text: `${inProgress} tasks are in progress. Consider finishing before starting new ones.`, icon: Target, color: 'var(--color-info)' },
    { title: 'Great Progress', text: `You've completed ${completed} tasks so far. Keep up the momentum!`, icon: CheckCircle2, color: 'var(--color-success)' },
    { title: 'Priority Alert', text: `${TASKS.filter(t => t.priority === 'urgent').length} urgent tasks need immediate attention.`, icon: Zap, color: 'var(--color-warning)' },
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
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Track productivity and performance insights across your workspace.</p>
      </div>

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
                <BarChart data={WEEKLY_PRODUCTIVITY} barGap={4}>
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
                    data={STATUS_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {STATUS_DISTRIBUTION.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {STATUS_DISTRIBUTION.map(item => (
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
              {PRIORITY_DISTRIBUTION.map(item => {
                const maxVal = Math.max(...PRIORITY_DISTRIBUTION.map(d => d.value));
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

        {/* Team performance */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="xl:col-span-1">
          <div className="card p-5">
            <h3 className="mb-1 text-base font-bold" style={{ color: 'var(--color-foreground)' }}>Team Performance</h3>
            <p className="mb-4 text-xs" style={{ color: 'var(--color-muted)' }}>Tasks completed by member</p>
            <div className="space-y-3">
              {teamVelocity.map(member => {
                const maxTasks = Math.max(...teamVelocity.map(m => m.tasks));
                const width = maxTasks > 0 ? (member.completed / maxTasks) * 100 : 0;
                return (
                  <div key={member.name} className="flex items-center gap-3">
                    <div className="avatar avatar-sm shrink-0" style={{ background: member.color, color: 'white' }}>
                      {member.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium truncate" style={{ color: 'var(--color-foreground)' }}>{member.name}</span>
                        <span className="font-semibold shrink-0" style={{ color: 'var(--color-muted)' }}>{member.completed}/{member.tasks}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--color-border-light)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${width}%`, background: member.color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
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
    </div>
  );
}
