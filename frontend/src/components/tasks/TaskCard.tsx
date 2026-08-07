import { memo, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, GripVertical, Sparkles, ChevronDown, Link2, CheckCircle2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';

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
}

interface TaskCardProps {
  task: Task;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onClick?: () => void;
}

const priorityColors: Record<string, { badge: string; edge: string; glow: string }> = {
  low: { badge: 'bg-[color:var(--color-surface-active)] text-[color:var(--color-muted)]', edge: 'var(--color-foreground-tertiary)', glow: 'none' },
  medium: { badge: 'bg-[color:var(--color-info-light)] text-[color:var(--color-info)]', edge: 'var(--color-info)', glow: 'none' },
  high: { badge: 'bg-[color:var(--color-warning-light)] text-[color:var(--color-warning)]', edge: 'var(--color-warning)', glow: '0 0 14px var(--color-warning)' },
  urgent: { badge: 'bg-[color:var(--color-danger-light)] text-[color:var(--color-danger)]', edge: 'var(--color-danger)', glow: '0 0 14px var(--color-danger)' },
};

function TaskCard({ task, isSelected, onToggleSelect, onClick }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
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

  const pc = priorityColors[task.priority] || priorityColors.low;
  const hasDescription = Boolean(task.description);
  const hasAssignees = Boolean(task.assignees && task.assignees.length > 0);
  const hasTags = Boolean(task.tags && task.tags.length > 0);
  const aiWorthy = task.priority === 'urgent' || task.priority === 'high';

  const handleExpand = () => {
    setExpanded(prev => !prev);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'group relative cursor-grab rounded-xl border bg-[color:var(--color-surface)] p-3 pl-4 shadow-sm transition-all active:cursor-grabbing',
        isDragging ? 'z-50 scale-[1.01] border-[color:var(--color-accent)]/30 shadow-float' : 'border-border hover:shadow-soft',
        isSelected ? 'ring-2 ring-[color:var(--color-accent)]' : ''
      )}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      {/* Priority light edge */}
      <span
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
        style={{ background: pc.edge, boxShadow: pc.glow }}
      />

      {/* AI hint — the task knows it could help */}
      {aiWorthy && (
        <span className="pointer-events-none absolute right-2 top-2 flex items-center gap-1 rounded-full bg-gradient-to-r from-[color:var(--color-accent)] to-[color:var(--color-info)] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          <Sparkles size={9} /> AI can help
        </span>
      )}

      <div className="absolute right-2 top-2 flex gap-2 text-[color:var(--color-muted)] opacity-0 transition-opacity group-hover:opacity-100">
        {onToggleSelect && (
          <input
            type="checkbox"
            className="cursor-pointer"
            checked={isSelected}
            onChange={() => onToggleSelect(task._id)}
            onPointerDown={(e) => e.stopPropagation()}
          />
        )}
        <GripVertical size={14} />
      </div>

      <h3 className="pr-14 text-sm font-medium text-[color:var(--color-foreground)]">{task.title}</h3>

      <div className="mt-3 flex items-center justify-between">
        <span className={clsx('rounded-full px-2 py-1 text-[11px] font-semibold', pc.badge)}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>

        <div className="flex items-center gap-2 text-[11px] text-[color:var(--color-muted)]">
          {task.dependencies && task.dependencies.length > 0 && (
            <div className="flex items-center gap-1" title="Has dependencies">
              <Link2 size={11} className="text-amber-500" />
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>Today</span>
          </div>
          {hasDescription && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); handleExpand(); }}
              className="rounded p-0.5 transition-colors hover:bg-[color:var(--color-surface-active)]"
              aria-label="Expand task"
            >
              <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="flex">
                <ChevronDown size={13} />
              </motion.span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable intelligence */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2 border-t border-[color:var(--color-border-light)] pt-3">
              {hasDescription && (
                <p className="line-clamp-2 text-xs font-medium leading-relaxed text-[color:var(--color-foreground-secondary)]">
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

              <div className="flex items-center justify-between">
                {hasAssignees ? (
                  <div className="flex -space-x-1.5">
                    {task.assignees!.slice(0, 3).map(a => (
                      <div key={a.email} className="avatar avatar-sm" title={a.name}>
                        {a.avatarUrl ? <img src={a.avatarUrl} alt={a.name} /> : a.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-muted)]">Unassigned</span>
                )}

                <span className={clsx(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                  task.status === 'done' ? 'bg-[color:var(--color-success-light)] text-[color:var(--color-success)]' : 'bg-[color:var(--color-surface-active)] text-[color:var(--color-muted)]'
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
  );
}

export default memo(TaskCard);
