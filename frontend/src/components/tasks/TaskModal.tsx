import { useState, useEffect } from 'react';
import { X, Calendar, Check } from 'lucide-react';

export default function TaskModal({
  isOpen = true,
  onClose,
  onSave,
  initialData = {},
}) {
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [dueDate, setDueDate] = useState(initialData.due_date || initialData.initialDate || '');

  useEffect(() => {
    setTitle(initialData.title || '');
    setDescription(initialData.description || '');
    setDueDate(initialData.due_date || initialData.initialDate || '');
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave({
      title,
      description,
      due_date: dueDate,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="card-glass w-full max-w-2xl rounded-[2rem] border-white/10 p-8 relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="mb-6 flex items-center gap-3 text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-brand to-purple-500 shadow-lg shadow-brand/20">
            <Check size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Create task</h2>
            <p className="text-sm text-slate-400">Add the next item to your daily workflow.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              Title
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                required
              />
            </label>

            <label className="space-y-2 text-sm text-slate-300">
              Due date
              <div className="relative">
                <Calendar size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input pl-11"
                />
              </div>
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-300">
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input min-h-[140px] resize-none"
              rows={5}
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost w-full sm:w-auto"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary w-full sm:w-auto">
              Save task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
