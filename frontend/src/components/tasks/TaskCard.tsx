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
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
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
        'group relative bg-white rounded-xl border p-4 shadow-sm transition-all hover:shadow-md cursor-grab active:cursor-grabbing',
        isDragging ? 'opacity-50 border-blue-500 shadow-lg scale-105 z-50' : 'border-gray-200'
      )}
      {...attributes}
      {...listeners}
    >
      <div className="absolute top-4 right-2 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical size={16} />
      </div>

      <h3 className="font-medium text-gray-900 pr-6 mb-2 line-clamp-2">
        {task.title}
      </h3>

      <div className="flex items-center justify-between mt-4">
        <span
          className={clsx(
            'text-xs font-semibold px-2.5 py-1 rounded-full',
            priorityColors[task.priority]
          )}
        >
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>

        <div className="flex items-center text-gray-400 text-xs gap-1">
          <Clock size={12} />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
