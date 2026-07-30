import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Calendar, Clock, Tag, Bell, Repeat } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import api from '../utils/api';
import toast from 'react-hot-toast';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const STATUSES = ['todo', 'in_progress', 'done', 'cancelled'];
const RECURRENCES = ['', 'daily', 'weekly', 'monthly'];

export default function TaskModal({ task = null, onClose, initialDate = null }) {
  const isEdit = !!task;
  const { createTask, updateTask } = useTaskStore();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    due_date: task?.due_date?.split('T')[0] || initialDate || '',
    scheduled_at: task?.scheduled_at?.split('T')[0] || '',
    estimated_minutes: task?.estimated_minutes || 30,
    tags: task?.tags?.map(t => t.id) || [],
    is_pinned: task?.is_pinned || 0,
    recurrence: task?.recurrence || '',
    milestone: task?.milestone || '',
  });

  useEffect(() => {
    api.get('/tags').then(r => setTags(r.data.tags));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleTag = (id) => {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(id) ? f.tags.filter(t => t !== id) : [...f.tags, id]
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title required');
    setLoading(true);
    try {
      if (isEdit) {
        await updateTask(task.id, form);
      } else {
        await createTask(form);
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg card p-6 shadow-2xl shadow-black/50 animate-fade-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-lg text-white">{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <input className="input text-base font-medium" placeholder="Task title..." value={form.title}
              onChange={e => set('title', e.target.value)} autoFocus required />
          </div>

          <div>
            <textarea className="input resize-none text-sm" rows={3} placeholder="Description (optional)..."
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Priority</label>
              <select className="input text-sm" value={form.priority} onChange={e => set('priority', e.target.value)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Status</label>
              <select className="input text-sm" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 flex items-center gap-1 block"><Calendar size={11} />Due Date</label>
              <input type="date" className="input text-sm" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 flex items-center gap-1 block"><Clock size={11} />Est. (min)</label>
              <input type="number" className="input text-sm" value={form.estimated_minutes} min={5} max={480}
                onChange={e => set('estimated_minutes', parseInt(e.target.value))} />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 flex items-center gap-1 block"><Repeat size={11} />Recurrence</label>
            <select className="input text-sm" value={form.recurrence} onChange={e => set('recurrence', e.target.value)}>
              {RECURRENCES.map(r => <option key={r} value={r}>{r || 'None'}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-2 flex items-center gap-1 block"><Tag size={11} />Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                  className={`badge transition-all ${form.tags.includes(tag.id) ? 'ring-2 ring-white/20' : 'opacity-50'}`}
                  style={{ background: tag.color + '30', color: tag.color }}>
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="pinned" checked={form.is_pinned === 1}
              onChange={e => set('is_pinned', e.target.checked ? 1 : 0)} className="accent-brand-500" />
            <label htmlFor="pinned" className="text-sm text-slate-400 cursor-pointer">Pin this task</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}