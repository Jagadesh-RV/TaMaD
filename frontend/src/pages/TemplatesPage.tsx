import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, FileText, Copy, Pencil, X, Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTemplateStore, type TaskTemplate } from '../store/templateStore';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'var(--color-muted)' },
  { value: 'medium', label: 'Medium', color: 'var(--color-accent)' },
  { value: 'high', label: 'High', color: 'var(--color-warning)' },
  { value: 'urgent', label: 'Urgent', color: 'var(--color-danger)' },
];

export default function TemplatesPage() {
  const { templates, addTemplate, removeTemplate, updateTemplate } = useTemplateStore();
  const createTask = useTaskStore(s => s.createTask);
  const workspace = useAuthStore(s => s.workspace);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', title: '', description: '', priority: 'medium' });

  const resetForm = () => setForm({ name: '', title: '', description: '', priority: 'medium' });

  const handleCreate = () => {
    if (!form.name.trim() || !form.title.trim()) {
      toast.error('Template name and task title are required');
      return;
    }
    addTemplate({
      name: form.name.trim(),
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      priority: form.priority,
    });
    toast.success('Template created');
    resetForm();
    setShowCreate(false);
  };

  const handleApply = async (template: TaskTemplate) => {
    if (!workspace?._id) return;
    try {
      await createTask({
        title: template.title,
        description: template.description,
        priority: template.priority,
        workspaceId: workspace._id,
        status: 'todo',
      } as any);
      toast.success(`Task created from "${template.name}"`);
    } catch {
      toast.error('Failed to create task from template');
    }
  };

  const handleDuplicate = (template: TaskTemplate) => {
    addTemplate({
      name: `${template.name} (copy)`,
      title: template.title,
      description: template.description,
      priority: template.priority,
    });
    toast.success('Template duplicated');
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Task Templates</h1>
          <p className="page-subtitle">Save reusable task blueprints to speed up your workflow.</p>
        </div>
        <button onClick={() => { resetForm(); setShowCreate(true); }} className="btn btn-primary btn-sm">
          <Plus size={14} />
          New Template
        </button>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="card-header flex items-center justify-between">
                <h3 className="text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>
                  {editingId ? 'Edit Template' : 'New Template'}
                </h3>
                <button onClick={() => { setShowCreate(false); setEditingId(null); }} className="btn btn-ghost btn-sm p-1">
                  <X size={16} />
                </button>
              </div>
              <div className="card-body flex flex-col gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>Template Name</label>
                  <input
                    className="input"
                    placeholder="e.g. Bug Report"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>Task Title</label>
                  <input
                    className="input"
                    placeholder="e.g. Fix login redirect bug"
                    value={form.title}
                    onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>Description (optional)</label>
                  <textarea
                    className="input min-h-[80px] resize-y"
                    placeholder="Steps, context, etc."
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>Priority</label>
                  <div className="flex gap-2">
                    {PRIORITY_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setForm(f => ({ ...f, priority: opt.value }))}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                        style={{
                          background: form.priority === opt.value ? opt.color : 'var(--color-surface-hover)',
                          color: form.priority === opt.value ? 'white' : 'var(--color-muted)',
                          border: `1px solid ${form.priority === opt.value ? opt.color : 'var(--color-border-light)'}`,
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => { setShowCreate(false); setEditingId(null); }} className="btn btn-ghost btn-sm">Cancel</button>
                  <button onClick={handleCreate} className="btn btn-primary btn-sm">
                    <Check size={14} />
                    {editingId ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template List */}
      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: 'var(--color-surface-hover)', color: 'var(--color-muted)' }}
          >
            <FileText size={28} />
          </div>
          <h3 className="mb-1 text-base font-bold" style={{ color: 'var(--color-foreground)' }}>No templates yet</h3>
          <p className="mb-4 text-sm" style={{ color: 'var(--color-muted)' }}>
            Create your first template to reuse common task structures.
          </p>
          <button onClick={() => { resetForm(); setShowCreate(true); }} className="btn btn-primary btn-sm">
            <Plus size={14} />
            Create Template
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card group"
            >
              <div className="card-body">
                <div className="mb-3 flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold truncate" style={{ color: 'var(--color-foreground)' }}>
                      {template.name}
                    </h3>
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--color-muted)' }}>
                      {template.title}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                    style={{
                      background: PRIORITY_OPTIONS.find(p => p.value === template.priority)?.color || 'var(--color-muted)',
                      color: 'white',
                    }}
                  >
                    {template.priority}
                  </span>
                </div>
                {template.description && (
                  <p className="mb-3 line-clamp-2 text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                    {template.description}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApply(template)}
                    className="btn btn-primary btn-xs flex-1"
                  >
                    <Copy size={12} />
                    Use
                  </button>
                  <button
                    onClick={() => handleDuplicate(template)}
                    className="btn btn-ghost btn-xs"
                    title="Duplicate"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={() => {
                      removeTemplate(template.id);
                      toast.success('Template deleted');
                    }}
                    className="btn btn-ghost btn-xs"
                    style={{ color: 'var(--color-danger)' }}
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
