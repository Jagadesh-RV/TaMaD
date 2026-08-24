import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Paperclip, Eye, ThumbsUp, Activity, MessageSquare, 
  MoreHorizontal, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { SelectDropdown } from '../ui/SelectDropdown';
import { useTaskStore } from '../../store/taskStore';
import { useAuthStore } from '../../store/authStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import TaskComments from './TaskComments';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { format, parseISO } from 'date-fns';

const PRIORITY_CONFIG: Record<string, { label: string, color: string, bg: string, dot: string }> = {
  urgent: { label: 'Urgent', color: 'var(--color-danger)', bg: 'var(--color-danger-ghost)', dot: 'priority-dot-urgent' },
  high: { label: 'High', color: 'var(--color-warning)', bg: 'var(--color-warning-ghost)', dot: 'priority-dot-high' },
  medium: { label: 'Medium', color: 'var(--color-accent)', bg: 'var(--color-accent-ghost)', dot: 'priority-dot-medium' },
  low: { label: 'Low', color: 'var(--color-foreground-tertiary)', bg: 'var(--color-surface-active)', dot: 'priority-dot-low' },
};

const STATUS_CONFIG: Record<string, { label: string, color: string, bg: string }> = {
  'todo': { label: 'To Do', color: 'var(--color-foreground-tertiary)', bg: 'var(--color-surface-active)' },
  'in-progress': { label: 'In Progress', color: 'var(--color-info)', bg: 'var(--color-info-ghost)' },
  'review': { label: 'In Review', color: 'var(--color-warning)', bg: 'var(--color-warning-ghost)' },
  'done': { label: 'Done', color: 'var(--color-success)', bg: 'var(--color-success-ghost)' },
};

export default function IssueDetailModal({
  isOpen,
  onClose,
  initialData,
}: any) {
  const { updateTask, toggleWatch, toggleVote } = useTaskStore();
  const user = useAuthStore(s => s.user);
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace);

  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...(currentWorkspace?.members?.map(m => ({
      value: m.userId._id,
      label: m.userId.name
    })) || [])
  ];

  const [formData, setFormData] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData(initialData);
    }
  }, [isOpen, initialData]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!initialData) return null;

  const handleChange = async (field: string, value: any) => {
    setFormData((s: any) => ({ ...s, [field]: value }));
    try {
      await updateTask(initialData._id, { [field]: value });
    } catch (e) {
      setFormData((s: any) => ({ ...s, [field]: initialData[field] }));
    }
  };

  const isWatching = formData.watchers?.some((w: any) => w._id === user?.id) || false;
  const isVoting = formData.votes?.includes(user?.id) || false;

  const handleToggleWatch = async () => {
    await toggleWatch(initialData._id);
    const newWatchers = isWatching 
      ? formData.watchers.filter((w: any) => w._id !== user?.id)
      : [...(formData.watchers || []), user];
    setFormData((s: any) => ({ ...s, watchers: newWatchers }));
  };

  const handleToggleVote = async () => {
    await toggleVote(initialData._id);
    const newVotes = isVoting
      ? formData.votes.filter((id: any) => id !== user?.id)
      : [...(formData.votes || []), user?.id];
    setFormData((s: any) => ({ ...s, votes: newVotes }));
  };

  const pConf = PRIORITY_CONFIG[formData.priority] || PRIORITY_CONFIG.low;
  const sConf = STATUS_CONFIG[formData.status] || STATUS_CONFIG.todo;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Slide-over panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%', transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-4xl flex-col bg-surface shadow-2xl xl:rounded-l-2xl border-l border-border"
          >
            {/* Header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-5">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[color:var(--color-foreground-tertiary)]">
                  {currentWorkspace?.name} <ChevronRight size={12} />
                  {initialData._id.slice(-6)}
                </span>
                
                <SelectDropdown
                  value={formData.taskType || 'task'}
                  onChange={(val) => handleChange('taskType', val)}
                  options={[
                    { value: 'epic', label: 'Epic' },
                    { value: 'story', label: 'Story' },
                    { value: 'task', label: 'Task' },
                    { value: 'bug', label: 'Bug' },
                    { value: 'subtask', label: 'Subtask' }
                  ]}
                  buttonClassName="border-none shadow-none font-bold uppercase tracking-wider text-[10px] h-6 px-2 min-w-0 bg-[color:var(--color-surface-active)]"
                />
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleToggleWatch}
                  className={clsx(
                    "flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium transition-colors",
                    isWatching 
                      ? "bg-[color:var(--color-accent-ghost)] text-[color:var(--color-accent)]" 
                      : "hover:bg-[color:var(--color-surface-hover)] text-[color:var(--color-foreground-secondary)]"
                  )}
                >
                  <Eye size={14} />
                  <span className="hidden sm:inline">{isWatching ? 'Watching' : 'Watch'}</span> 
                  <span className="opacity-70">({formData.watchers?.length || 0})</span>
                </button>
                <button
                  onClick={handleToggleVote}
                  className={clsx(
                    "flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium transition-colors",
                    isVoting 
                      ? "bg-[color:var(--color-accent-ghost)] text-[color:var(--color-accent)]" 
                      : "hover:bg-[color:var(--color-surface-hover)] text-[color:var(--color-foreground-secondary)]"
                  )}
                >
                  <ThumbsUp size={14} />
                  <span className="hidden sm:inline">{isVoting ? 'Voted' : 'Vote'}</span>
                  <span className="opacity-70">({formData.votes?.length || 0})</span>
                </button>
                <div className="mx-1 h-4 w-px bg-border" />
                <button
                  className="btn-icon-sm btn btn-ghost"
                  aria-label="More actions"
                >
                  <MoreHorizontal size={16} />
                </button>
                <button
                  onClick={onClose}
                  className="btn-icon-sm btn btn-ghost ml-1"
                  aria-label="Close panel"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-8 custom-scrollbar">
                
                {/* Title */}
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData((s: any) => ({ ...s, title: e.target.value }))}
                  onBlur={() => handleChange('title', formData.title)}
                  className="w-full text-2xl lg:text-3xl font-bold bg-transparent outline-none mb-6 text-[color:var(--color-foreground)] placeholder:text-[color:var(--color-foreground-tertiary)] focus:bg-[color:var(--color-surface-hover)] rounded-xl transition-colors -ml-3 px-3 py-1"
                  placeholder="Issue title"
                />
                
                {/* Description */}
                <div className="mb-8 group">
                  <label className="text-[13px] font-semibold mb-2 block text-[color:var(--color-foreground)]">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData((s: any) => ({ ...s, description: e.target.value }))}
                    onBlur={() => handleChange('description', formData.description)}
                    className="w-full min-h-[160px] p-4 rounded-xl bg-[color:var(--color-surface-active)] border border-transparent hover:border-border focus:border-[color:var(--color-accent)] focus:bg-surface outline-none text-[14px] leading-relaxed resize-y transition-all"
                    placeholder="Add a detailed description... Use Markdown to format."
                  />
                </div>

                {/* Attachments */}
                <div className="mb-10">
                  <label className="text-[13px] font-semibold mb-2 block text-[color:var(--color-foreground)]">Attachments</label>
                  <button className="w-full border border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors border-border hover:bg-[color:var(--color-surface-hover)] hover:border-border-hover group">
                    <div className="h-10 w-10 rounded-full bg-[color:var(--color-surface-active)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Paperclip size={18} className="text-[color:var(--color-foreground-tertiary)]" />
                    </div>
                    <p className="text-[13px] font-medium text-[color:var(--color-foreground-secondary)]">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-[11px] text-[color:var(--color-foreground-tertiary)] mt-1">
                      PNG, JPG, PDF up to 10MB
                    </p>
                  </button>
                </div>

                {/* Tabs for Comments/History */}
                <div>
                  <div className="flex items-center gap-6 border-b border-border mb-5">
                    <button 
                      onClick={() => setActiveTab('comments')}
                      className={clsx(
                        "pb-3 text-[13px] font-semibold border-b-2 transition-colors relative top-[1px]",
                        activeTab === 'comments' 
                          ? "border-[color:var(--color-accent)] text-[color:var(--color-foreground)]" 
                          : "border-transparent text-[color:var(--color-foreground-tertiary)] hover:text-[color:var(--color-foreground)]"
                      )}
                    >
                      <span className="flex items-center gap-2"><MessageSquare size={14} /> Comments</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('history')}
                      className={clsx(
                        "pb-3 text-[13px] font-semibold border-b-2 transition-colors relative top-[1px]",
                        activeTab === 'history' 
                          ? "border-[color:var(--color-accent)] text-[color:var(--color-foreground)]" 
                          : "border-transparent text-[color:var(--color-foreground-tertiary)] hover:text-[color:var(--color-foreground)]"
                      )}
                    >
                      <span className="flex items-center gap-2"><Activity size={14} /> History</span>
                    </button>
                  </div>
                  
                  {activeTab === 'comments' && (
                    <div className="pb-10">
                      <TaskComments taskId={initialData._id} />
                    </div>
                  )}
                  {activeTab === 'history' && (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="h-12 w-12 rounded-full bg-[color:var(--color-surface-active)] flex items-center justify-center mb-3">
                        <Activity size={20} className="text-[color:var(--color-foreground-tertiary)]" />
                      </div>
                      <p className="text-[13px] font-medium text-[color:var(--color-foreground)]">No history yet</p>
                      <p className="text-[12px] text-[color:var(--color-foreground-tertiary)] mt-1">
                        Changes to this issue will appear here.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Properties */}
              <div className="w-full md:w-[320px] bg-[color:var(--color-surface)] md:bg-transparent border-t md:border-t-0 md:border-l border-border flex flex-col h-full overflow-hidden shrink-0">
                <div className="p-6 md:p-5 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                  
                  {/* Status & Priority Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-[color:var(--color-foreground-tertiary)] block mb-1.5 uppercase tracking-wider">Status</label>
                      <SelectDropdown
                        value={formData.status || 'todo'}
                        onChange={(val) => handleChange('status', val)}
                        options={[
                          { value: 'todo', label: 'To Do' },
                          { value: 'in-progress', label: 'In Progress' },
                          { value: 'review', label: 'In Review' },
                          { value: 'done', label: 'Done' }
                        ]}
                        buttonClassName="w-full bg-[color:var(--color-surface-active)] border-transparent hover:border-border font-semibold text-[13px] h-9"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[color:var(--color-foreground-tertiary)] block mb-1.5 uppercase tracking-wider">Priority</label>
                      <SelectDropdown
                        value={formData.priority || 'medium'}
                        onChange={(val) => handleChange('priority', val)}
                        options={[
                          { value: 'low', label: 'Low' },
                          { value: 'medium', label: 'Medium' },
                          { value: 'high', label: 'High' },
                          { value: 'urgent', label: 'Urgent' }
                        ]}
                        buttonClassName="w-full bg-[color:var(--color-surface-active)] border-transparent hover:border-border font-semibold text-[13px] h-9"
                      />
                    </div>
                  </div>

                  {/* Assignee */}
                  <div>
                    <label className="text-[11px] font-bold text-[color:var(--color-foreground-tertiary)] block mb-1.5 uppercase tracking-wider">Assignee</label>
                    <SelectDropdown
                      value={formData.assignees?.[0]?._id || formData.assignees?.[0] || ''}
                      onChange={(val) => handleChange('assignees', val ? [val] : [])}
                      options={assigneeOptions}
                      buttonClassName="w-full bg-[color:var(--color-surface-active)] border-transparent hover:border-border font-semibold text-[13px] h-9"
                    />
                  </div>

                  {/* Dates */}
                  <div>
                    <label className="text-[11px] font-bold text-[color:var(--color-foreground-tertiary)] block mb-1.5 uppercase tracking-wider">Due Date</label>
                    <div className="relative">
                      <Calendar size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-foreground-tertiary)]" />
                      <input
                        type="date"
                        value={formData.dueDate ? formData.dueDate.split('T')[0] : ''}
                        onChange={(e) => handleChange('dueDate', e.target.value ? new Date(e.target.value).toISOString() : '')}
                        className="w-full pl-9 h-9 text-[13px] font-medium rounded-lg bg-[color:var(--color-surface-active)] border border-transparent hover:border-border focus:border-[color:var(--color-accent)] focus:bg-surface outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Estimates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-[color:var(--color-foreground-tertiary)] block mb-1.5 uppercase tracking-wider">Story Points</label>
                      <input
                        type="number"
                        value={formData.storyPoints || ''}
                        onChange={(e) => setFormData((s: any) => ({ ...s, storyPoints: parseInt(e.target.value) || undefined }))}
                        onBlur={() => handleChange('storyPoints', formData.storyPoints)}
                        className="w-full h-9 px-3 text-[13px] font-medium rounded-lg bg-[color:var(--color-surface-active)] border border-transparent hover:border-border focus:border-[color:var(--color-accent)] focus:bg-surface outline-none transition-colors"
                        placeholder="e.g. 5"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[color:var(--color-foreground-tertiary)] block mb-1.5 uppercase tracking-wider">Estimate (hrs)</label>
                      <input
                        type="number"
                        value={formData.estimatedTime || ''}
                        onChange={(e) => setFormData((s: any) => ({ ...s, estimatedTime: parseFloat(e.target.value) || undefined }))}
                        onBlur={() => handleChange('estimatedTime', formData.estimatedTime)}
                        className="w-full h-9 px-3 text-[13px] font-medium rounded-lg bg-[color:var(--color-surface-active)] border border-transparent hover:border-border focus:border-[color:var(--color-accent)] focus:bg-surface outline-none transition-colors"
                        placeholder="e.g. 4"
                      />
                    </div>
                  </div>

                  <hr className="border-border" />

                  {/* Links & Subtasks */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[11px] font-bold text-[color:var(--color-foreground)] uppercase tracking-wider">Subtasks</h4>
                      <button className="text-[11px] font-bold text-[color:var(--color-accent)] hover:text-[color:var(--color-accent-hover)]">+ Add</button>
                    </div>
                    {formData.subtasks?.length > 0 ? (
                      <div className="space-y-1.5">
                        {formData.subtasks.map((sub: any) => (
                          <div key={sub._id || sub} className="flex items-start gap-2 p-2 rounded-lg bg-[color:var(--color-surface-active)] border border-transparent hover:border-border transition-colors group cursor-pointer">
                            <CheckCircle2 size={14} className="mt-0.5 text-[color:var(--color-foreground-tertiary)] group-hover:text-[color:var(--color-success)]" />
                            <span className="text-[13px] font-medium leading-snug">{sub.title || 'Subtask'}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[12px] text-[color:var(--color-foreground-tertiary)]">No subtasks created.</p>
                    )}
                  </div>

                  <hr className="border-border" />

                  {/* Custom Fields */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[11px] font-bold text-[color:var(--color-foreground)] uppercase tracking-wider">Custom Fields</h4>
                      <button
                        onClick={() => {
                          const newField = prompt('Enter custom field name:');
                          if (newField) {
                            const updated = { ...formData.customFields, [newField]: '' };
                            setFormData((s: any) => ({ ...s, customFields: updated }));
                            handleChange('customFields', updated);
                          }
                        }}
                        className="text-[11px] font-bold text-[color:var(--color-accent)] hover:text-[color:var(--color-accent-hover)]"
                      >
                        + Add
                      </button>
                    </div>
                    
                    {formData.customFields && Object.keys(formData.customFields).length > 0 ? (
                      <div className="space-y-3">
                        {Object.keys(formData.customFields).map(key => (
                          <div key={key}>
                            <label className="text-[11px] font-bold text-[color:var(--color-foreground-tertiary)] block mb-1 uppercase tracking-wider">{key}</label>
                            <input
                              type="text"
                              value={formData.customFields[key] || ''}
                              onChange={(e) => setFormData((s: any) => ({ 
                                ...s, 
                                customFields: { ...s.customFields, [key]: e.target.value } 
                              }))}
                              onBlur={() => handleChange('customFields', formData.customFields)}
                              className="w-full h-9 px-3 text-[13px] font-medium rounded-lg bg-[color:var(--color-surface-active)] border border-transparent hover:border-border focus:border-[color:var(--color-accent)] focus:bg-surface outline-none transition-colors"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[12px] text-[color:var(--color-foreground-tertiary)]">No custom fields.</p>
                    )}
                  </div>

                  <div className="pt-4 text-center">
                    <p className="text-[10px] text-[color:var(--color-foreground-tertiary)] font-medium">
                      Created {format(parseISO(initialData.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
