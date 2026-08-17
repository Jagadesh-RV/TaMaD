import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, LayoutGrid, List, CalendarDays,
  ChevronDown, Clock, X, Inbox, GripVertical,
  ArrowUpDown, ChevronUp, AlertTriangle,
} from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { format, isToday, isBefore, parseISO } from 'date-fns';
import clsx from 'clsx';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import { useInteractionStore } from '../store/interactionStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  projectId: string;
  assignee: string;
  tags: string[];
  dueDate: string;
  createdAt: string;
  order: number;
}

type ViewMode = 'kanban' | 'list' | 'calendar';
type SortField = 'title' | 'status' | 'priority' | 'assignee' | 'dueDate';

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'var(--color-muted)' },
  { id: 'in-progress', label: 'In Progress', color: 'var(--color-accent)' },
  { id: 'review', label: 'Review', color: 'var(--color-warning)' },
  { id: 'done', label: 'Done', color: 'var(--color-success)' },
] as const;

const STATUS_OPTIONS = ['all', 'todo', 'in-progress', 'review', 'done'] as const;
const PRIORITY_OPTIONS = ['all', 'urgent', 'high', 'medium', 'low'] as const;
const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

const statusLabels: Record<string, string> = {
  'all': 'All Statuses',
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'review': 'Review',
  'done': 'Done',
};

const priorityLabels: Record<string, string> = {
  all: 'All Priorities',
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

function getPriorityStyle(priority: string) {
  switch (priority) {
    case 'urgent': return { bg: 'var(--color-danger-light)', text: 'var(--color-danger)' };
    case 'high': return { bg: 'var(--color-warning-light)', text: 'var(--color-warning)' };
    case 'medium': return { bg: 'var(--color-accent-light)', text: 'var(--color-accent)' };
    case 'low': return { bg: 'var(--color-surface-active)', text: 'var(--color-muted)' };
    default: return { bg: 'var(--color-surface-active)', text: 'var(--color-muted)' };
  }
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'todo': return { bg: 'var(--color-surface-active)', text: 'var(--color-muted)', dot: 'var(--color-muted)' };
    case 'in-progress': return { bg: 'var(--color-accent-light)', text: 'var(--color-accent)', dot: 'var(--color-accent)' };
    case 'review': return { bg: 'var(--color-warning-light)', text: 'var(--color-warning)', dot: 'var(--color-warning)' };
    case 'done': return { bg: 'var(--color-success-light)', text: 'var(--color-success)', dot: 'var(--color-success)' };
    default: return { bg: 'var(--color-surface-active)', text: 'var(--color-muted)', dot: 'var(--color-muted)' };
  }
}

function isOverdue(task: Task) {
  if (!task.dueDate || task.status === 'done') return false;
  try {
    return isBefore(parseISO(task.dueDate), new Date()) && !isToday(parseISO(task.dueDate));
  } catch { return false; }
}

function formatDueDate(dateStr: string) {
  if (!dateStr) return null;
  try {
    const d = parseISO(dateStr);
    if (isToday(d)) return 'Today';
    return format(d, 'MMM d');
  } catch { return dateStr; }
}

function MemberAvatar({ memberId, size = 'sm' }: { memberId: string; size?: 'sm' | 'md' }) {
  const dims = size === 'sm' ? 'h-6 w-6 text-[10px]' : 'h-8 w-8 text-[11px]';
  const initial = memberId?.charAt(0)?.toUpperCase() || '?';
  return (
    <div
      className={clsx(dims, 'inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0')}
      style={{ background: 'var(--color-accent)' }}
      title={memberId}
    >
      {initial}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const s = getPriorityStyle(priority);
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: s.bg, color: s.text }}
    >
      {priority === 'urgent' && <AlertTriangle size={10} />}
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = getStatusStyle(status);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ background: s.bg, color: s.text }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
      {statusLabels[status] || status}
    </span>
  );
}

function KanbanCard({ task, onClick }: { task: Task; onClick?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    data: { type: 'Task', task },
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={clsx(
        'group relative cursor-grab transition-all active:cursor-grabbing outline-none',
        isDragging ? 'z-50 scale-[1.02]' : '',
      )}
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      <Card
        interactive
        className={clsx(
          "p-3.5 border transition-all duration-300",
          isDragging ? "shadow-float border-accent bg-surface-hover ring-2 ring-accent/20" : "shadow-xs hover:shadow-soft border-border hover:border-border-hover bg-surface"
        )}
      >
        <div className="relative">
          <div className="mb-2.5 flex items-start justify-between gap-2">
            <h4 className="text-[13px] font-semibold leading-snug text-[color:var(--color-foreground)] group-hover:text-[color:var(--color-accent)] transition-colors">
              {task.title}
            </h4>
            <GripVertical size={14} className="shrink-0 opacity-0 group-hover:opacity-50 transition-opacity text-[color:var(--color-muted)]" />
          </div>

          <div className="mb-3 flex flex-wrap gap-1.5">
            <PriorityBadge priority={task.priority} />
            {task.tags?.slice(0, 2).map((tag: string) => (
              <span
                key={tag}
                className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-[color:var(--color-surface-active)] text-[color:var(--color-muted)]"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-light">
            <MemberAvatar memberId={task.assignee} />
            {task.dueDate && (
              <span
                className={clsx(
                  'inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide',
                  isOverdue(task) && 'font-bold',
                )}
                style={{ color: isOverdue(task) ? 'var(--color-danger)' : 'var(--color-muted)' }}
              >
                <Clock size={11} strokeWidth={2.5} />
                {formatDueDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function KanbanOverlay({ task }: { task: Task }) {
  return (
    <Card
      className="w-[300px] p-3.5 shadow-float border-accent bg-surface-hover ring-2 ring-accent/20 rotate-2"
    >
      <h4 className="text-[13px] font-semibold text-[color:var(--color-foreground)]">{task.title}</h4>
      <div className="mt-3"><PriorityBadge priority={task.priority} /></div>
    </Card>
  );
}

function KanbanColumn({
  colId,
  label,
  color,
  tasks,
  onTaskClick,
}: {
  colId: string;
  label: string;
  color: string;
  tasks: Task[];
  onTaskClick: (t: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: colId,
    data: { type: 'Column', columnId: colId },
  });

  const taskIds = tasks.map(t => t._id);

  return (
    <div className="flex min-w-[300px] max-w-[340px] flex-1 flex-col">
      <div className="mb-4 flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
          <h3 className="text-sm font-semibold text-[color:var(--color-foreground)]">{label}</h3>
        </div>
        <span
          className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full px-2 text-[11px] font-bold bg-[color:var(--color-surface)] text-[color:var(--color-muted)] border border-border"
        >
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={clsx(
          'flex min-h-[500px] flex-1 flex-col rounded-3xl border-2 p-2.5 transition-all duration-300',
          isOver ? 'border-[color:var(--color-accent)] bg-[color:var(--color-accent-ghost)]' : 'border-transparent bg-[color:var(--color-surface-active)]/55',
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2.5 h-full">
            <AnimatePresence>
              {tasks.map(task => (
                <KanbanCard key={task._id} task={task} onClick={() => onTaskClick(task)} />
              ))}
            </AnimatePresence>
            
            {tasks.length === 0 && (
              <div className="flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-border-light m-1 opacity-50 bg-[color:var(--color-background)]">
                <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--color-muted)]">Drop tasks here</p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

function ListRow({
  task,
  index,
  onClick,
}: {
  task: Task;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.02 }}
      className={clsx(
        'cursor-pointer transition-colors',
        index % 2 === 1 && 'bg-[color:var(--color-surface-hover)]',
        'hover:bg-[color:var(--color-accent-ghost)]',
      )}
      onClick={onClick}
    >
      <td className="w-10 px-4 py-3">
        <div
          className="h-4 w-4 rounded border-2 transition-colors"
          style={{ borderColor: 'var(--color-border)' }}
        />
      </td>
      <td className="max-w-[320px] px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-medium truncate" style={{ color: 'var(--color-foreground)' }}>
            {task.title}
          </span>
        </div>
      </td>
      <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
      <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
      <td className="px-4 py-3">
        <MemberAvatar memberId={task.assignee} />
      </td>
      <td className="px-4 py-3">
        {task.dueDate ? (
          <span
            className={clsx('inline-flex items-center gap-1 text-[12px] font-medium', isOverdue(task) && 'font-semibold')}
            style={{ color: isOverdue(task) ? 'var(--color-danger)' : 'var(--color-muted)' }}
          >
            <Clock size={11} />
            {formatDueDate(task.dueDate)}
          </span>
        ) : (
          <span className="text-[12px]" style={{ color: 'var(--color-muted)' }}>—</span>
        )}
      </td>
    </motion.tr>
  );
}

function CalendarMiniView({ tasks }: { tasks: Task[] }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const days: (number | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const tasksByDate: Record<number, Task[]> = {};
  tasks.forEach(t => {
    if (!t.dueDate) return;
    try {
      const d = parseISO(t.dueDate);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const day = d.getDate();
        if (!tasksByDate[day]) tasksByDate[day] = [];
        tasksByDate[day].push(t);
      }
    } catch { /* skip tasks with invalid due dates */ }
  });

  return (
    <div className="rounded-2xl border p-5" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-xs)' }}>
      <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
        {format(now, 'MMMM yyyy')}
      </h3>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="py-1 text-[10px] font-bold uppercase" style={{ color: 'var(--color-muted)' }}>{d}</div>
        ))}
        {days.map((day, i) => {
          if (day === null) return <div key={`p${i}`} />;
          const dayTasks = tasksByDate[day] || [];
          const today = isToday(new Date(year, month, day));
          return (
            <div
              key={day}
              className={clsx(
                'relative flex flex-col items-center rounded-lg py-1.5 transition-colors',
                today && 'font-bold',
              )}
              style={{
                background: today ? 'var(--color-accent-light)' : 'transparent',
                color: today ? 'var(--color-accent)' : dayTasks.length > 0 ? 'var(--color-foreground)' : 'var(--color-muted)',
              }}
            >
              <span className="text-[11px]">{day}</span>
              {dayTasks.length > 0 && (
                <div className="mt-0.5 flex gap-0.5">
                  {dayTasks.slice(0, 3).map((t, j) => {
                    const p = getPriorityStyle(t.priority);
                    return <span key={j} className="h-1 w-1 rounded-full" style={{ background: p.text }} />;
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { tasks, fetchTasks, createTask, reorderTask, loading } = useTaskStore();
  const workspace = useAuthStore(s => s.workspace);
  const workspaceId = workspace?._id || '';
  const openInspector = useInteractionStore((s) => s.openInspector);

  const [view, setView] = useState<ViewMode>('kanban');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [quickTitle, setQuickTitle] = useState('');
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [listSort, setListSort] = useState<SortField>('title');
  const [listSortAsc, setListSortAsc] = useState(true);

  useEffect(() => {
    if (workspaceId) fetchTasks(workspaceId);
  }, [fetchTasks, workspaceId]);

  useEffect(() => {
    setLocalTasks(tasks as unknown as Task[]);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const filtered = useMemo(() => {
    return localTasks.filter(t => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      return true;
    });
  }, [localTasks, search, statusFilter, priorityFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (listSort) {
        case 'title': cmp = a.title.localeCompare(b.title); break;
        case 'status': cmp = (a.status).localeCompare(b.status); break;
        case 'priority': cmp = (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9); break;
        case 'assignee': cmp = (a.assignee || '').localeCompare(b.assignee || ''); break;
        case 'dueDate': cmp = (a.dueDate || '').localeCompare(b.dueDate || ''); break;
      }
      return listSortAsc ? cmp : -cmp;
    });
  }, [filtered, listSort, listSortAsc]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { todo: 0, 'in-progress': 0, review: 0, done: 0 };
    filtered.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1; });
    return counts;
  }, [filtered]);

  const handleQuickAdd = () => {
    if (!quickTitle.trim()) return;
    createTask({
      title: quickTitle.trim(),
      status: 'todo',
      priority: 'medium',
      workspaceId,
    });
    setQuickTitle('');
  };

  const handleDragStart = (e: DragStartEvent) => {
    const task = localTasks.find(t => t._id === e.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    setLocalTasks(prev => {
      const activeIndex = prev.findIndex(t => t._id === activeId);
      if (activeIndex === -1) return prev;
      const updated = [...prev];

      if (isOverTask) {
        const overIndex = prev.findIndex(t => t._id === overId);
        if (overIndex === -1) return prev;
        if (updated[activeIndex].status !== updated[overIndex].status) {
          updated[activeIndex] = { ...updated[activeIndex], status: updated[overIndex].status };
        }
        return arrayMove(updated, activeIndex, overIndex);
      }

      if (isOverColumn) {
        updated[activeIndex] = { ...updated[activeIndex], status: overId as Task['status'] };
        return arrayMove(updated, activeIndex, activeIndex);
      }

      return prev;
    });
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveTask(null);
  };

  const toggleSort = (field: SortField) => {
    if (listSort === field) setListSortAsc(!listSortAsc);
    else { setListSort(field); setListSortAsc(true); }
  };

  const viewButtons: { mode: ViewMode; icon: typeof LayoutGrid; label: string }[] = [
    { mode: 'kanban', icon: LayoutGrid, label: 'Kanban' },
    { mode: 'list', icon: List, label: 'List' },
    { mode: 'calendar', icon: CalendarDays, label: 'Calendar' },
  ];

  return (
    <div className="page flex flex-col h-[calc(100vh-80px)] relative z-10">
      {/* Header */}
      <div className="mb-6 flex shrink-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="page-title mb-0">Tasks</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
            {filtered.length} task{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="inline-flex rounded-xl p-1"
            style={{ background: 'var(--color-surface-active)', border: '1px solid var(--color-border)' }}
          >
            {viewButtons.map(vb => (
              <button
                key={vb.mode}
                onClick={() => setView(vb.mode)}
                className={clsx(
                  'relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors',
                )}
                style={{
                  color: view === vb.mode ? 'var(--color-accent)' : 'var(--color-muted)',
                }}
              >
                {view === vb.mode && (
                  <motion.span
                    layoutId="tasks-view-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-lg bg-[color:var(--color-surface)]"
                    style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  <vb.icon size={14} />
                  {vb.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <Card
        className="mb-6 flex flex-col gap-4 p-4 sm:flex-row sm:items-center shadow-xs"
      >
        <div className="search-input flex-1 bg-[color:var(--color-surface-active)] border-transparent focus-within:border-[color:var(--color-accent)] focus-within:bg-[color:var(--color-surface)] transition-all">
          <Search size={18} className="text-[color:var(--color-muted)]" />
          <input
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-sm font-medium"
            aria-label="Search tasks"
          />
          {search && (
            <button onClick={() => setSearch('')} className="rounded-full p-1 transition-colors hover:bg-[color:var(--color-surface-hover)]" aria-label="Clear search">
              <X size={14} className="text-[color:var(--color-muted)]" />
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-bold outline-none transition-all hover:border-border-hover focus:border-[color:var(--color-accent)] shadow-xs"
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{statusLabels[s]}{s !== 'all' && statusCounts[s] !== undefined ? ` (${statusCounts[s]})` : ''}</option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-bold outline-none transition-all hover:border-border-hover focus:border-[color:var(--color-accent)] shadow-xs"
        >
          {PRIORITY_OPTIONS.map(p => (
            <option key={p} value={p}>{priorityLabels[p]}</option>
          ))}
        </select>

        {(search || statusFilter !== 'all' || priorityFilter !== 'all') && (
          <button
            onClick={() => { setSearch(''); setStatusFilter('all'); setPriorityFilter('all'); }}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all bg-[color:var(--color-danger-light)] text-[color:var(--color-danger)] hover:bg-[color:var(--color-danger)] hover:text-white"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </Card>

      {/* Quick Add */}
      <Card
        className="mb-6 flex items-center gap-3 p-2 pl-3 shadow-xs border-dashed focus-within:border-solid focus-within:border-[color:var(--color-accent)] transition-all"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--color-accent-ghost)]">
          <Plus size={18} className="text-[color:var(--color-accent)]" />
        </div>
         <input
           value={quickTitle}
           onChange={e => setQuickTitle(e.target.value)}
           onKeyDown={e => e.key === 'Enter' && handleQuickAdd()}
           placeholder="Quick add a task... (Press Enter)"
           className="flex-1 bg-transparent text-sm font-semibold outline-none text-[color:var(--color-foreground)] placeholder:text-[color:var(--color-muted)]"
           aria-label="Quick add a task"
         />
        <AnimatePresence>
          {quickTitle.trim() && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <Button
                onClick={handleQuickAdd}
                size="sm"
                className="rounded-lg shadow-sm"
              >
                Add Task
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {loading && <LoadingSpinner text="Loading tasks..." />}

        {!loading && view === 'kanban' && (
          filtered.length === 0 ? <EmptyState icon={Inbox} title="No tasks in view" description="Nothing matches your current filters. Try a different view or capture the next idea in your head." steps={['Relax or clear your filters', 'Use the quick add bar above to capture the next idea', 'Open Task Hub from the sidebar to start fresh']} /> :
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-5 overflow-x-auto pb-4 pt-1 h-full" style={{ scrollbarWidth: 'thin' }}>
              {COLUMNS.map(col => (
                <KanbanColumn
                  key={col.id}
                  colId={col.id}
                  label={col.label}
                  color={col.color}
                  tasks={filtered.filter(t => t.status === col.id)}
                  onTaskClick={(task) => openInspector('task', task._id)}
                />
              ))}
            </div>
            <DragOverlay>
              {activeTask ? <KanbanOverlay task={activeTask} /> : null}
            </DragOverlay>
          </DndContext>
        )}

        {!loading && view === 'list' && (
          filtered.length === 0 ? <EmptyState icon={Inbox} title="No tasks in view" description="Nothing matches your current filters. Try a different view or capture the next idea in your head." steps={['Relax or clear your filters', 'Use the quick add bar above to capture the next idea', 'Open Task Hub from the sidebar to start fresh']} /> :
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-xs)' }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-hover)' }}>
                  <th className="w-10 px-4 py-3" />
                  {(
                    [
                      { key: 'title' as SortField, label: 'Task', width: '' },
                      { key: 'status' as SortField, label: 'Status', width: 'w-[130px]' },
                      { key: 'priority' as SortField, label: 'Priority', width: 'w-[110px]' },
                      { key: 'assignee' as SortField, label: 'Assignee', width: 'w-[160px]' },
                      { key: 'dueDate' as SortField, label: 'Due', width: 'w-[100px]' },
                    ] as const
                  ).map(col => (
                    <th
                      key={col.key}
                      className={clsx('px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider cursor-pointer select-none', col.width)}
                      style={{ color: 'var(--color-muted)' }}
                      onClick={() => toggleSort(col.key)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {listSort === col.key && (
                          listSortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                        )}
                        {listSort !== col.key && <ArrowUpDown size={10} className="opacity-30" />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {sorted.map((task, i) => (
                    <ListRow key={task._id} task={task} index={i} onClick={() => openInspector('task', task._id)} />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {!loading && view === 'calendar' && (
          <CalendarMiniView tasks={filtered} />
        )}
      </div>
    </div>
  );
}
