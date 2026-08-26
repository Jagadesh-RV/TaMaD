import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Plus, Search, Trash2, Power, 
  Settings, CheckCircle2, AlertCircle, Clock
} from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useAutomationStore, AutomationRule } from '../store/automationStore';
import RuleBuilder from '../components/automations/RuleBuilder';
import TopBar from '../components/layout/TopBar';

export default function AutomationsPage() {
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace);
  const { rules, fetchRules, toggleRuleActive, deleteRule } = useAutomationStore();
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

  useEffect(() => {
    if (currentWorkspace) {
      fetchRules(currentWorkspace._id);
    }
  }, [currentWorkspace, fetchRules]);

  const handleCreateRule = () => {
    setEditingRule(null);
    setIsBuilderOpen(true);
  };

  const handleEditRule = (rule: AutomationRule) => {
    setEditingRule(rule);
    setIsBuilderOpen(true);
  };

  return (
    <div className="flex h-full flex-col bg-[color:var(--color-surface)]">
      <TopBar />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[color:var(--color-foreground)] flex items-center gap-2">
                <Zap className="text-amber-500" />
                Custom Automations
              </h1>
              <p className="mt-1 text-sm text-[color:var(--color-muted)]">
                Build rules to automate your workspace tasks and processes.
              </p>
            </div>
            <button
              onClick={handleCreateRule}
              className="flex items-center gap-2 rounded-lg bg-[color:var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
              Create Rule
            </button>
          </div>

          <div className="grid gap-4">
            {rules.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[color:var(--color-border-light)] p-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-surface-hover)]">
                  <Zap className="text-[color:var(--color-muted)]" size={24} />
                </div>
                <h3 className="mt-4 text-sm font-medium text-[color:var(--color-foreground)]">No automations yet</h3>
                <p className="mt-1 text-sm text-[color:var(--color-muted)]">
                  Get started by creating a new rule to automate repetitive tasks.
                </p>
                <button
                  onClick={handleCreateRule}
                  className="mt-6 text-sm font-medium text-[color:var(--color-accent)] hover:underline"
                >
                  Create your first rule &rarr;
                </button>
              </div>
            ) : (
              rules.map((rule) => (
                <div 
                  key={rule._id}
                  className="flex items-center justify-between rounded-xl border border-[color:var(--color-border-light)] p-4 bg-[color:var(--color-surface)] shadow-sm hover:border-[color:var(--color-border)] transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                        <Zap size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[color:var(--color-foreground)]">
                          {rule.name}
                        </h3>
                        <p className="text-xs text-[color:var(--color-muted)] mt-0.5">
                          Trigger: {rule.trigger.event.replace(/_/g, ' ')} 
                          &nbsp;&bull;&nbsp; Action: {rule.action.type.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleRuleActive(rule._id, !rule.isActive)}
                      className={`flex h-8 w-12 items-center rounded-full p-1 transition-colors ${rule.isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                      <div className={`h-6 w-6 rounded-full bg-white shadow transform transition-transform ${rule.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                    <button
                      onClick={() => handleEditRule(rule)}
                      className="text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)] p-2 rounded-lg hover:bg-[color:var(--color-surface-hover)]"
                    >
                      <Settings size={16} />
                    </button>
                    <button
                      onClick={() => deleteRule(rule._id)}
                      className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-500/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isBuilderOpen && (
          <RuleBuilder 
            rule={editingRule} 
            onClose={() => setIsBuilderOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
