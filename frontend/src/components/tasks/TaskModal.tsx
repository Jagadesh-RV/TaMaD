import { useState, useEffect } from 'react';
import { X, Calendar, Check } from 'lucide-react';
import { Dialog, DialogPanel, DialogTitle, DialogDescription } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export default function TaskModal({
  isOpen = true,
  onClose,
  onSave,
  initialData,
}: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setDescription(initialData?.description || '');
      setDueDate(initialData?.dueDate || initialData?.initialDate || '');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, description, dueDate });
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
            <DialogTitle>Create task</DialogTitle>
            <DialogDescription>Capture the next thing worth doing.</DialogDescription>
          </div>
        </div>

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

          <div className="space-y-2">
            <label className="text-sm font-medium text-[color:var(--color-foreground)]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[110px] w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-[color:var(--color-foreground)] outline-none transition-all focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)]/15"
              placeholder="Add notes, context, or subtasks…"
            />
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={onClose} className="sm:w-auto">Cancel</Button>
            <Button type="submit" className="sm:w-auto">Save task</Button>
          </div>
        </form>
      </DialogPanel>
    </Dialog>
  );
}
