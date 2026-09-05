import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, AlertCircle } from 'lucide-react';
import { useAutomationStore, AutomationRule } from '../../store/automationStore';
import { useWorkspaceStore } from '../../store/workspaceStore';

interface RuleBuilderProps {
  rule?: AutomationRule | null;
  onClose: () => void;
}

export default function RuleBuilder({ rule, onClose }: RuleBuilderProps) {
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace);
  const { createRule, updateRule } = useAutomationStore();

  const [name, setName] = useState(rule?.name || '');
  const [event, setEvent] = useState(rule?.trigger.event || 'TASK_CREATED');
  const [actionType, setActionType] = useState(rule?.action.type || 'SEND_NOTIFICATION');
  
  const [conditionField, setConditionField] = useState(rule?.trigger.conditions[0]?.field || 'priority');
  const [conditionOperator, setConditionOperator] = useState(rule?.trigger.conditions[0]?.operator || 'equals');
  const [conditionValue, setConditionValue] = useState(rule?.trigger.conditions[0]?.value || 'urgent');

  const [actionMessage, setActionMessage] = useState(rule?.action.payload?.message || '');
  const [actionStatus, setActionStatus] = useState(rule?.action.payload?.status || 'done');
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Rule name is required');
      return;
    }
    if (actionType === 'SEND_NOTIFICATION' && !actionMessage.trim()) {
      setError('Notification message is required');
      return;
    }

    setIsSaving(true);
    setError('');

    const ruleData = {
      workspaceId: currentWorkspace?._id,
      name,
      isActive: true,
      trigger: {
        event,
        conditions: [
          { field: conditionField, operator: conditionOperator, value: conditionValue }
        ]
      },
      action: {
        type: actionType,
        payload: actionType === 'SEND_NOTIFICATION' ? { message: actionMessage } : { status: actionStatus }
      }
    };

    let success = false;
    if (rule) {
      success = await updateRule(rule._id, ruleData);
    } else {
      const res = await createRule(ruleData);
      success = !!res;
    }

    setIsSaving(false);
    if (success) {
      onClose();
    } else {
      setError('Failed to save automation rule');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-[color:var(--color-surface)] shadow-2xl flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        <div className="flex items-center justify-between border-b border-[color:var(--color-border-light)] p-5">
          <h2 className="text-lg font-semibold text-[color:var(--color-foreground)]">
            {rule ? 'Edit Automation Rule' : 'Create Automation Rule'}
          </h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-[color:var(--color-muted)] hover:bg-[color:var(--color-surface-hover)] hover:text-[color:var(--color-foreground)]">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[color:var(--color-foreground-secondary)]">Rule Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. Notify on Urgent Tasks" 
              className="w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2.5 text-sm outline-none transition-colors focus:border-[color:var(--color-accent)] focus:ring-1 focus:ring-[color:var(--color-accent)]"
            />
          </div>

          {/* Trigger */}
          <div className="rounded-xl border border-[color:var(--color-border-light)] bg-[color:var(--color-surface-hover)] p-5">
            <h3 className="mb-4 font-medium text-[color:var(--color-foreground)] flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-500">1</span> 
              When this happens... (Trigger)
            </h3>
            
            <select 
              value={event} 
              onChange={e => setEvent(e.target.value as any)}
              className="w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2 text-sm outline-none focus:border-[color:var(--color-accent)]"
            >
              <option value="TASK_CREATED">Task is created</option>
              <option value="TASK_UPDATED">Task is updated</option>
              <option value="TASK_STATUS_CHANGED">Task status changes</option>
              <option value="TASK_PRIORITY_CHANGED">Task priority changes</option>
            </select>

            <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
              <span className="text-sm text-[color:var(--color-muted)]">And</span>
              <select 
                value={conditionField} 
                onChange={e => setConditionField(e.target.value)}
                className="flex-1 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[color:var(--color-accent)]"
              >
                <option value="priority">Priority</option>
                <option value="status">Status</option>
                <option value="title">Title</option>
              </select>
              <select 
                value={conditionOperator} 
                onChange={e => setConditionOperator(e.target.value as any)}
                className="flex-1 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[color:var(--color-accent)]"
              >
                <option value="equals">is equal to</option>
                <option value="not_equals">is not equal to</option>
                <option value="contains">contains</option>
              </select>
              <input 
                type="text" 
                value={conditionValue} 
                onChange={e => setConditionValue(e.target.value)}
                placeholder="Value..."
                className="flex-1 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[color:var(--color-accent)]"
              />
            </div>
          </div>

          {/* Action */}
          <div className="rounded-xl border border-[color:var(--color-border-light)] bg-[color:var(--color-surface-hover)] p-5">
            <h3 className="mb-4 font-medium text-[color:var(--color-foreground)] flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-500">2</span> 
              Do this... (Action)
            </h3>
            
            <select 
              value={actionType} 
              onChange={e => setActionType(e.target.value as any)}
              className="w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2 text-sm outline-none focus:border-[color:var(--color-accent)]"
            >
              <option value="SEND_NOTIFICATION">Send an in-app notification</option>
              <option value="UPDATE_TASK">Update task property</option>
            </select>

            {actionType === 'SEND_NOTIFICATION' && (
              <div className="mt-4">
                <label className="mb-2 block text-xs font-medium text-[color:var(--color-muted)]">Notification Message</label>
                <input 
                  type="text" 
                  value={actionMessage} 
                  onChange={e => setActionMessage(e.target.value)}
                  placeholder="e.g. A new high priority task was added!"
                  className="w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2 text-sm outline-none focus:border-[color:var(--color-accent)]"
                />
              </div>
            )}

            {actionType === 'UPDATE_TASK' && (
              <div className="mt-4">
                <label className="mb-2 block text-xs font-medium text-[color:var(--color-muted)]">Change Status To</label>
                <select 
                  value={actionStatus} 
                  onChange={e => setActionStatus(e.target.value)}
                  className="w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2 text-sm outline-none focus:border-[color:var(--color-accent)]"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[color:var(--color-border-light)] p-5">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-[color:var(--color-foreground-secondary)] hover:bg-[color:var(--color-surface-hover)] hover:text-[color:var(--color-foreground)]">
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-[color:var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Rule'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
