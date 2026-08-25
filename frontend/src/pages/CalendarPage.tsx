import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Clock, AlertTriangle, CheckCircle2, GripVertical,
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
import { DndContext, DragOverlay, useDraggable, useDroppable, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { useTaskStore } from '../store/taskStore';
import { useProjectStore } from '../store/projectStore';
import { useMeetingStore } from '../store/meetingStore';
import { useAuthStore } from '../store/authStore';
import { useTeamStore } from '../store/teamStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import toast from 'react-hot-toast';
import TimeblockingGrid from '../components/calendar/TimeblockingGrid';

function getPriorityDot(priority: string) {
  switch (priority) {
    case 'urgent': return 'var(--color-danger)';
    case 'high': return 'var(--color-warning)';
    case 'medium': return 'var(--color-accent)';
    case 'low': return 'var(--color-muted)';
    default: return 'var(--color-muted)';
  }
}

function isOverdue(dateStr: string) {
  if (!dateStr) return false;
  try {
    return isBefore(parseISO(dateStr), new Date()) && !isToday(parseISO(dateStr));
  } catch { return false; }
}

function MemberAvatar({ memberId }: { memberId: string }) {
  const initial = memberId?.charAt(0)?.toUpperCase() || '?';
  return (
    <div
      className="h-5 w-5 inline-flex items-center justify-center rounded-full text-[9px] font-bold text-white shrink-0"
      style={{ background: 'var(--color-accent)' }}
      title={memberId}
    >
      {initial}
    </div>
  );
}

function DraggableTaskChip({ task, onDragStart }: { task: any; onDragStart: (task: any) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
    data: { task },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onPointerDown={(e) => { onDragStart(task); (listeners as any).onPointerDown?.(e); }}
      className={clsx(
        'flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[10px] font-medium transition-colors truncate cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-40',
      )}
      style={{
        ...style,
        background: 'var(--color-surface-active)',
        color: 'var(--color-foreground)',
      }}
      title={`${task.title} — drag to reschedule`}
    >
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: getPriorityDot(task.priority) }} />
      <span className="truncate flex-1">{task.title}</span>
      <GripVertical size={10} className="shrink-0 opacity-40" />
    </div>
  );
}

function MeetingChip({ meeting, onClick }: { meeting: any; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[10px] font-medium transition-colors truncate cursor-pointer',
      )}
      style={{
        background: 'var(--color-primary-light, #e0f2fe)',
        color: 'var(--color-primary-800, #075985)',
      }}
      title={`${meeting.title} - ${format(new Date(meeting.startTime), 'h:mm a')}`}
    >
      <span className="h-1.5 w-1.5 rounded-full shrink-0 bg-blue-500" />
      <span className="truncate flex-1">{meeting.title}</span>
    </div>
  );
}

function DroppableDayCell({
  day, currentDate, dayTasks, dayMeetings, inMonth, today, selected, onSelect, isOver,
}: {
  day: Date; currentDate: Date; dayTasks: any[]; dayMeetings: any[]; inMonth: boolean; today: boolean;
  selected: boolean; onSelect: () => void; isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({ id: format(day, 'yyyy-MM-dd') });

  return (
    <div
      ref={setNodeRef}
      onClick={onSelect}
      className={clsx(
        'flex flex-col p-2 cursor-pointer transition-all border-b border-r',
        !inMonth && 'opacity-40',
      )}
      style={{
        borderColor: 'var(--color-border-light)',
        background: isOver
          ? 'var(--color-accent-light)'
          : selected
          ? 'var(--color-accent-light)'
          : today
          ? 'var(--color-surface-hover)'
          : 'transparent',
      }}
    >
      <div
        className={clsx('mb-1.5 flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold transition-all')}
        style={{
          background: today ? 'var(--color-accent)' : 'transparent',
          color: today ? 'white' : inMonth ? 'var(--color-foreground)' : 'var(--color-muted)',
        }}
      >
        {format(day, 'd')}
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {dayMeetings.slice(0, 2).map((meeting: any) => (
          <MeetingChip key={meeting._id} meeting={meeting} onClick={onSelect} />
        ))}
        {dayTasks.slice(0, 3).map((task: any) => (
          <DraggableTaskChip key={task._id} task={task} onDragStart={() => {}} />
        ))}
        {(dayTasks.length + dayMeetings.length) > 5 && (
          <span className="text-[9px] font-bold px-1" style={{ color: 'var(--color-muted)' }}>
            +{(dayTasks.length + dayMeetings.length) - 5} more
          </span>
        )}
      </div>
    </div>
  );
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const { workspace } = useAuthStore();
  const { projects } = useProjectStore();
  const { tasks, loading, error, fetchTasks, updateTask } = useTaskStore();
  const { meetings, fetchMeetings } = useMeetingStore();
  const { members, getMembers } = useTeamStore();

  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [projectFilter, setProjectFilter] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [activeTask, setActiveTask] = useState<any>(null);
  const [overDate, setOverDate] = useState<Date | null>(null);

  const retry = useCallback(() => {
    if (workspace?._id) {
      fetchTasks(workspace._id);
      fetchMeetings(workspace._id);
      getMembers(workspace._id);
    }
  }, [workspace, fetchTasks, fetchMeetings, getMembers]);

  useEffect(() => {
    retry();
  }, [retry]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });
  const totalWeeks = Math.ceil(days.length / 7);

  const weekDays = eachDayOfInterval({ start: startOfWeek(currentDate), end: endOfWeek(currentDate) });

  const filteredTasks = useMemo(() => {
    if (projectFilter.length === 0) return tasks;
    return tasks.filter((t: any) => projectFilter.includes(t.projectId));
  }, [tasks, projectFilter]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    filteredTasks.forEach((t: any) => {
      if (!t.dueDate) return;
      try {
        const key = format(parseISO(t.dueDate), 'yyyy-MM-dd');
        if (!map[key]) map[key] = [];
        map[key].push(t);
      } catch { /* skip tasks with invalid due dates */ }
    });
    return map;
  }, [filteredTasks]);

  const meetingsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    meetings.forEach((m: any) => {
      if (!m.startTime) return;
      try {
        const key = format(parseISO(m.startTime), 'yyyy-MM-dd');
        if (!map[key]) map[key] = [];
        map[key].push(m);
      } catch { /* skip meetings with invalid start times */ }
    });
    return map;
  }, [meetings]);

  const upcomingTasks = useMemo(() => {
    const now = new Date();
    const weekFromNow = addDays(now, 7);
    return filteredTasks
      .filter((t: any) => {
        if (!t.dueDate || t.status === 'done') return false;
        try {
          const d = parseISO(t.dueDate);
          return d >= now && d <= weekFromNow;
        } catch { return false; }
      })
      .sort((a: any, b: any) => a.dueDate.localeCompare(b.dueDate));
  }, [filteredTasks]);

  const overdueCount = useMemo(() => {
    return filteredTasks.filter((t: any) => t.status !== 'done' && isOverdue(t.dueDate)).length;
  }, [filteredTasks]);

  const thisWeekCount = useMemo(() => {
    const now = new Date();
    const weekEnd = addDays(now, 7);
    return filteredTasks.filter((t: any) => {
      if (!t.dueDate) return false;
      try {
        const d = parseISO(t.dueDate);
        return d >= now && d <= weekEnd;
      } catch { return false; }
    }).length;
  }, [filteredTasks]);

  const unscheduledTasks = useMemo(() => {
    return filteredTasks.filter((t: any) => !t.dueDate && t.status !== 'done');
  }, [filteredTasks]);

  const toggleProject = (id: string) => {
    setProjectFilter(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setOverDate(null);

    if (!over) return;

    const taskId = active.id as string;
    const newDateStr = over.id as string; // Could be a date string from month cell, or datetime from week slot
    const task = tasks.find((t: any) => t._id === taskId);
    if (!task) return;

    try {
      if (newDateStr.includes(':')) {
        const newStart = parseISO(newDateStr);
        const newEnd = new Date(newStart.getTime() + 60 * 60 * 1000);
        await updateTask(taskId, { dueDate: newEnd.toISOString() });
        toast.success(`Scheduled "${task.title}" at ${format(newStart, 'h:mm a')}`);
      } else {
        const newDate = parseISO(newDateStr);
        const oldDate = task.dueDate ? parseISO(task.dueDate) : null;
        if (oldDate && isSameDay(oldDate, newDate)) return;

        await updateTask(taskId, { dueDate: newDateStr });
        toast.success(`Moved "${task.title}" to ${format(newDate, 'MMM d')}`);
      }
    } catch {
      toast.error('Failed to reschedule task');
    }
  }, [tasks, updateTask]);

  return (
    <div className="page flex flex-col h-[calc(100vh-80px)] relative z-10">
      <div className="mb-6 flex shrink-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="page-title mb-0">Calendar</h1>
          <p className="mt-1 text-sm font-medium" style={{ color: 'var(--color-muted)' }}>
            Drag tasks to reschedule. Visualize deadlines at a glance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-xl p-1" style={{ background: 'var(--color-surface-active)', border: '1px solid var(--color-border)' }}>
            <button
              onClick={() => setViewMode('month')}
              className={clsx('relative rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors', viewMode === 'month' ? 'text-[color:var(--color-foreground)]' : 'text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground-secondary)]')}
            >
              {viewMode === 'month' && (
                <motion.span layoutId="cal-view-pill" className="absolute inset-0 rounded-lg bg-[color:var(--color-surface)] shadow-xs border border-border" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
              )}
              <span className="relative z-10">Month</span>
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={clsx('relative rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors', viewMode === 'week' ? 'text-[color:var(--color-foreground)]' : 'text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground-secondary)]')}
            >
              {viewMode === 'week' && (
                <motion.span layoutId="cal-view-pill" className="absolute inset-0 rounded-lg bg-[color:var(--color-surface)] shadow-xs border border-border" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
              )}
              <span className="relative z-10">Week</span>
            </button>
          </div>

          <div className="w-px h-5 bg-border mx-1" />

          <button
            onClick={() => setCurrentDate(new Date())}
            className="rounded-xl border px-4 py-2 text-[12px] font-semibold transition-all"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-accent)', background: 'var(--color-surface)' }}
          >
            Today
          </button>

          <div className="inline-flex items-center rounded-xl p-1" style={{ background: 'var(--color-surface-active)', border: '1px solid var(--color-border)' }}>
            <button onClick={() => setCurrentDate(d => viewMode === 'month' ? subMonths(d, 1) : addDays(d, -7))} className="rounded-lg p-2 transition-colors" style={{ color: 'var(--color-muted)' }} aria-label="Previous">
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-[140px] text-center text-[13px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-foreground)' }}>
              {viewMode === 'month' ? format(currentDate, 'MMMM yyyy') : `${format(weekDays[0], 'MMM d')} - ${format(weekDays[6], 'MMM d, yyyy')}`}
            </span>
            <button onClick={() => setCurrentDate(d => viewMode === 'month' ? addMonths(d, 1) : addDays(d, 7))} className="rounded-lg p-2 transition-colors" style={{ color: 'var(--color-muted)' }} aria-label="Next">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex flex-1 items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {!loading && error && <ErrorState message={error} onRetry={retry} />}

      {!loading && !error && (
      <DndContext
        sensors={sensors}
        onDragStart={(event) => {
          const task = (event.active.data.current as any)?.task;
          setActiveTask(task);
        }}
        onDragOver={(event) => {
          const overId = event.over?.id as string;
          setOverDate(overId || null);
        }}
        onDragEnd={handleDragEnd}
        onDragCancel={() => { setActiveTask(null); setOverDate(null); }}
      >
        <div className="flex flex-1 min-h-0 gap-5">
          <div className="flex-1 flex flex-col min-w-0">
            {viewMode === 'month' ? (
              <div className="flex flex-1 flex-col rounded-2xl border overflow-hidden" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-xs)' }}>
                <div className="grid grid-cols-7" style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {DAY_NAMES.map(d => (
                    <div key={d} className="py-3 text-center text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
                      {d}
                    </div>
                  ))}
                </div>

                <div className="flex-1 grid grid-cols-7" style={{ gridTemplateRows: `repeat(${totalWeeks}, 1fr)` }}>
                  {days.map((day, i) => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const dayTasks = tasksByDate[dateKey] || [];
                    const dayMeetings = meetingsByDate[dateKey] || [];
                    const inMonth = isSameMonth(day, currentDate);
                    const today = isToday(day);

                    return (
                      <DroppableDayCell
                        key={i}
                        day={day}
                        currentDate={currentDate}
                        dayTasks={dayTasks}
                        dayMeetings={dayMeetings}
                        inMonth={inMonth}
                        today={today}
                        selected={selectedDay && isSameDay(day, selectedDay)}
                        onSelect={() => setSelectedDay(day)}
                        isOver={overDate && isSameDay(day, overDate)}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <TimeblockingGrid weekDays={weekDays} tasks={filteredTasks} meetings={meetings} />
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden w-[280px] shrink-0 flex-col gap-5 xl:flex">
            {/* Quick Stats */}
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div className="rounded-2xl border p-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-xs)' }}>
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Quick Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-3" style={{ background: 'var(--color-accent-light)' }}>
                    <div className="mb-1 flex items-center gap-1.5">
                      <CalendarIcon size={12} style={{ color: 'var(--color-accent)' }} />
                      <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--color-accent)' }}>This Week</span>
                    </div>
                    <div className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>{thisWeekCount}</div>
                  </div>

                  <div className="rounded-xl p-3" style={{ background: overdueCount > 0 ? 'var(--color-danger-light)' : 'var(--color-success-light)' }}>
                    <div className="mb-1 flex items-center gap-1.5">
                      <AlertTriangle size={12} style={{ color: overdueCount > 0 ? 'var(--color-danger)' : 'var(--color-success)' }} />
                      <span className="text-[10px] font-semibold uppercase" style={{ color: overdueCount > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>Overdue</span>
                    </div>
                    <div className="text-xl font-bold" style={{ color: overdueCount > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>{overdueCount}</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Upcoming / Unscheduled Tasks */}
            {viewMode === 'month' ? (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex flex-1 flex-col min-h-0">
                <div className="flex flex-1 flex-col rounded-2xl border overflow-hidden" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-xs)' }}>
                  <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Upcoming &middot; Next 7 Days</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2" style={{ scrollbarWidth: 'thin' }}>
                    {upcomingTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CheckCircle2 size={24} style={{ color: 'var(--color-success)' }} className="mb-2" />
                        <p className="text-[12px] font-medium" style={{ color: 'var(--color-muted)' }}>All clear!</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {upcomingTasks.map((task: any, i: number) => (
                          <motion.div
                            key={task._id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-start gap-2.5 rounded-xl p-2.5 transition-colors"
                            style={{ background: isOverdue(task.dueDate) ? 'var(--color-danger-light)' : 'transparent' }}
                          >
                            <span className="mt-1 h-2 w-2 rounded-full shrink-0" style={{ background: getPriorityDot(task.priority) }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-medium truncate" style={{ color: 'var(--color-foreground)' }}>{task.title}</p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-[10px] font-semibold" style={{ color: isOverdue(task.dueDate) ? 'var(--color-danger)' : 'var(--color-muted)' }}>
                                  {(() => { try { return format(parseISO(task.dueDate), 'MMM d'); } catch { return task.dueDate; } })()}
                                </span>
                                {task.assignee && <MemberAvatar memberId={task.assignee} />}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex flex-1 flex-col min-h-0">
                <div className="flex flex-1 flex-col rounded-2xl border overflow-hidden" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-xs)' }}>
                  <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Unscheduled Tasks</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2" style={{ scrollbarWidth: 'thin' }}>
                    {unscheduledTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CheckCircle2 size={24} style={{ color: 'var(--color-success)' }} className="mb-2" />
                        <p className="text-[12px] font-medium" style={{ color: 'var(--color-muted)' }}>All scheduled!</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {unscheduledTasks.map((task: any) => (
                          <DraggableTaskChip key={task._id} task={task} onDragStart={() => {}} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Project Filter */}
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div className="rounded-2xl border p-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-xs)' }}>
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Filter by Project</h3>
                <div className="flex flex-col gap-2">
                  {projects.map((project: any) => (
                    <label
                      key={project._id}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors"
                      style={{ background: projectFilter.includes(project._id) ? 'var(--color-surface-hover)' : 'transparent' }}
                    >
                      <input
                        type="checkbox"
                        checked={projectFilter.includes(project._id)}
                        onChange={() => toggleProject(project._id)}
                        className="h-3.5 w-3.5 rounded accent-current"
                        style={{ accentColor: project.color || 'var(--color-accent)' }}
                      />
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: project.color || 'var(--color-accent)' }} />
                      <span className="text-[12px] font-medium" style={{ color: 'var(--color-foreground)' }}>{project.name}</span>
                    </label>
                  ))}
                  {projects.length === 0 && (
                    <p className="text-[12px]" style={{ color: 'var(--color-muted)' }}>No projects yet</p>
                  )}
                  {projectFilter.length > 0 && (
                    <button onClick={() => setProjectFilter([])} className="mt-1 text-[11px] font-semibold transition-colors" style={{ color: 'var(--color-accent)' }}>
                      Clear filter
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <DragOverlay>
          {activeTask ? (
            <div
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] font-medium shadow-lg"
              style={{ background: 'var(--color-accent)', color: 'white', minWidth: 120 }}
            >
              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: 'white' }} />
              <span className="truncate">{activeTask.title}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      )}
    </div>
  );
}
