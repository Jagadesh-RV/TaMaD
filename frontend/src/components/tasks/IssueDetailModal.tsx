import React, { useState } from 'react';
import { X, Calendar, Check, Play, Paperclip, Eye, ThumbsUp, Tag, List, Activity, MessageSquare } from 'lucide-react';
import { Dialog, DialogPanel, DialogTitle } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { SelectDropdown } from '../ui/SelectDropdown';
import { useTaskStore } from '../../store/taskStore';
import { useAuthStore } from '../../store/authStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import TaskComments from './TaskComments';

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

  const prevIsOpen = React.useRef(isOpen);
  if (isOpen !== prevIsOpen.current) {
    prevIsOpen.current = isOpen;
    if (isOpen && initialData) {
      setFormData(initialData);
    }
  }

  if (!isOpen || !initialData) return null;

  const handleChange = async (field: string, value: any) => {
    setFormData(s => ({ ...s, [field]: value }));
    try {
      await updateTask(initialData._id, { [field]: value });
    } catch (e) {
      // Revert if error
      setFormData(s => ({ ...s, [field]: initialData[field] }));
    }
  };

  const isWatching = formData.watchers?.some(w => w._id === user?.id) || false;
  const isVoting = formData.votes?.includes(user?.id) || false;

  const handleToggleWatch = async () => {
    await toggleWatch(initialData._id);
    const newWatchers = isWatching 
      ? formData.watchers.filter(w => w._id !== user?.id)
      : [...(formData.watchers || []), user];
    setFormData(s => ({ ...s, watchers: newWatchers }));
  };

  const handleToggleVote = async () => {
    await toggleVote(initialData._id);
    const newVotes = isVoting
      ? formData.votes.filter(id => id !== user?.id)
      : [...(formData.votes || []), user?.id];
    setFormData(s => ({ ...s, votes: newVotes }));
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogPanel className="max-w-5xl w-full max-h-[90vh] flex flex-col p-0 overflow-hidden bg-[color:var(--color-surface)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
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
              buttonClassName="border-none shadow-none font-semibold uppercase tracking-wider text-xs h-8 px-2 min-w-[100px]"
            />
            <span className="text-[color:var(--color-muted)] text-sm">{initialData._id.slice(-6)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleWatch}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${isWatching ? 'bg-[color:var(--color-accent)]/10 text-[color:var(--color-accent)]' : 'hover:bg-[color:var(--color-surface-hover)] text-[color:var(--color-muted)]'}`}
            >
              <Eye size={14} />
              {isWatching ? 'Watching' : 'Watch'} ({formData.watchers?.length || 0})
            </button>
            <button
              onClick={handleToggleVote}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${isVoting ? 'bg-[color:var(--color-accent)]/10 text-[color:var(--color-accent)]' : 'hover:bg-[color:var(--color-surface-hover)] text-[color:var(--color-muted)]'}`}
            >
              <ThumbsUp size={14} />
              {isVoting ? 'Voted' : 'Vote'} ({formData.votes?.length || 0})
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-[color:var(--color-surface-hover)] text-[color:var(--color-muted)]"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content (Left) */}
          <div className="flex-1 overflow-y-auto p-6 border-r" style={{ borderColor: 'var(--color-border)' }}>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData(s => ({ ...s, title: e.target.value }))}
              onBlur={() => handleChange('title', formData.title)}
              className="w-full text-2xl font-bold bg-transparent outline-none mb-4"
              placeholder="Issue title"
            />
            
            <div className="mb-6">
              <label className="text-sm font-semibold mb-2 block">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(s => ({ ...s, description: e.target.value }))}
                onBlur={() => handleChange('description', formData.description)}
                className="w-full min-h-[150px] p-3 rounded-md bg-[color:var(--color-background)] border outline-none text-sm"
                style={{ borderColor: 'var(--color-border)' }}
                placeholder="Add a description..."
              />
            </div>

            <div className="mb-6">
              <label className="text-sm font-semibold mb-2 block">Attachments</label>
              <div className="border border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-[color:var(--color-surface-hover)]" style={{ borderColor: 'var(--color-border-light)' }}>
                <Paperclip size={24} className="text-[color:var(--color-muted)] mb-2" />
                <p className="text-sm text-[color:var(--color-muted)]">Click or drag files here to attach</p>
              </div>
            </div>

            {/* Activity Tabs */}
            <div className="mt-8">
              <div className="flex items-center gap-4 border-b mb-4" style={{ borderColor: 'var(--color-border)' }}>
                <button 
                  onClick={() => setActiveTab('comments')}
                  className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'comments' ? 'border-[color:var(--color-accent)] text-[color:var(--color-foreground)]' : 'border-transparent text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]'}`}
                >
                  <span className="flex items-center gap-2"><MessageSquare size={14} /> Comments</span>
                </button>
                <button 
                  onClick={() => setActiveTab('history')}
                  className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-[color:var(--color-accent)] text-[color:var(--color-foreground)]' : 'border-transparent text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]'}`}
                >
                  <span className="flex items-center gap-2"><Activity size={14} /> History</span>
                </button>
              </div>
              
              {activeTab === 'comments' && (
                <div className="bg-[color:var(--color-background)] rounded-md border" style={{ borderColor: 'var(--color-border)' }}>
                  <TaskComments taskId={initialData._id} />
                </div>
              )}
              {activeTab === 'history' && (
                <div className="text-center p-8 text-[color:var(--color-muted)] text-sm">
                  History timeline coming soon (AuditLogs).
                </div>
              )}
            </div>
          </div>

          {/* Sidebar (Right) */}
          <div className="w-[300px] bg-[color:var(--color-surface-hover)] p-6 overflow-y-auto space-y-6">
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[color:var(--color-muted)] block mb-1 uppercase tracking-wider">Status</label>
                <SelectDropdown
                  value={formData.status || 'todo'}
                  onChange={(val) => handleChange('status', val)}
                  options={[
                    { value: 'todo', label: 'To Do' },
                    { value: 'in-progress', label: 'In Progress' },
                    { value: 'review', label: 'In Review' },
                    { value: 'done', label: 'Done' }
                  ]}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[color:var(--color-muted)] block mb-1 uppercase tracking-wider">Priority</label>
                <SelectDropdown
                  value={formData.priority || 'medium'}
                  onChange={(val) => handleChange('priority', val)}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'urgent', label: 'Urgent' }
                  ]}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[color:var(--color-muted)] block mb-1 uppercase tracking-wider">Assignee</label>
                <SelectDropdown
                  value={formData.assignees?.[0]?._id || formData.assignees?.[0] || ''}
                  onChange={(val) => handleChange('assignees', val ? [val] : [])}
                  options={assigneeOptions}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[color:var(--color-muted)] block mb-1 uppercase tracking-wider">Due Date</label>
                <div className="relative">
                  <Calendar size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-muted)]" />
                  <Input 
                    type="date" 
                    value={formData.dueDate ? formData.dueDate.split('T')[0] : ''} 
                    onChange={(e) => handleChange('dueDate', e.target.value ? new Date(e.target.value).toISOString() : '')} 
                    className="pl-9 h-9 text-sm" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[color:var(--color-muted)] block mb-1 uppercase tracking-wider">Story Points</label>
                <input
                  type="number"
                  value={formData.storyPoints || ''}
                  onChange={(e) => setFormData(s => ({ ...s, storyPoints: parseInt(e.target.value) || undefined }))}
                  onBlur={() => handleChange('storyPoints', formData.storyPoints)}
                  className="w-full p-2 text-sm rounded bg-[color:var(--color-background)] border outline-none"
                  style={{ borderColor: 'var(--color-border)' }}
                  placeholder="e.g. 5"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[color:var(--color-muted)] block mb-1 uppercase tracking-wider">Estimated Time (hrs)</label>
                <input
                  type="number"
                  value={formData.estimatedTime || ''}
                  onChange={(e) => setFormData(s => ({ ...s, estimatedTime: parseFloat(e.target.value) || undefined }))}
                  onBlur={() => handleChange('estimatedTime', formData.estimatedTime)}
                  className="w-full p-2 text-sm rounded bg-[color:var(--color-background)] border outline-none"
                  style={{ borderColor: 'var(--color-border)' }}
                  placeholder="e.g. 4"
                />
              </div>

              {/* Dependencies & Subtasks */}
              <div className="pt-4 border-t mt-4" style={{ borderColor: 'var(--color-border)' }}>
                <h4 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-3">Links & Dependencies</h4>
                
                <div className="mb-3">
                  <label className="text-xs font-medium text-[color:var(--color-muted)] block mb-1">Parent Task</label>
                  <div className="text-sm p-2 rounded bg-[color:var(--color-background)] border" style={{ borderColor: 'var(--color-border)' }}>
                    {formData.parentTaskId ? formData.parentTaskId.title || 'Linked Parent Task' : 'None'}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="text-xs font-medium text-[color:var(--color-muted)] block mb-1">Subtasks</label>
                  <div className="space-y-1">
                    {formData.subtasks?.map((sub: any) => (
                      <div key={sub._id || sub} className="text-xs p-1.5 rounded bg-[color:var(--color-background)] border" style={{ borderColor: 'var(--color-border)' }}>
                        {sub.title || 'Subtask'}
                      </div>
                    ))}
                    <button className="text-[10px] font-medium text-[color:var(--color-accent)] hover:underline mt-1">+ Add Subtask</button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="text-xs font-medium text-[color:var(--color-muted)] block mb-1">Blocks</label>
                  <div className="space-y-1">
                    {formData.blocks?.map((b: any) => (
                      <div key={b._id || b} className="text-xs p-1.5 rounded bg-[color:var(--color-background)] border" style={{ borderColor: 'var(--color-border)' }}>
                        {b.title || 'Blocked Task'}
                      </div>
                    ))}
                    <button className="text-[10px] font-medium text-[color:var(--color-accent)] hover:underline mt-1">+ Add Blocked Task</button>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="text-xs font-medium text-[color:var(--color-muted)] block mb-1">Blocked By</label>
                  <div className="space-y-1">
                    {formData.blockedBy?.map((b: any) => (
                      <div key={b._id || b} className="text-xs p-1.5 rounded bg-[color:var(--color-background)] border" style={{ borderColor: 'var(--color-border)' }}>
                        {b.title || 'Blocking Task'}
                      </div>
                    ))}
                    <button className="text-[10px] font-medium text-[color:var(--color-accent)] hover:underline mt-1">+ Add Blocking Task</button>
                  </div>
                </div>

              </div>

              {/* Custom Fields */}
              <div className="pt-4 border-t mt-4" style={{ borderColor: 'var(--color-border)' }}>
                <h4 className="text-xs font-semibold text-[color:var(--color-muted)] uppercase tracking-wider mb-3">Custom Fields</h4>
                {formData.customFields && Object.keys(formData.customFields).map(key => (
                  <div key={key} className="mb-3">
                    <label className="text-xs font-medium text-[color:var(--color-muted)] block mb-1">{key}</label>
                    <input
                      type="text"
                      value={formData.customFields[key] || ''}
                      onChange={(e) => setFormData(s => ({ 
                        ...s, 
                        customFields: { ...s.customFields, [key]: e.target.value } 
                      }))}
                      onBlur={() => handleChange('customFields', formData.customFields)}
                      className="w-full p-2 text-sm rounded bg-[color:var(--color-background)] border outline-none"
                      style={{ borderColor: 'var(--color-border)' }}
                    />
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newField = prompt('Enter custom field name:');
                    if (newField) {
                      const updated = { ...formData.customFields, [newField]: '' };
                      setFormData(s => ({ ...s, customFields: updated }));
                      handleChange('customFields', updated);
                    }
                  }}
                  className="text-xs font-medium text-[color:var(--color-accent)] hover:underline"
                >
                  + Add custom field
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
