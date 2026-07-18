import { useState } from 'react';
import { Plus } from 'lucide-react';
import TaskBoard from '../components/tasks/TaskBoard';
import TaskModal from '../components/tasks/TaskModal';
import { useTaskStore } from '../store/taskStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function TasksPage() {
  const { createTask, updateTask } = useTaskStore() as any;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [editingTask, setEditingTask] = useState<any>(null);

  const handleOpenNewTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleTaskClick = (task: any) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData: any) => {
    if (editingTask) {
      await updateTask(editingTask._id, {
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
      });
    } else {
      await createTask({
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
        status: 'todo',
        priority: 'medium',
        workspaceId: '000000000000000000000000'
      });
    }
  };

  const handleQuickAdd = async () => {
    if (!quickTitle.trim()) return;
    await createTask({
      title: quickTitle.trim(),
      description: '',
      dueDate: '',
      status: 'todo',
      priority: 'medium',
      workspaceId: '000000000000000000000000',
    });
    setQuickTitle('');
  };

  return (
    <div className="page flex flex-col h-[calc(100vh-80px)] relative z-10">
      <div className="mb-6 flex shrink-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="page-title mb-0">Tasks</h1>
          <p className="mt-1 text-sm font-medium text-[color:var(--color-muted)]">
            Manage your workflow across different stages.
          </p>
        </div>

        <button 
          onClick={handleOpenNewTask}
          className="btn-primary flex max-w-[160px] items-center justify-center gap-2"
        >
          <Plus size={20} />
          New Task
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-2 rounded-2xl border border-border bg-[color:var(--color-surface)] p-3 shadow-soft sm:flex-row">
        <Input value={quickTitle} onChange={(event) => setQuickTitle(event.target.value)} placeholder="Quick add a task…" className="sm:flex-1" />
        <Button onClick={handleQuickAdd} className="sm:w-auto">Add</Button>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <TaskBoard onTaskClick={handleTaskClick} />
      </div>

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        onSave={handleSaveTask}
        initialData={editingTask}
      />
    </div>
  );
}