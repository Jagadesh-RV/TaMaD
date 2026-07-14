import { useState } from 'react';
import { Plus } from 'lucide-react';
import TaskBoard from '../components/tasks/TaskBoard';
import TaskModal from '../components/tasks/TaskModal';
import { useTaskStore } from '../store/taskStore';

export default function TasksPage() {
  const { createTask } = useTaskStore() as any;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveTask = async (taskData: any) => {
    await createTask({
      title: taskData.title,
      description: taskData.description,
      dueDate: taskData.dueDate,
      status: 'todo',
      priority: 'medium',
      workspaceId: '000000000000000000000000'
    });
  };

  return (
    <div className="page flex flex-col h-[calc(100vh-80px)] relative z-10">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="page-title mb-0">Tasks</h1>
          <p className="text-secondary mt-1 text-sm font-medium">
            Manage your workflow across different stages.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
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

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
      />
    </div>
  );
}