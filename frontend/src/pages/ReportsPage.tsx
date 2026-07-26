import { useState } from 'react';
import {
  Download,
  Clock,
  CheckCircle2,
  TrendingUp,
  Zap,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  WEEKLY_PRODUCTIVITY,
  PRIORITY_DISTRIBUTION,
  STATUS_DISTRIBUTION,
  TEAM_MEMBERS,
  TASKS,
} from '../data/seedData';

const SUMMARY_STATS = [
  {
    label: 'Total Hours',
    value: '142h',
    change: '+12%',
    positive: true,
    icon: Clock,
  },
  {
    label: 'Tasks Completed',
    value: '24',
    change: '+8 this week',
    positive: true,
    icon: CheckCircle2,
  },
  {
    label: 'Team Velocity',
    value: '9.2',
    change: '+1.4 pts',
    positive: true,
    icon: TrendingUp,
  },
  {
    label: 'Productivity Score',
    value: '87%',
    change: '+3%',
    positive: true,
    icon: Zap,
  },
];

const DATE_RANGES = ['This Week', 'This Month', 'Last 3 Months', 'Year'];

const TEAM_PERFORMANCE = [
  { name: 'Sarah', tasks: 18, hours: 32 },
  { name: 'Marcus', tasks: 22, hours: 38 },
  { name: 'Priya', tasks: 15, hours: 28 },
  { name: 'Alex', tasks: 12, hours: 24 },
  { name: 'Kim', tasks: 19, hours: 35 },
  { name: 'Jordan', tasks: 14, hours: 26 },
];

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload) return null;
  return (
    <div
      className="rounded-xl border px-3 py-2"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--shadow-medium)',
      }}
    >
      <p
        className="mb-1 text-xs font-semibold"
        style={{ color: 'var(--color-foreground)' }}
      >
        {label}
      </p>
      {payload.map((entry, i) => (
        <p
          key={i}
          className="text-xs"
          style={{ color: entry.color || 'var(--color-muted)' }}
        >
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('This Month');

  const completedTasks = TASKS.filter((t) => t.status === 'done').length;
  const totalTasks = TASKS.length;

  return (
    <div className="page" style={{ padding: '0 32px 40px' }}>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p
            className="mb-2 text-sm font-semibold uppercase tracking-[0.24em]"
            style={{ color: 'var(--color-muted)' }}
          >
            Analytics
          </p>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">
            Visualize team performance, track productivity, and identify trends.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div
            className="flex gap-1 rounded-xl p-1"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            {DATE_RANGES.map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={clsx(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                  dateRange === range ? 'btn-primary' : 'btn-ghost'
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="btn btn-secondary btn-sm">
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {SUMMARY_STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="stat-card"
          >
            <div className="mb-3 flex items-center justify-between">
              <p
                className="text-xs font-semibold uppercase tracking-[0.16em]"
                style={{ color: 'var(--color-muted)' }}
              >
                {stat.label}
              </p>
              <div
                className="rounded-lg p-2"
                style={{
                  background: 'var(--color-surface-active)',
                  color: 'var(--color-accent)',
                }}
              >
                <stat.icon size={16} />
              </div>
            </div>
            <p
              className="text-3xl font-bold"
              style={{ color: 'var(--color-foreground)' }}
            >
              {stat.value}
            </p>
            <p
              className="mt-1 text-xs font-medium"
              style={{
                color: stat.positive
                  ? 'var(--color-success)'
                  : 'var(--color-danger)',
              }}
            >
              {stat.change}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Productivity Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="card-header">
            <div>
              <h3
                className="text-base font-semibold"
                style={{ color: 'var(--color-foreground)' }}
              >
                Weekly Productivity
              </h3>
              <p
                className="mt-0.5 text-xs"
                style={{ color: 'var(--color-muted)' }}
              >
                Tasks completed vs. created per day
              </p>
            </div>
            <div
              className="rounded-lg px-2 py-1"
              style={{
                background: 'var(--color-accent-light)',
                color: 'var(--color-accent)',
              }}
            >
              <BarChart3 size={16} />
            </div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={WEEKLY_PRODUCTIVITY}
                barGap={4}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border-light)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="completed"
                  name="Completed"
                  fill="var(--color-success)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  dataKey="created"
                  name="Created"
                  fill="var(--color-accent)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                  opacity={0.4}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Team Performance Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card"
        >
          <div className="card-header">
            <div>
              <h3
                className="text-base font-semibold"
                style={{ color: 'var(--color-foreground)' }}
              >
                Team Performance
              </h3>
              <p
                className="mt-0.5 text-xs"
                style={{ color: 'var(--color-muted)' }}
              >
                Tasks completed per team member
              </p>
            </div>
            <div
              className="rounded-lg px-2 py-1"
              style={{
                background: 'var(--color-info-light)',
                color: 'var(--color-info)',
              }}
            >
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={TEAM_PERFORMANCE}
                layout="vertical"
                barGap={4}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border-light)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="tasks"
                  name="Tasks"
                  fill="var(--color-accent)"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Task Completion Trend */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="card-header">
            <div>
              <h3
                className="text-base font-semibold"
                style={{ color: 'var(--color-foreground)' }}
              >
                Task Completion Trend
              </h3>
              <p
                className="mt-0.5 text-xs"
                style={{ color: 'var(--color-muted)' }}
              >
                Daily completion over the week
              </p>
            </div>
            <div
              className="rounded-lg px-2 py-1"
              style={{
                background: 'var(--color-success-light)',
                color: 'var(--color-success)',
              }}
            >
              <Calendar size={16} />
            </div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={WEEKLY_PRODUCTIVITY}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border-light)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="var(--color-success)"
                  strokeWidth={3}
                  dot={{
                    fill: 'var(--color-success)',
                    strokeWidth: 0,
                    r: 5,
                  }}
                  activeDot={{
                    r: 7,
                    fill: 'var(--color-success)',
                    stroke: 'var(--color-surface)',
                    strokeWidth: 3,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Priority Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="card"
        >
          <div className="card-header">
            <div>
              <h3
                className="text-base font-semibold"
                style={{ color: 'var(--color-foreground)' }}
              >
                Priority Distribution
              </h3>
              <p
                className="mt-0.5 text-xs"
                style={{ color: 'var(--color-muted)' }}
              >
                Breakdown of tasks by priority level
              </p>
            </div>
          </div>
          <div className="card-body">
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={PRIORITY_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {PRIORITY_DISTRIBUTION.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3">
                {PRIORITY_DISTRIBUTION.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ background: item.color }}
                    />
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: 'var(--color-foreground)' }}
                      >
                        {item.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: 'var(--color-muted)' }}
                      >
                        {item.value} tasks
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Status Distribution Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card lg:col-span-2"
        >
          <div className="card-header">
            <div>
              <h3
                className="text-base font-semibold"
                style={{ color: 'var(--color-foreground)' }}
              >
                Task Status Overview
              </h3>
              <p
                className="mt-0.5 text-xs"
                style={{ color: 'var(--color-muted)' }}
              >
                Current status distribution of all tasks
              </p>
            </div>
            <p
              className="text-sm font-semibold"
              style={{ color: 'var(--color-foreground)' }}
            >
              {totalTasks} total &middot; {completedTasks} done
            </p>
          </div>
          <div className="card-body">
            {/* Stacked Bar */}
            <div className="mb-4 flex h-8 w-full overflow-hidden rounded-full">
              {STATUS_DISTRIBUTION.map((status) => (
                <motion.div
                  key={status.name}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(status.value / totalTasks) * 100}%`,
                  }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  style={{ background: status.color }}
                  className="h-full"
                  title={`${status.name}: ${status.value}`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-6">
              {STATUS_DISTRIBUTION.map((status) => (
                <div key={status.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ background: status.color }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: 'var(--color-foreground)' }}
                  >
                    {status.name}
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    ({status.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
