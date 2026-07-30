import { useState, useEffect } from 'react';
import { X, Calendar, Check } from 'lucide-react';
import { Dialog, DialogPanel, DialogTitle, DialogDescription } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import TaskComments from './TaskComments';

export default function TaskModal({
  isOpen = true,
  onClose,
  onSave,
  initialData,
}: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setDescription(initialData?.description || '');
      setDueDate(initialData?.dueDate || initialData?.initialDate || '');
      setPriority(initialData?.priority || 'medium');
      setStatus(initialData?.status || 'todo');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, description, dueDate, priority, status });
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogPanel>
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full bg-[color:var(--color-surface-hover)] p-2 text-[color:var(--color-muted)]"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--color-accent)]/10 text-[color:var(--color-accent)]">
            <Check size={20} />
          </div>
          <div>
            <DialogTitle>{initialData?._id ? 'Edit task' : 'Create task'}</DialogTitle>
            <DialogDescription>Capture the next thing worth doing.</DialogDescription>
          </div>
        </div>

        <div className={initialData?._id ? "grid grid-cols-1 md:grid-cols-2 gap-6" : ""}>
          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[color:var(--color-foreground)]">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Finalize presentation slides" required autoFocus />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[color:var(--color-foreground)]">Due date</label>
            <div className="relative">
              <Calendar size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-muted)]" />
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="pl-10" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[color:var(--color-foreground)]">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-[color:var(--color-background)] border text-sm outline-none"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[color:var(--color-foreground)]">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-[color:var(--color-background)] border text-sm outline-none"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[color:var(--color-foreground)]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[110px] w-full rounded-xl border border-border bg-[color:var(--color-background)] px-3.5 py-2.5 text-sm text-[color:var(--color-foreground)] outline-none transition-all focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)]/15"
              placeholder="Add notes, context, or subtasks…"
            />
          </div>

            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={onClose} className="sm:w-auto">Cancel</Button>
              <Button type="submit" className="sm:w-auto">Save task</Button>
            </div>
          </form>

          {initialData?._id && (
            <div className="flex flex-col rounded-xl border border-border bg-surface-hover h-full max-h-[400px]">
              <div className="p-3 border-b border-border bg-[color:var(--color-surface)] rounded-t-xl">
                <h4 className="text-xs font-semibold text-[color:var(--color-foreground)]">Activity & Comments</h4>
              </div>
              <TaskComments taskId={initialData._id} />
            </div>
          )}
        </div>
      </DialogPanel>
    </Dialog>
  );
}
