import { memo, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Sparkles, ChevronDown, CheckCircle2, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { format, parseISO } from 'date-fns';
import { ContextMenu } from '../ui/ContextMenu';
import { Trash2, Edit2, Archive } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';

interface Task {
  _id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  description?: string;
  dueDate?: string;
  assignees?: Array<{ name: string; email: string; avatarUrl?: string }>;
  tags?: Array<{ name: string; color: string }>;
  dependencies?: any[];
  parentTaskId?: any;
  storyPoints?: number;
  taskType?: string;
}

interface TaskCardProps {
  task: Task;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onClick?: () => void;
}

const PRIORITY_COLORS: Record<string, { dot: string; label: string; edge: string }> = {
  urgent: { dot: 'priority-dot-urgent', label: 'Urgent', edge: 'var(--color-danger)' },
  high:   { dot: 'priority-dot-high',   label: 'High',   edge: 'var(--color-warning)' },
  medium: { dot: 'priority-dot-medium', label: 'Medium', edge: 'var(--color-accent)' },
  low:    { dot: 'priority-dot-low',    label: 'Low',    edge: 'var(--color-border)' },
};

function TaskCard({ task, isSelected, onToggleSelect, onClick }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { deleteTask, updateTask } = useTaskStore() as any;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id, data: { type: 'Task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const pConf = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.low;
  const hasDescription = Boolean(task.description);
  const hasAssignees = Boolean(task.assignees && task.assignees.length > 0);
  const hasTags = Boolean(task.tags && task.tags.length > 0);
  const aiWorthy = task.priority === 'urgent' || task.priority === 'high';
  const today = format(new Date(), 'yyyy-MM-dd');
  const isOverdue = task.dueDate && task.dueDate < today && task.status !== 'done';

  const handleExpand = () => {
    setExpanded(prev => !prev);
  };

  return (
    <ContextMenu items={[
      { label: 'Edit Task', icon: <Edit2 size={14} />, onClick: () => { if (onClick) onClick(); } },
      { label: task.status === 'done' ? 'Mark as Todo' : 'Mark as Done', icon: <CheckCircle2 size={14} />, onClick: () => updateTask(task._id, { status: task.status === 'done' ? 'todo' : 'done' }) },
      { divider: true, label: '' },
      { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => deleteTask(task._id), danger: true }
    ]}>
    <div
      ref={setNodeRef}
      className={clsx('kanban-card group relative', isDragging && 'z-50 scale-[1.02]')}
      style={{
        ...style,
        borderLeft: `2.5px solid ${pConf.edge}`,
        boxShadow: isDragging ? 'var(--shadow-lg)' : undefined,
        borderColor: isSelected ? 'var(--color-accent)' : undefined,
        backgroundColor: isSelected ? 'var(--color-accent-ghost)' : undefined,
      }}
      onClick={onClick}
    >
      {/* Top row: handle, select, type, AI hint */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          {onToggleSelect && (
            <input
              type="checkbox"
              className="checkbox w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ opacity: isSelected ? 1 : undefined }}
              checked={isSelected}
              onChange={() => onToggleSelect(task._id)}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <div {...attributes} {...listeners} className="cursor-grab p-0.5 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical size={13} style={{ color: 'var(--color-foreground-tertiary)' }} />
          </div>
          
          {task.taskType && (
            <span className="text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: 'var(--color-surface-active)',
                color: 'var(--color-foreground-tertiary)',
                padding: '1px 5px',
                borderRadius: 'var(--radius-xs)',
              }}>
              {task.taskType}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {aiWorthy && (
            <span className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider opacity-0 transition-opacity group-hover:opacity-100"
              style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
              <Sparkles size={9} /> AI
            </span>
          )}
          {task.storyPoints ? (
            <span className="text-[11px] font-bold"
              style={{
                background: 'var(--color-accent-ghost)',
                color: 'var(--color-accent)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-sm)',
              }}>
              {task.storyPoints}sp
            </span>
          ) : null}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-[13px] font-medium leading-snug mb-2.5"
        style={{ color: 'var(--color-foreground)' }}>
        {task.title}
      </h3>

      {/* Bottom row: Priority, Due Date, Expand, Assignees */}
      <div className="flex items-center justify-between gap-2 mt-auto pt-2"
        style={{ borderTop: '1px solid var(--color-border-light)' }}>
        <div className="flex items-center gap-2">
          {/* Priority dot */}
          <span className={clsx('priority-dot shrink-0', pConf.dot)} />
          {/* Due date */}
          {task.dueDate && (
            <span className="text-[11px] font-medium"
              style={{ color: isOverdue ? 'var(--color-danger)' : 'var(--color-foreground-tertiary)' }}>
              {isOverdue ? 'Overdue' : format(parseISO(task.dueDate), 'MMM d')}
            </span>
          )}
          
          {/* Expand toggle */}
          {(hasDescription || hasTags) && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); handleExpand(); }}
              className="rounded p-0.5 transition-colors hover:bg-[color:var(--color-surface-active)]"
              aria-label="Expand task details"
              style={{ color: 'var(--color-foreground-tertiary)' }}
            >
              <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="flex">
                <ChevronDown size={13} />
              </motion.span>
            </button>
          )}
        </div>

        {/* Assignee avatars */}
        <div className="flex items-center gap-1.5">
          {hasAssignees && (
            <div className="avatar-stack">
              {task.assignees!.slice(0, 3).map((a: any) => (
                <div
                  key={a.email}
                  className="avatar avatar-xs"
                  title={a.name}
                  style={{ background: 'var(--color-accent)', color: '#fff', border: '1.5px solid var(--color-surface)' }}
                >
                  {a.avatarUrl ? <img src={a.avatarUrl} alt={a.name} /> : a.name.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          )}
          <ChevronRight
            size={13}
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block"
            style={{ color: 'var(--color-foreground-tertiary)' }}
          />
        </div>
      </div>

      {/* Expandable Section */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2 border-t pt-3" style={{ borderColor: 'var(--color-border-light)' }}>
              {hasDescription && (
                <p className="line-clamp-2 text-[12px] leading-relaxed" style={{ color: 'var(--color-foreground-secondary)' }}>
                  {task.description}
                </p>
              )}

              {hasTags && (
                <div className="flex flex-wrap gap-1.5">
                  {task.tags!.slice(0, 3).map(tag => (
                    <span key={tag.name} className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: `${tag.color}22`, color: tag.color }}>
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className={clsx(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                  task.status === 'done' ? 'bg-[color:var(--color-success-light)] text-[color:var(--color-success)]' : 'bg-[color:var(--color-surface-active)] text-[color:var(--color-foreground-tertiary)]'
                )}>
                  {task.status === 'done' && <CheckCircle2 size={10} />}
                  {task.status.replace('-', ' ')}
    <div
      ref={setNodeRef}
      className={clsx('kanban-card group relative', isDragging && 'z-50 scale-[1.02]')}
      style={{
        ...style,
        borderLeft: `2.5px solid ${pConf.edge}`,
        boxShadow: isDragging ? 'var(--shadow-lg)' : undefined,
        borderColor: isSelected ? 'var(--color-accent)' : undefined,
        backgroundColor: isSelected ? 'var(--color-accent-ghost)' : undefined,
      }}
      onClick={onClick}
    >
      {/* Top row: handle, select, type, AI hint */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          {onToggleSelect && (
            <input
              type="checkbox"
              className="checkbox w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ opacity: isSelected ? 1 : undefined }}
              checked={isSelected}
              onChange={() => onToggleSelect(task._id)}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <div {...attributes} {...listeners} className="cursor-grab p-0.5 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical size={13} style={{ color: 'var(--color-foreground-tertiary)' }} />
          </div>
          
          {task.taskType && (
            <span className="text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: 'var(--color-surface-active)',
                color: 'var(--color-foreground-tertiary)',
                padding: '1px 5px',
                borderRadius: 'var(--radius-xs)',
              }}>
              {task.taskType}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {aiWorthy && (
            <span className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider opacity-0 transition-opacity group-hover:opacity-100"
              style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
              <Sparkles size={9} /> AI
            </span>
          )}
          {task.storyPoints ? (
            <span className="text-[11px] font-bold"
              style={{
                background: 'var(--color-accent-ghost)',
                color: 'var(--color-accent)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-sm)',
              }}>
              {task.storyPoints}sp
            </span>
          ) : null}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-[13px] font-medium leading-snug mb-2.5"
        style={{ color: 'var(--color-foreground)' }}>
        {task.title}
      </h3>

      {/* Bottom row: Priority, Due Date, Expand, Assignees */}
      <div className="flex items-center justify-between gap-2 mt-auto pt-2"
        style={{ borderTop: '1px solid var(--color-border-light)' }}>
        <div className="flex items-center gap-2">
          {/* Priority dot */}
          <span className={clsx('priority-dot shrink-0', pConf.dot)} />
          {/* Due date */}
          {task.dueDate && (
            <span className="text-[11px] font-medium"
              style={{ color: isOverdue ? 'var(--color-danger)' : 'var(--color-foreground-tertiary)' }}>
              {isOverdue ? 'Overdue' : format(parseISO(task.dueDate), 'MMM d')}
            </span>
          )}
          
          {/* Expand toggle */}
          {(hasDescription || hasTags) && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); handleExpand(); }}
              className="rounded p-0.5 transition-colors hover:bg-[color:var(--color-surface-active)]"
              aria-label="Expand task details"
              style={{ color: 'var(--color-foreground-tertiary)' }}
            >
              <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="flex">
                <ChevronDown size={13} />
              </motion.span>
            </button>
          )}
        </div>

        {/* Assignee avatars */}
        <div className="flex items-center gap-1.5">
          {hasAssignees && (
            <div className="avatar-stack">
              {task.assignees!.slice(0, 3).map((a: any) => (
                <div
                  key={a.email}
                  className="avatar avatar-xs"
                  title={a.name}
                  style={{ background: 'var(--color-accent)', color: '#fff', border: '1.5px solid var(--color-surface)' }}
                >
                  {a.avatarUrl ? <img src={a.avatarUrl} alt={a.name} /> : a.name.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          )}
          <ChevronRight
            size={13}
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block"
            style={{ color: 'var(--color-foreground-tertiary)' }}
          />
        </div>
      </div>

      {/* Expandable Section */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2 border-t pt-3" style={{ borderColor: 'var(--color-border-light)' }}>
              {hasDescription && (
                <p className="line-clamp-2 text-[12px] leading-relaxed" style={{ color: 'var(--color-foreground-secondary)' }}>
                  {task.description}
                </p>
              )}

              {hasTags && (
                <div className="flex flex-wrap gap-1.5">
                  {task.tags!.slice(0, 3).map(tag => (
                    <span key={tag.name} className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: `${tag.color}22`, color: tag.color }}>
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className={clsx(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                  task.status === 'done' ? 'bg-[color:var(--color-success-light)] text-[color:var(--color-success)]' : 'bg-[color:var(--color-surface-active)] text-[color:var(--color-foreground-tertiary)]'
                )}>
                  {task.status === 'done' && <CheckCircle2 size={10} />}
                  {task.status.replace('-', ' ')}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </ContextMenu>
  );
}

export default memo(TaskCard);
