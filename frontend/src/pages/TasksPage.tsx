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
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

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

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: 'var(--color-surface-active)' }}>
        <Inbox size={28} style={{ color: 'var(--color-muted)' }} />
      </div>
      <p className="mb-1 text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>No tasks found</p>
      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{message}</p>
    </div>
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
        'group relative cursor-grab rounded-xl border p-3.5 transition-all active:cursor-grabbing',
        isDragging ? 'z-50 scale-[1.02] shadow-float' : 'shadow-xs hover:shadow-soft',
      )}
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      <div
        className="absolute inset-0 rounded-xl border-2 border-transparent transition-colors"
        style={{
          background: 'var(--color-surface)',
          borderColor: isDragging ? 'var(--color-accent)' : 'var(--color-border)',
        }}
      />

      <div className="relative">
        <div className="mb-2.5 flex items-start justify-between gap-2">
          <h4 className="text-[13px] font-medium leading-snug" style={{ color: 'var(--color-foreground)' }}>
            {task.title}
          </h4>
          <GripVertical size={14} className="shrink-0 opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: 'var(--color-muted)' }} />
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          <PriorityBadge priority={task.priority} />
          {task.tags?.slice(0, 2).map((tag: string) => (
            <span
              key={tag}
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ background: 'var(--color-surface-active)', color: 'var(--color-muted)' }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <MemberAvatar memberId={task.assignee} />
          {task.dueDate && (
            <span
              className={clsx(
                'inline-flex items-center gap-1 text-[11px] font-medium',
                isOverdue(task) && 'font-semibold',
              )}
              style={{ color: isOverdue(task) ? 'var(--color-danger)' : 'var(--color-muted)' }}
            >
              <Clock size={11} />
              {formatDueDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function KanbanOverlay({ task }: { task: Task }) {
  return (
    <div
      className="w-[300px] rounded-xl border p-3.5 shadow-float"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-accent)' }}
    >
      <h4 className="text-[13px] font-medium" style={{ color: 'var(--color-foreground)' }}>{task.title}</h4>
      <div className="mt-2"><PriorityBadge priority={task.priority} /></div>
    </div>
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
    <div className="flex min-w-[280px] max-w-[320px] flex-1 flex-col">
      <div className="mb-3 flex items-center gap-2.5 px-1">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>{label}</h3>
        <span
          className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold"
          style={{ background: 'var(--color-surface-active)', color: 'var(--color-muted)' }}
        >
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={clsx(
          'flex min-h-[480px] flex-1 flex-col rounded-2xl border p-2 transition-all',
          isOver ? 'border-[color:var(--color-accent)]/30' : '',
        )}
        style={{
          background: isOver ? 'var(--color-surface-hover)' : 'var(--color-surface-active)',
          borderColor: isOver ? 'var(--color-accent)' : 'var(--color-border-light)',
        }}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {tasks.map(task => (
                <KanbanCard key={task._id} task={task} onClick={() => onTaskClick(task)} />
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed p-6"
            style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>Drop tasks here</p>
          </div>
        )}
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
      className="cursor-pointer transition-colors"
      style={{ background: index % 2 === 1 ? 'var(--color-surface-hover)' : 'transparent' }}
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
          <p className="mt-1 text-sm font-medium" style={{ color: 'var(--color-muted)' }}>
            {filtered.length} task{filtered.length !== 1 ? 's' : ''} across your workflow
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
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all',
                )}
                style={{
                  background: view === vb.mode ? 'var(--color-surface)' : 'transparent',
                  color: view === vb.mode ? 'var(--color-accent)' : 'var(--color-muted)',
                  boxShadow: view === vb.mode ? 'var(--shadow-sm)' : 'none',
                }}
              >
                <vb.icon size={14} />
                {vb.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="mb-4 flex flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:items-center"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-xs)' }}
      >
        <div className="search-input flex-1">
          <Search size={16} style={{ color: 'var(--color-muted)' }} />
          <input
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="rounded p-0.5 transition-colors hover:bg-[color:var(--color-surface-active)]">
              <X size={14} style={{ color: 'var(--color-muted)' }} />
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl border px-3 py-2 text-[12px] font-medium outline-none transition-all"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{statusLabels[s]}{s !== 'all' && statusCounts[s] !== undefined ? ` (${statusCounts[s]})` : ''}</option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="rounded-xl border px-3 py-2 text-[12px] font-medium outline-none transition-all"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
        >
          {PRIORITY_OPTIONS.map(p => (
            <option key={p} value={p}>{priorityLabels[p]}</option>
          ))}
        </select>

        {(search || statusFilter !== 'all' || priorityFilter !== 'all') && (
          <button
            onClick={() => { setSearch(''); setStatusFilter('all'); setPriorityFilter('all'); }}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition-colors"
            style={{ color: 'var(--color-danger)', background: 'var(--color-danger-light)' }}
          >
            <X size={12} />
            Clear
          </button>
        )}
      </div>

      {/* Quick Add */}
      <div
        className="mb-4 flex items-center gap-3 rounded-2xl border p-2.5"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-xs)' }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--color-accent-light)' }}>
          <Plus size={16} style={{ color: 'var(--color-accent)' }} />
        </div>
        <input
          value={quickTitle}
          onChange={e => setQuickTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleQuickAdd()}
          placeholder="Quick add a task..."
          className="flex-1 bg-transparent text-[13px] font-medium outline-none"
          style={{ color: 'var(--color-foreground)' }}
        />
        {quickTitle.trim() && (
          <button
            onClick={handleQuickAdd}
            className="rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all"
            style={{ background: 'var(--color-accent)', color: 'white' }}
          >
            Add
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {loading && <LoadingSpinner text="Loading tasks..." />}

        {!loading && view === 'kanban' && (
          filtered.length === 0 ? <EmptyState message="Try adjusting your filters to see more tasks." /> :
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
                  onTaskClick={() => {}}
                />
              ))}
            </div>
            <DragOverlay>
              {activeTask ? <KanbanOverlay task={activeTask} /> : null}
            </DragOverlay>
          </DndContext>
        )}

        {!loading && view === 'list' && (
          filtered.length === 0 ? <EmptyState message="Try adjusting your filters to see more tasks." /> :
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
                    <ListRow key={task._id} task={task} index={i} onClick={() => {}} />
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
