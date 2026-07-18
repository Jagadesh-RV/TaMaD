import { useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import TaskColumn from './TaskColumn';
import TaskCard from './TaskCard';
import { useTaskStore } from '../../store/taskStore';
import { useAuthStore } from '../../store/authStore';
import { Trash2, CheckCircle2 } from 'lucide-react';

const COLUMNS = ['todo', 'in-progress', 'review', 'done'];

export default function TaskBoard({ onTaskClick }: { onTaskClick?: (task: any) => void }) {
  const { tasks, fetchTasks, loading, reorderTask, bulkUpdate, bulkDelete } = useTaskStore();
  
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  
  // We maintain a local copy of tasks for smooth drag and drop
  // We'll sync this with the global store when dragging ends
  const [localTasks, setLocalTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);

  // Sync local tasks when global tasks change
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    // Assuming workspaceId is 'default' for now
    fetchTasks('default');
  }, [fetchTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleToggleSelect = (id: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedTaskIds.length} tasks?`)) {
      bulkDelete(selectedTaskIds, '000000000000000000000000');
      setSelectedTaskIds([]);
    }
  };

  const handleBulkComplete = () => {
    bulkUpdate(selectedTaskIds, { status: 'done' }, '000000000000000000000000');
    setSelectedTaskIds([]);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = localTasks.find((t) => t._id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    // Dropping a Task over another Task
    if (isActiveTask && isOverTask) {
      setLocalTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t._id === activeId);
        const overIndex = tasks.findIndex((t) => t._id === overId);

        if (tasks[activeIndex].status !== tasks[overIndex].status) {
          // Moving between columns
          const updatedTasks = [...tasks];
          updatedTasks[activeIndex].status = tasks[overIndex].status;
          return arrayMove(updatedTasks, activeIndex, overIndex);
        }

        // Reordering in same column
        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    // Dropping a Task over an empty column area
    if (isActiveTask && isOverColumn) {
      setLocalTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t._id === activeId);
        const updatedTasks = [...tasks];
        updatedTasks[activeIndex].status = overId as string;
        return arrayMove(updatedTasks, activeIndex, activeIndex);
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeTask = localTasks.find(t => t._id === active.id);
    if (!activeTask) return;
    
    const newIndex = localTasks.findIndex(t => t._id === active.id);
    const orderScore = newIndex * 1000; // simple ordering logic for now
    
    // Call API to save new position
    reorderTask(active.id as string, activeTask.status, orderScore).then(() => {
      // Refresh to ensure we have the correct server state
      fetchTasks('default');
    });
  };

  if (loading && localTasks.length === 0) {
    return <div className="p-8 text-center text-gray-500">Loading tasks...</div>;
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 pt-2 h-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {COLUMNS.map((colId) => (
          <TaskColumn
            key={colId}
            id={colId}
            title={colId}
            tasks={localTasks.filter((t) => t.status === colId)}
            selectedTaskIds={selectedTaskIds}
            onToggleSelect={handleToggleSelect}
            onTaskClick={onTaskClick}
          />
        ))}

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Bulk Actions Bar */}
      {selectedTaskIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-2xl border border-border bg-[color:var(--color-surface)] px-6 py-3 shadow-float">
          <span className="text-sm font-semibold text-[color:var(--color-foreground)]">
            {selectedTaskIds.length} selected
          </span>
          <div className="h-6 w-px bg-border" />
          <button onClick={handleBulkComplete} className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors">
            <CheckCircle2 size={16} /> Mark Done
          </button>
          <button onClick={handleBulkDelete} className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 size={16} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
