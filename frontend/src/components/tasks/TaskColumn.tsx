import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import clsx from 'clsx';

interface Task {
  _id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
}

interface TaskColumnProps {
  id: string;
  title: string;
  tasks: Task[];
}

export default function TaskColumn({ id, title, tasks }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: 'Column', columnId: id },
  });

  return (
    <div className="flex min-w-[280px] max-w-[320px] flex-1 flex-col">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="flex items-center gap-2 text-sm font-semibold capitalize text-[color:var(--color-foreground)]">
          {title.replace('-', ' ')}
          <span className="rounded-full bg-[color:var(--color-surface-hover)] px-2 py-0.5 text-[11px] text-[color:var(--color-muted)]">
            {tasks.length}
          </span>
        </h2>
      </div>

      <div
        ref={setNodeRef}
        className={clsx(
          'flex min-h-[480px] flex-1 flex-col rounded-2xl border p-2 transition-all',
          isOver ? 'border-[color:var(--color-accent)]/30 bg-[color:var(--color-surface-hover)]' : 'border-border bg-[color:var(--color-surface)]'
        )}
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
