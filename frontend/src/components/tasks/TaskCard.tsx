import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, GripVertical } from 'lucide-react';
import clsx from 'clsx';

interface Task {
  _id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  dependencies?: any[];
  parentTaskId?: any;
}

interface TaskCardProps {
  task: Task;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onClick?: () => void;
}

const priorityColors = {
  low: 'bg-[color:var(--color-surface-active)] text-[color:var(--color-muted)]',
  medium: 'bg-[color:var(--color-info-light)] text-[color:var(--color-info)]',
  high: 'bg-[color:var(--color-warning-light)] text-[color:var(--color-warning)]',
  urgent: 'bg-[color:var(--color-danger-light)] text-[color:var(--color-danger)]',
};

function TaskCard({ task, isSelected, onToggleSelect, onClick }: TaskCardProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'group relative cursor-grab rounded-xl border bg-[color:var(--color-surface)] p-3 shadow-sm transition-all active:cursor-grabbing',
        isDragging ? 'z-50 scale-[1.01] border-[color:var(--color-accent)]/30 shadow-float' : 'border-border hover:shadow-soft',
        isSelected ? 'ring-2 ring-[color:var(--color-accent)]' : ''
      )}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
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

      <h3 className="pr-12 text-sm font-medium text-[color:var(--color-foreground)]">{task.title}</h3>

      <div className="mt-3 flex items-center justify-between">
        <span className={clsx('rounded-full px-2 py-1 text-[11px] font-semibold', priorityColors[task.priority])}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>

        <div className="flex items-center gap-2 text-[11px] text-[color:var(--color-muted)]">
          {task.dependencies && task.dependencies.length > 0 && (
            <div className="flex items-center gap-1" title="Has dependencies">
              <span className="text-[10px] font-bold text-amber-500">⚠ Dep</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(TaskCard);
