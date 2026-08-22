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
import { SkeletonTable } from '../components/ui/Skeleton';
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
    <div className="page flex flex-col h-[calc(100vh-80px)] relative z-10 max-w-[1400px] mx-auto">
      
      {/* Header & Command Bar (Unified) */}
      <div className="mb-6 flex flex-col gap-4 pt-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-[24px] font-display font-semibold tracking-tight leading-none text-[color:var(--color-foreground)]">
              Tasks
            </h1>
            <span className="badge badge-neutral mt-1">{filtered.length}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="inline-flex rounded-lg p-1 bg-surface-active border border-border">
              {viewButtons.map(vb => (
                <button
                  key={vb.mode}
                  onClick={() => setView(vb.mode)}
                  className={clsx(
                    'relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors',
                    view === vb.mode ? 'text-[color:var(--color-foreground)]' : 'text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground-secondary)]'
                  )}
                >
                  {view === vb.mode && (
                    <motion.span
                      layoutId="tasks-view-pill"
                      className="absolute inset-0 rounded-md bg-[color:var(--color-surface)] shadow-xs border border-border"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <vb.icon size={14} />
                    <span className="hidden sm:inline">{vb.label}</span>
                  </span>
                </button>
              ))}
            </div>
            <button onClick={() => setQuickTitle('New task')} className="btn btn-sm btn-primary shadow-xs rounded-lg">
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        {/* Command Bar */}
        <div className="flex items-center gap-3 bg-surface border border-border rounded-xl p-1.5 shadow-xs transition-colors focus-within:border-accent">
          <div className="flex-1 flex items-center gap-2 px-2">
            <Search size={16} className="text-muted" />
            <input
              placeholder="Search tasks or press '/' to command..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-[13px] font-medium text-foreground placeholder-muted"
            />
            {search && (
              <button onClick={() => setSearch('')} className="p-1 hover:bg-surface-hover rounded-md text-muted transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
          
          <div className="w-px h-5 bg-border mx-1" />

          {/* Contextual Filters */}
          <div className="flex items-center gap-1">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none bg-surface-hover border border-transparent hover:border-border rounded-lg px-3 py-1.5 text-[12px] font-semibold text-foreground-secondary outline-none transition-colors cursor-pointer"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{statusLabels[s]}</option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="appearance-none bg-surface-hover border border-transparent hover:border-border rounded-lg px-3 py-1.5 text-[12px] font-semibold text-foreground-secondary outline-none transition-colors cursor-pointer"
            >
              {PRIORITY_OPTIONS.map(p => (
                <option key={p} value={p}>{priorityLabels[p]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Inline Quick Add (Appears when quickTitle is active) */}
        <AnimatePresence>
          {quickTitle && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-accent-ghost border border-accent/20 rounded-xl p-3 flex items-center gap-3">
              <Plus size={16} className="text-accent" />
              <input
                 autoFocus
                 value={quickTitle === 'New task' ? '' : quickTitle}
                 onChange={e => setQuickTitle(e.target.value)}
                 onKeyDown={e => {
                   if (e.key === 'Enter') handleQuickAdd();
                   if (e.key === 'Escape') setQuickTitle('');
                 }}
                 placeholder="What needs to be done?"
                 className="flex-1 bg-transparent border-none outline-none text-[14px] font-medium text-foreground"
              />
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Press Enter</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {loading && <div className="p-4"><SkeletonTable rows={6} cols={4} /></div>}

        {!loading && view === 'kanban' && (
          filtered.length === 0 ? <EmptyState icon={Inbox} title="No tasks found" description="Clear filters or create a new task." /> :
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
          filtered.length === 0 ? <EmptyState icon={Inbox} title="No tasks found" description="Clear filters or create a new task." /> :
          <div className="rounded-2xl border border-border bg-surface shadow-xs overflow-hidden h-full flex flex-col">
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-[13px]">
                <thead className="sticky top-0 bg-surface z-10 shadow-[0_1px_0_var(--color-border)]">
                  <tr>
                    <th className="w-10 px-4 py-3" />
                    {(
                      [
                        { key: 'title' as SortField, label: 'Task', width: '' },
                        { key: 'status' as SortField, label: 'Status', width: 'w-[130px]' },
                        { key: 'priority' as SortField, label: 'Priority', width: 'w-[110px]' },
                        { key: 'assignee' as SortField, label: 'Assignee', width: 'w-[120px]' },
                        { key: 'dueDate' as SortField, label: 'Due', width: 'w-[100px]' },
                      ] as const
                    ).map(col => (
                      <th
                        key={col.key}
                        className={clsx('px-4 py-3 text-left text-[11px] font-semibold text-foreground-tertiary cursor-pointer hover:text-foreground transition-colors', col.width)}
                        onClick={() => toggleSort(col.key)}
                      >
                        <div className="flex items-center gap-1.5">
                          {col.label}
                          {listSort === col.key ? (
                            listSortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                          ) : (
                            <ArrowUpDown size={10} className="opacity-0 group-hover:opacity-50" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <AnimatePresence>
                    {sorted.map((task, i) => (
                      <ListRow key={task._id} task={task} index={i} onClick={() => openInspector('task', task._id)} />
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && view === 'calendar' && (
          <CalendarMiniView tasks={filtered} />
        )}
      </div>
    </div>
  );
}
