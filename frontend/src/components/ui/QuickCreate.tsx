import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  FolderKanban,
  StickyNote,
  FileText,
  Video,
  Plus,
  Calendar,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { useProjectStore } from '../../store/projectStore';
import { useNoteStore } from '../../store/noteStore';
import { useDocumentStore } from '../../store/documentStore';
import { useMeetingStore } from '../../store/meetingStore';
import { useAuthStore } from '../../store/authStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useInteractionStore } from '../../store/interactionStore';
import { Input } from './Input';

type Intent = 'task' | 'project' | 'note' | 'document' | 'meeting';

interface IntentMeta {
  id: Intent;
  label: string;
  icon: LucideIcon;
  placeholder: string;
  accent: string;
}

const INTENTS: IntentMeta[] = [
  { id: 'task', label: 'Task', icon: CheckSquare, placeholder: 'What needs to be done?', accent: 'var(--color-accent)' },
  { id: 'project', label: 'Project', icon: FolderKanban, placeholder: 'What are you building?', accent: 'var(--color-accent)' },
  { id: 'note', label: 'Note', icon: StickyNote, placeholder: 'What’s on your mind?', accent: 'var(--color-accent)' },
  { id: 'document', label: 'Document', icon: FileText, placeholder: 'Document title…', accent: 'var(--color-accent)' },
  { id: 'meeting', label: 'Meeting', icon: Video, placeholder: 'Meeting title…', accent: 'var(--color-accent)' },
];

const fieldClass =
  'w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm font-medium outline-none transition-all placeholder:font-normal placeholder:text-[color:var(--color-foreground-tertiary)] focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent)]/15';
const labelClass = 'mb-1.5 block text-xs font-bold uppercase tracking-wide text-[color:var(--color-foreground-secondary)]';
const selectClass =
  'w-full h-10 rounded-xl border border-border bg-surface px-3 text-sm font-medium outline-none transition-all focus:border-[color:var(--color-accent)]';

export function QuickCreate() {
  const open = useInteractionStore((s) => s.quickCreateOpen);
  const intentFromStore = useInteractionStore((s) => s.quickCreateIntent);
  const close = useInteractionStore((s) => s.closeQuickCreate);

  const { createTask } = useTaskStore();
  const { createProject } = useProjectStore();
  const { createNote } = useNoteStore();
  const { createDocument } = useDocumentStore();
  const { createMeeting } = useMeetingStore();

  const workspace = useAuthStore((s) => s.workspace);
  const workspaceId = workspace?._id || '';
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const teamId = currentWorkspace?.teamId;

  const available = React.useMemo(() => INTENTS.filter((i) => i.id !== 'meeting' || teamId), [teamId]);
  const [intent, setIntent] = React.useState<Intent>(
    available.some((i) => i.id === intentFromStore) ? (intentFromStore as Intent) : 'task',
  );

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [priority, setPriority] = React.useState('medium');
  const [status, setStatus] = React.useState('todo');
  const [dueDate, setDueDate] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [meetingDate, setMeetingDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [meetingTime, setMeetingTime] = React.useState('10:00');
  const [duration, setDuration] = React.useState(30);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  const reset = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('todo');
    setDueDate('');
    setStartDate('');
    setEndDate('');
    setMeetingDate(new Date().toISOString().slice(0, 10));
    setMeetingTime('10:00');
    setDuration(30);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    try {
      if (intent === 'task') {
        await createTask({ title: title.trim(), description, priority, status, dueDate: dueDate || undefined, workspaceId });
      } else if (intent === 'project') {
        await createProject({ name: title.trim(), description, startDate: startDate || undefined, endDate: endDate || undefined, workspaceId });
      } else if (intent === 'note') {
        await createNote({ title: title.trim() || 'Untitled note', content: description, workspaceId });
      } else if (intent === 'document') {
        await createDocument({ title: title.trim() || 'Untitled document', content: description, workspaceId });
      } else if (intent === 'meeting' && teamId) {
        const startTime = new Date(`${meetingDate}T${meetingTime}`).toISOString();
        await createMeeting({ title: title.trim(), description, startTime, duration, meetingType: 'Quick Sync', teamId, workspaceId });
      }
      reset();
      close();
    } catch {
      // store already surfaces errors via toast
    }
  };

  const active = available.find((i) => i.id === intent) || available[0];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[70] flex items-start justify-center bg-black/40 p-4 pt-[16vh] backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface/95 shadow-[var(--shadow-float)] backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'var(--color-accent-ghost)', color: active.accent }}
              >
                <Plus size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold text-[color:var(--color-foreground)]">Quick create</h2>
                <p className="text-xs font-medium text-[color:var(--color-muted)]">
                  {active.label} · press <span className="text-[color:var(--color-accent)]">↵</span> to save
                </p>
              </div>
              <kbd className="flex items-center gap-0.5 rounded border border-border bg-background-secondary px-1.5 py-0.5 text-[10px] font-medium text-[color:var(--color-foreground-tertiary)]">esc</kbd>
            </div>

            <div className="flex flex-wrap gap-1.5 px-4 pt-4">
              {available.map((meta) => {
                const Icon = meta.icon;
                const isActive = meta.id === active.id;
                return (
                  <button
                    key={meta.id}
                    type="button"
                    onClick={() => setIntent(meta.id)}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors"
                    style={{
                      background: isActive ? 'var(--color-accent-ghost)' : 'var(--color-surface-active)',
                      color: isActive ? 'var(--color-accent)' : 'var(--color-foreground-secondary)',
                    }}
                  >
                    <Icon size={13} />
                    {meta.label}
                  </button>
                );
              })}
            </div>

            <form key={intent} onSubmit={handleSubmit} className="space-y-3.5 px-5 pb-5 pt-4">
              {intent === 'task' && (
                <>
                  <div>
                    <label className={labelClass}>Title</label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={active.placeholder} required autoFocus />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Priority</label>
                      <select value={priority} onChange={(e) => setPriority(e.target.value)} className={selectClass}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Status</label>
                      <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="review">In Review</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Due date</label>
                    <div className="relative">
                      <Calendar size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-muted)]" />
                      <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="pl-9" />
                    </div>
                  </div>
                </>
              )}

              {intent === 'project' && (
                <>
                  <div>
                    <label className={labelClass}>Project name</label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={active.placeholder} required autoFocus />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Start date</label>
                      <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>End date</label>
                      <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                  </div>
                </>
              )}

              {(intent === 'note' || intent === 'document') && (
                <>
                  <div>
                    <label className={labelClass}>{intent === 'note' ? 'Note title' : 'Document title'}</label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={active.placeholder} required autoFocus />
                  </div>
                  <div>
                    <label className={labelClass}>Content</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`${fieldClass} min-h-[96px] resize-none`}
                      placeholder="Start writing…"
                    />
                  </div>
                </>
              )}

              {intent === 'meeting' && teamId && (
                <>
                  <div>
                    <label className={labelClass}>Title</label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={active.placeholder} required autoFocus />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Date</label>
                      <Input type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>Time</label>
                      <Input type="time" value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Duration</label>
                    <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={selectClass}>
                      <option value={15}>15 min</option>
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>60 min</option>
                      <option value={90}>90 min</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-[color:var(--color-muted)]">
                  <Sparkles size={13} style={{ color: 'var(--color-accent)' }} />
                  Tap out or press <kbd className="kbd-hint">↵</kbd>
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-xl px-4 py-2 text-sm font-bold text-[color:var(--color-foreground-secondary)] transition-colors hover:bg-[color:var(--color-surface-active)]"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary rounded-xl px-5 py-2 text-sm font-bold">
                    Create {active.label}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default QuickCreate;
