import { useState, useEffect } from 'react';
import { X, Activity } from 'lucide-react';

const COLORS = [
  { value: 'text-blue-500 bg-blue-100', label: 'Blue' },
  { value: 'text-purple-500 bg-purple-100', label: 'Purple' },
  { value: 'text-indigo-500 bg-indigo-100', label: 'Indigo' },
  { value: 'text-teal-500 bg-teal-100', label: 'Teal' },
  { value: 'text-rose-500 bg-rose-100', label: 'Rose' },
];

export default function HabitModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: any) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [color, setColor] = useState(COLORS[0].value);

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
      setFrequency(initialData?.frequency || 'daily');
      setColor(initialData?.color || COLORS[0].value);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, description, frequency, color });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xl rounded-[24px] border border-border shadow-float p-8 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full"
        >
          <X size={20} />
        </button>

        <div className="mb-8 flex items-center gap-4 text-[#111111]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Activity size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">New Habit</h2>
            <p className="text-sm font-medium text-gray-500">Create a habit to build consistency.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Habit Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#111111] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              placeholder="e.g., Drink 2L water"
              required
              autoFocus
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#111111] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Color Tag</label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#111111] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              >
                {COLORS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#111111] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium min-h-[100px] resize-none"
              placeholder="Optional notes..."
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
              Save Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
