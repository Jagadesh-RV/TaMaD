import { Plus } from 'lucide-react';
import TaskBoard from '../components/tasks/TaskBoard';
import { useTaskStore } from '../store/taskStore';

export default function TasksPage() {
  const { createTask } = useTaskStore();

  const handleNewTask = async () => {
    const title = window.prompt('Enter task title:');
    if (!title) return;

    await createTask({
      title,
      status: 'todo',
      priority: 'medium',
      workspaceId: '000000000000000000000000'
    });
  };

  return (
    <div className="page flex flex-col h-[calc(100vh-80px)]">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="page-title mb-0">Tasks</h1>
          <p className="text-secondary mt-1 text-sm">
            Manage your workflow across different stages.
          </p>
        </div>

        <button 
          onClick={handleNewTask}
          className="btn-primary flex items-center justify-center gap-2 max-w-[160px]"
        >
          <Plus size={20} />
          New Task
        </button>
      </div>

      {/* The Kanban Board */}
      <div className="flex-1 overflow-hidden min-h-0">
        <TaskBoard />
      </div>
    </div>
  );
}