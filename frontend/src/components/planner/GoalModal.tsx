import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Target } from 'lucide-react';

export default function GoalModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('professional');
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setDescription(initialData?.description || '');
      setType(initialData?.type || 'professional');
      setTargetDate(initialData?.targetDate ? initialData.targetDate.split('T')[0] : '');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, description, type, targetDate, milestones: [] });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xl rounded-[24px] border border-border shadow-float p-8 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full"
        >
          <X size={20} />
        </button>

        <div className="mb-8 flex items-center gap-4 text-[#111111]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Target size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">New Goal</h2>
            <p className="text-sm font-medium text-gray-500">Create a long-term goal to track.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Goal Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#111111] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              placeholder="e.g., Launch MVP"
              required
              autoFocus
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#111111] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              >
                <option value="professional">Professional</option>
                <option value="personal">Personal</option>
                <option value="health">Health</option>
                <option value="financial">Financial</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#111111] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#111111] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium min-h-[100px] resize-none"
              placeholder="Add details about this goal..."
            />
          </div>

          <div className="pt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors w-full sm:w-auto"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary px-8 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700">
              Save Goal
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
