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
    <div className="flex flex-col flex-1 min-w-[300px] max-w-[350px]">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="font-semibold text-gray-700 capitalize flex items-center gap-2">
          {title.replace('-', ' ')}
          <span className="bg-gray-100 text-gray-500 text-xs py-0.5 px-2 rounded-full font-medium">
            {tasks.length}
          </span>
        </h2>
      </div>

      <div
        ref={setNodeRef}
        className={clsx(
          'flex-1 p-2 rounded-2xl bg-gray-50 border-2 transition-colors min-h-[500px]',
          isOver ? 'border-blue-200 bg-blue-50/50' : 'border-transparent'
        )}
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
