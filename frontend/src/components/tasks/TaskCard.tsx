import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, GripVertical } from 'lucide-react';
import clsx from 'clsx';

interface Task {
  _id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
}

interface TaskCardProps {
  task: Task;
}

const priorityColors = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-sky-100 text-sky-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-rose-100 text-rose-700',
};

export default function TaskCard({ task }: TaskCardProps) {
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
        'group relative cursor-grab rounded-xl border border-border bg-[color:var(--color-surface)] p-3 shadow-sm transition-all active:cursor-grabbing',
        isDragging ? 'z-50 scale-[1.01] border-[color:var(--color-accent)]/30 shadow-float' : 'hover:shadow-soft'
      )}
      {...attributes}
      {...listeners}
    >
      <div className="absolute right-2 top-2 text-[color:var(--color-muted)] opacity-0 transition-opacity group-hover:opacity-100">
        <GripVertical size={14} />
      </div>

      <h3 className="pr-5 text-sm font-medium text-[color:var(--color-foreground)]">{task.title}</h3>

      <div className="mt-3 flex items-center justify-between">
        <span className={clsx('rounded-full px-2 py-1 text-[11px] font-semibold', priorityColors[task.priority])}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>

        <div className="flex items-center gap-1 text-[11px] text-[color:var(--color-muted)]">
          <Clock size={12} />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
