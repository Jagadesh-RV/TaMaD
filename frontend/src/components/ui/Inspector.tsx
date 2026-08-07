import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  Trash2,
  Tag,
  User,
  Mail,
  Calendar,
  Clock,
  Flag,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { useTeamStore } from '../../store/teamStore';
import { useInteractionStore } from '../../store/interactionStore';
import { Input } from './Input';

const STATUSES = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'In Review' },
  { id: 'done', label: 'Done' },
];

const PRIORITIES = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
  { id: 'urgent', label: 'Urgent' },
];

const selectClass =
  'w-full h-10 rounded-xl border border-border bg-surface px-3 text-sm font-medium outline-none transition-all focus:border-[color:var(--color-accent)]';
const labelClass = 'mb-1.5 block text-xs font-bold uppercase tracking-wide text-[color:var(--color-foreground-secondary)]';

const dateFmt = (iso?: string) => (iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—');

function TaskInspector({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  const task = useTaskStore((s) => s.tasks.find((t) => t._id === taskId));
  const updateTask = useTaskStore((s) => s.updateTask);
  const toggleStatus = useTaskStore((s) => s.toggleStatus);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const recordVisit = useInteractionStore((s) => s.recordVisit);

  const [title, setTitle] = React.useState(task?.title || '');
  const [description, setDescription] = React.useState(task?.description || '');
  const [status, setStatus] = React.useState(task?.status || 'todo');
  const [priority, setPriority] = React.useState(task?.priority || 'medium');
  const [dueDate, setDueDate] = React.useState(task?.dueDate || '');
  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    if (!task) return;
    recordVisit({ id: `task-${task._id}`, type: 'task', label: task.title, href: '/tasks', icon: 'task' });
  }, [task, recordVisit]);

  if (!task) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <Sparkles size={20} className="text-[color:var(--color-muted)]" />
        <p className="text-sm font-medium text-[color:var(--color-muted)]">Task not found</p>
        <button onClick={onClose} className="text-xs font-bold text-[color:var(--color-accent)]">Close inspector</button>
      </div>
    );
  }

  const markDirty = (fn: () => void) => () => { fn(); setDirty(true); };

  const handleSave = async () => {
    await updateTask(task._id, { title: title.trim() || task.title, description, status, priority, dueDate: dueDate || undefined });
    setDirty(false);
  };

  const handleDelete = async () => {
    await deleteTask(task._id);
    onClose();
  };

  const isDone = status === 'done';

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: isDone ? 'var(--color-success-light)' : 'var(--color-accent-ghost)', color: isDone ? 'var(--color-success)' : 'var(--color-accent)' }}>
          {isDone ? <CheckCircle2 size={16} /> : <Sparkles size={16} />}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold text-[color:var(--color-foreground)]">{task.title}</h2>
          <p className="text-xs font-medium text-[color:var(--color-muted)]">Task inspector</p>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-[color:var(--color-muted)] transition-colors hover:bg-[color:var(--color-surface-active)]" aria-label="Close inspector">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5" style={{ scrollbarWidth: 'thin' }}>
        <div>
          <label className={labelClass}>Title</label>
          <Input value={title} onChange={(e) => markDirty(() => setTitle(e.target.value))()} />
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <div className="grid grid-cols-4 gap-1.5">
            {STATUSES.map((s) => {
              const active = s.id === status;
              return (
                <button
                  key={s.id}
                  onClick={() => markDirty(() => setStatus(s.id))()}
                  className="rounded-lg px-2 py-2 text-[11px] font-bold transition-colors"
                  style={{
                    background: active ? (s.id === 'done' ? 'var(--color-success-light)' : 'var(--color-accent-ghost)') : 'var(--color-surface-active)',
                    color: active ? (s.id === 'done' ? 'var(--color-success)' : 'var(--color-accent)') : 'var(--color-foreground-secondary)',
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Priority</label>
            <select value={priority} onChange={(e) => markDirty(() => setPriority(e.target.value))()} className={selectClass}>
              {PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Due date</label>
            <Input type="date" value={dueDate} onChange={(e) => markDirty(() => setDueDate(e.target.value))()} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            value={description}
            onChange={(e) => markDirty(() => setDescription(e.target.value))()}
            className="min-h-[110px] w-full resize-none rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm font-medium outline-none transition-all focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)]/15"
            placeholder="Add context…"
          />
        </div>

        {(task.tags?.length || task.assignees?.length) && (
          <div className="space-y-3">
            {task.tags?.length ? (
              <div>
                <label className={labelClass}><Tag size={11} className="mr-1 inline" />Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map((tag) => (
                    <span key={tag.name} className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: `${tag.color}22`, color: tag.color }}>
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            {task.assignees?.length ? (
              <div>
                <label className={labelClass}><User size={11} className="mr-1 inline" />Assignees</label>
                <div className="flex flex-wrap gap-2">
                  {task.assignees.map((a) => (
                    <span key={a.email} className="flex items-center gap-1.5 rounded-full bg-[color:var(--color-surface-active)] py-1 pl-1 pr-2.5 text-xs font-semibold text-[color:var(--color-foreground-secondary)]">
                      <span className="avatar avatar-sm">{a.avatarUrl ? <img src={a.avatarUrl} alt={a.name} /> : a.name.charAt(0).toUpperCase()}</span>
                      {a.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

        <div className="rounded-xl border border-border bg-background-secondary/50 p-3.5">
          <div className="flex items-center gap-4 text-xs font-semibold text-[color:var(--color-muted)]">
            <span className="flex items-center gap-1"><Clock size={12} />Created {dateFmt(task.createdAt)}</span>
            <span className="flex items-center gap-1"><RotateCcw size={12} />Updated {dateFmt(task.updatedAt)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border px-5 py-4">
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[color:var(--color-danger)] transition-colors hover:bg-[color:var(--color-danger)]/10"
        >
          <Trash2 size={14} /> Delete
        </button>
        {!isDone ? (
          <button
            onClick={() => toggleStatus(task._id, status)}
            className="flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[color:var(--color-success)] transition-colors hover:bg-[color:var(--color-success)]/10"
          >
            <CheckCircle2 size={14} /> Complete
          </button>
        ) : null}
        <div className="flex-1" />
        {dirty ? (
          <button onClick={handleSave} className="btn-primary rounded-xl px-5 py-2.5 text-sm font-bold">
            Save changes
          </button>
        ) : (
          <span className="flex items-center gap-1 text-xs font-semibold text-[color:var(--color-muted)]">
            <Calendar size={12} /> {dateFmt(dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}

function MemberInspector({ memberId, onClose }: { memberId: string; onClose: () => void }) {
  const member = useTeamStore((s) => s.members.find((m) => m._id === memberId));

  if (!member) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <User size={20} className="text-[color:var(--color-muted)]" />
        <p className="text-sm font-medium text-[color:var(--color-muted)]">Member not found</p>
        <button onClick={onClose} className="text-xs font-bold text-[color:var(--color-accent)]">Close inspector</button>
      </div>
    );
  }

  const initials = member.userId.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const active = member.status === 'active';

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold text-[color:var(--color-foreground)]">Member</h2>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-[color:var(--color-muted)] transition-colors hover:bg-[color:var(--color-surface-active)]" aria-label="Close inspector">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5" style={{ scrollbarWidth: 'thin' }}>
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span
            className="flex h-20 w-20 items-center justify-center rounded-full border-2 text-2xl font-bold"
            style={{
              borderColor: 'var(--color-surface)',
              color: 'var(--color-accent)',
              background: 'linear-gradient(135deg, var(--color-accent-ghost), var(--color-info-light))',
              boxShadow: active ? '0 0 0 3px var(--color-success-light)' : 'none',
            }}
          >
            {member.userId.avatarUrl ? <img src={member.userId.avatarUrl} alt={member.userId.name} className="h-full w-full rounded-full object-cover" /> : initials}
          </span>
          <div>
            <h3 className="text-base font-bold text-[color:var(--color-foreground)]">{member.userId.name}</h3>
            <p className="text-sm font-medium text-[color:var(--color-muted)]">{member.roleId.name}</p>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
            style={{ background: active ? 'var(--color-success-light)' : 'var(--color-surface-active)', color: active ? 'var(--color-success)' : 'var(--color-muted)' }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: active ? 'var(--color-success)' : 'var(--color-muted)', animation: active ? 'pulse-soft 2s infinite' : 'none' }} />
            {active ? 'Active' : 'Suspended'}
          </span>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-background-secondary/50 px-3.5 py-3 text-sm">
            <Mail size={15} className="text-[color:var(--color-muted)]" />
            <span className="font-medium text-[color:var(--color-foreground)]">{member.userId.email}</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-background-secondary/50 px-3.5 py-3 text-sm">
            <Calendar size={15} className="text-[color:var(--color-muted)]" />
            <span className="font-medium text-[color:var(--color-foreground)]">Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-background-secondary/50 px-3.5 py-3 text-sm">
            <Flag size={15} className="text-[color:var(--color-muted)]" />
            <span className="font-medium text-[color:var(--color-foreground)]">Role · {member.roleId.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Inspector() {
  const inspector = useInteractionStore((s) => s.inspector);
  const close = useInteractionStore((s) => s.closeInspector);

  React.useEffect(() => {
    if (!inspector) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inspector, close]);

  return (
    <AnimatePresence>
      {inspector && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[58] bg-black/30"
            onClick={close}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            className="fixed right-0 top-0 z-[60] h-full w-[400px] max-w-[92vw] overflow-hidden border-l border-border bg-surface shadow-[var(--shadow-float)]"
          >
            {inspector.type === 'task' && <TaskInspector key={inspector.id} taskId={inspector.id} onClose={close} />}
            {inspector.type === 'member' && <MemberInspector key={inspector.id} memberId={inspector.id} onClose={close} />}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default Inspector;
