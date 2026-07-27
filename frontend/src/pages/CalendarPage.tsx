import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Clock, AlertTriangle, CheckCircle2, ListTodo,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  isBefore,
  addDays,
} from 'date-fns';
import clsx from 'clsx';
import { TASKS, TEAM_MEMBERS, PROJECTS } from '../data/seedData';
import { Card } from '../components/ui/Card';

function getPriorityDot(priority: string) {
  switch (priority) {
    case 'urgent': return 'var(--color-danger)';
    case 'high': return 'var(--color-warning)';
    case 'medium': return 'var(--color-accent)';
    case 'low': return 'var(--color-muted)';
    default: return 'var(--color-muted)';
  }
}

function getMember(id: string) {
  return TEAM_MEMBERS.find(m => m.id === id);
}

function isOverdue(dateStr: string) {
  if (!dateStr) return false;
  try {
    return isBefore(parseISO(dateStr), new Date()) && !isToday(parseISO(dateStr));
  } catch { return false; }
}

function MemberAvatar({ memberId }: { memberId: string }) {
  const member = getMember(memberId);
  if (!member) return null;
  return (
    <div
      className="h-5 w-5 inline-flex items-center justify-center rounded-full text-[9px] font-bold text-white shrink-0"
      style={{ background: member.avatarColor }}
      title={member.name}
    >
      {member.initials}
    </div>
  );
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [projectFilter, setProjectFilter] = useState<string[]>([]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });
  const totalWeeks = Math.ceil(days.length / 7);

  const filteredTasks = useMemo(() => {
    if (projectFilter.length === 0) return TASKS;
    return TASKS.filter(t => projectFilter.includes(t.projectId));
  }, [projectFilter]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, typeof TASKS> = {};
    filteredTasks.forEach(t => {
      if (!t.dueDate) return;
      try {
        const key = format(parseISO(t.dueDate), 'yyyy-MM-dd');
        if (!map[key]) map[key] = [];
        map[key].push(t);
      } catch {}
    });
    return map;
  }, [filteredTasks]);

  const upcomingTasks = useMemo(() => {
    const now = new Date();
    const weekFromNow = addDays(now, 7);
    return filteredTasks
      .filter(t => {
        if (!t.dueDate || t.status === 'done') return false;
        try {
          const d = parseISO(t.dueDate);
          return d >= now && d <= weekFromNow;
        } catch { return false; }
      })
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [filteredTasks]);

  const overdueCount = useMemo(() => {
    return filteredTasks.filter(t => t.status !== 'done' && isOverdue(t.dueDate)).length;
  }, [filteredTasks]);

  const thisWeekCount = useMemo(() => {
    const now = new Date();
    const weekEnd = addDays(now, 7);
    return filteredTasks.filter(t => {
      if (!t.dueDate) return false;
      try {
        const d = parseISO(t.dueDate);
        return d >= now && d <= weekEnd;
      } catch { return false; }
    }).length;
  }, [filteredTasks]);

  const toggleProject = (id: string) => {
    setProjectFilter(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="page flex flex-col h-[calc(100vh-80px)] relative z-10">
      {/* ─── Header ──────────────────────────────────────────── */}
      <div className="mb-6 flex shrink-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="page-title mb-0">Calendar</h1>
          <p className="mt-1 text-sm font-medium" style={{ color: 'var(--color-muted)' }}>
            Visualize deadlines and upcoming work at a glance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="rounded-xl border px-4 py-2 text-[12px] font-semibold transition-all"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-accent)', background: 'var(--color-surface)' }}
          >
            Today
          </button>

          <div
            className="inline-flex items-center rounded-xl p-1"
            style={{ background: 'var(--color-surface-active)', border: '1px solid var(--color-border)' }}
          >
            <button
              onClick={() => setCurrentDate(d => subMonths(d, 1))}
              className="rounded-lg p-2 transition-colors"
              style={{ color: 'var(--color-muted)' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span
              className="min-w-[140px] text-center text-[13px] font-bold uppercase tracking-wider"
              style={{ color: 'var(--color-foreground)' }}
            >
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button
              onClick={() => setCurrentDate(d => addMonths(d, 1))}
              className="rounded-lg p-2 transition-colors"
              style={{ color: 'var(--color-muted)' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Layout ─────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 gap-5">
        {/* Calendar Grid */}
        <div className="flex-1 flex flex-col min-w-0">
          <div
            className="flex flex-1 flex-col rounded-2xl border overflow-hidden"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-xs)' }}
          >
            {/* Day Headers */}
            <div className="grid grid-cols-7" style={{ borderBottom: '1px solid var(--color-border)' }}>
              {DAY_NAMES.map(d => (
                <div
                  key={d}
                  className="py-3 text-center text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: 'var(--color-muted)' }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day Cells */}
            <div className="flex-1 grid grid-cols-7" style={{ gridTemplateRows: `repeat(${totalWeeks}, 1fr)` }}>
              {days.map((day, i) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayTasks = tasksByDate[dateKey] || [];
                const inMonth = isSameMonth(day, currentDate);
                const today = isToday(day);
                const selected = selectedDay && isSameDay(day, selectedDay);

                return (
                  <div
                    key={i}
                    onClick={() => setSelectedDay(day)}
                    className={clsx(
                      'flex flex-col p-2 cursor-pointer transition-all border-b border-r',
                      !inMonth && 'opacity-40',
                    )}
                    style={{
                      borderColor: 'var(--color-border-light)',
                      background: selected
                        ? 'var(--color-accent-light)'
                        : today
                        ? 'var(--color-surface-hover)'
                        : 'transparent',
                    }}
                  >
                    <div
                      className={clsx(
                        'mb-1.5 flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold transition-all',
                      )}
                      style={{
                        background: today ? 'var(--color-accent)' : 'transparent',
                        color: today ? 'white' : inMonth ? 'var(--color-foreground)' : 'var(--color-muted)',
                      }}
                    >
                      {format(day, 'd')}
                    </div>

                    <div className="flex flex-1 flex-col gap-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                      {dayTasks.slice(0, 3).map(task => (
                        <div
                          key={task._id}
                          className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[10px] font-medium transition-colors truncate"
                          style={{
                            background: 'var(--color-surface-active)',
                            color: 'var(--color-foreground)',
                          }}
                          title={task.title}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full shrink-0"
                            style={{ background: getPriorityDot(task.priority) }}
                          />
                          <span className="truncate">{task.title}</span>
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <span className="text-[9px] font-bold px-1" style={{ color: 'var(--color-muted)' }}>
                          +{dayTasks.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Sidebar ──────────────────────────────────────── */}
        <div className="hidden w-[280px] shrink-0 flex-col gap-5 xl:flex">
          {/* Quick Stats */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div
              className="rounded-2xl border p-4"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-xs)' }}
            >
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="rounded-xl p-3"
                  style={{ background: 'var(--color-accent-light)' }}
                >
                  <div className="mb-1 flex items-center gap-1.5">
                    <CalendarIcon size={12} style={{ color: 'var(--color-accent)' }} />
                    <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--color-accent)' }}>This Week</span>
                  </div>
                  <div className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>{thisWeekCount}</div>
                </div>

                <div
                  className="rounded-xl p-3"
                  style={{ background: overdueCount > 0 ? 'var(--color-danger-light)' : 'var(--color-success-light)' }}
                >
                  <div className="mb-1 flex items-center gap-1.5">
                    <AlertTriangle size={12} style={{ color: overdueCount > 0 ? 'var(--color-danger)' : 'var(--color-success)' }} />
                    <span className="text-[10px] font-semibold uppercase" style={{ color: overdueCount > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                      Overdue
                    </span>
                  </div>
                  <div className="text-xl font-bold" style={{ color: overdueCount > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                    {overdueCount}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Upcoming Tasks */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex flex-1 flex-col min-h-0">
            <div
              className="flex flex-1 flex-col rounded-2xl border overflow-hidden"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-xs)' }}
            >
              <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                  Upcoming · Next 7 Days
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2" style={{ scrollbarWidth: 'thin' }}>
                {upcomingTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CheckCircle2 size={24} style={{ color: 'var(--color-success)' }} className="mb-2" />
                    <p className="text-[12px] font-medium" style={{ color: 'var(--color-muted)' }}>All clear!</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {upcomingTasks.map((task, i) => {
                      const member = getMember(task.assignee);
                      return (
                        <motion.div
                          key={task._id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="flex items-start gap-2.5 rounded-xl p-2.5 transition-colors"
                          style={{ background: isOverdue(task.dueDate) ? 'var(--color-danger-light)' : 'transparent' }}
                        >
                          <span
                            className="mt-1 h-2 w-2 rounded-full shrink-0"
                            style={{ background: getPriorityDot(task.priority) }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium truncate" style={{ color: 'var(--color-foreground)' }}>
                              {task.title}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <span
                                className="text-[10px] font-semibold"
                                style={{ color: isOverdue(task.dueDate) ? 'var(--color-danger)' : 'var(--color-muted)' }}
                              >
                                {(() => {
                                  try { return format(parseISO(task.dueDate), 'MMM d'); } catch { return task.dueDate; }
                                })()}
                              </span>
                              {member && <MemberAvatar memberId={task.assignee} />}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Project Filter */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div
              className="rounded-2xl border p-4"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-xs)' }}
            >
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                Filter by Project
              </h3>
              <div className="flex flex-col gap-2">
                {PROJECTS.map(project => (
                  <label
                    key={project.id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors"
                    style={{ background: projectFilter.includes(project.id) ? 'var(--color-surface-hover)' : 'transparent' }}
                  >
                    <input
                      type="checkbox"
                      checked={projectFilter.includes(project.id)}
                      onChange={() => toggleProject(project.id)}
                      className="h-3.5 w-3.5 rounded accent-current"
                      style={{ accentColor: project.color }}
                    />
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ background: project.color }}
                    />
                    <span className="text-[12px] font-medium" style={{ color: 'var(--color-foreground)' }}>
                      {project.name}
                    </span>
                  </label>
                ))}
                {projectFilter.length > 0 && (
                  <button
                    onClick={() => setProjectFilter([])}
                    className="mt-1 text-[11px] font-semibold transition-colors"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    Clear filter
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
