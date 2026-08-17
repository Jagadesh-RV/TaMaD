import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, Copy, Check, Trash2, Wand2, MessageSquare,
  Clock, AlertCircle, Tag, Calendar, ArrowRight, Loader2, Lightbulb,
  FileText, Zap, BarChart3,
} from 'lucide-react';
import clsx from 'clsx';
import { useAIStore } from '../store/aiStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useTaskStore } from '../store/taskStore';
import { showToast, extractErrorMessage } from '../lib/toast';
import { Card } from '../components/ui/Card';

const SUGGESTED_PROMPTS = [
  { icon: Zap, label: 'Summarize today', query: 'Summarize my tasks for today' },
  { icon: FileText, label: 'Generate report', query: 'Generate a weekly productivity report' },
  { icon: BarChart3, label: 'Overdue tasks', query: 'Show me all overdue tasks' },
  { icon: Lightbulb, label: 'Productivity tips', query: 'Give me 3 productivity tips based on my current workload' },
];

const PARSE_EXAMPLES = [
  'Tomorrow at 5PM finish the UI design for the dashboard with high priority',
  'Create a bug report for the login page crash, urgent priority, due Friday',
  'Low priority: review the documentation by end of week',
  'Setup CI/CD pipeline for the frontend, medium priority, assign to dev team',
];

export default function AIAssistantPage() {
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace);
  const workspaceId = currentWorkspace?._id || '';
  const { createTask } = useTaskStore();
  const {
    parsedTask, parsing, chatMessages, chatLoading,
    parseTask, clearParsedTask, sendChatMessage, clearChat,
  } = useAIStore();

  const [activeTab, setActiveTab] = useState<'chat' | 'parser'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [parseInput, setParseInput] = useState('');
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendChat = useCallback(async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput('');
    await sendChatMessage(msg, workspaceId);
  }, [chatInput, chatLoading, sendChatMessage, workspaceId]);

  const handleParse = useCallback(async () => {
    if (!parseInput.trim() || parsing) return;
    await parseTask(parseInput.trim());
  }, [parseInput, parsing, parseTask]);

  const handleCreateFromParsed = useCallback(async () => {
    if (!parsedTask || !workspaceId) return;
    try {
      await createTask({
        title: parsedTask.title,
        description: parsedTask.description,
        priority: parsedTask.priority,
        dueDate: parsedTask.dueDate,
        workspaceId,
      });
      clearParsedTask();
      setParseInput('');
    } catch (err) {
      showToast.error(extractErrorMessage(err));
    }
  }, [parsedTask, workspaceId, createTask, clearParsedTask]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (activeTab === 'chat') handleSendChat();
      else handleParse();
    }
  };

  const priorityColors: Record<string, string> = {
    low: 'var(--color-muted)',
    medium: 'var(--color-info)',
    high: 'var(--color-warning)',
    urgent: 'var(--color-danger)',
  };

  return (
    <div className="page" style={{ padding: '0 32px 40px' }}>
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--color-muted)' }}>
          AI powered
        </p>
        <h1 className="page-title">AI Assistant</h1>
        <p className="page-subtitle">
          Natural language task parsing and workspace intelligence.
        </p>
      </div>

      <div
        className="mb-8 flex gap-2 rounded-full p-1.5 shadow-xs w-max bg-[color:var(--color-surface-active)]"
      >
        <button
          onClick={() => setActiveTab('chat')}
          className={clsx('relative rounded-full px-5 py-2.5 text-sm font-bold transition-all', activeTab === 'chat' ? 'text-white' : 'text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]')}
        >
          {activeTab === 'chat' && (
            <motion.div
              layoutId="ai-tab"
              className="absolute inset-0 rounded-full bg-[color:var(--color-foreground)] z-0 shadow-sm"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <MessageSquare size={16} />
            Workspace Chat
          </span>
        </button>
        <button
          onClick={() => setActiveTab('parser')}
          className={clsx('relative rounded-full px-5 py-2.5 text-sm font-bold transition-all', activeTab === 'parser' ? 'text-white' : 'text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)]')}
        >
          {activeTab === 'parser' && (
            <motion.div
              layoutId="ai-tab"
              className="absolute inset-0 rounded-full bg-[color:var(--color-foreground)] z-0 shadow-sm"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <Wand2 size={16} />
            Task Parser
          </span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'chat' ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Card
              className="flex flex-col shadow-md overflow-hidden"
              style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}
            >
              <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'thin' }}>
                {chatMessages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center">
                    <div
                      className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl shadow-sm bg-[color:var(--color-accent-ghost)] text-[color:var(--color-accent)]"
                    >
                      <Sparkles size={32} />
                    </div>
                    <h3 className="mb-3 text-2xl font-bold text-[color:var(--color-foreground)]">AI Workspace Assistant</h3>
                    <p className="mb-10 text-sm text-center max-w-md text-[color:var(--color-foreground-secondary)] leading-relaxed">
                      Ask questions about your {currentWorkspace?.type === 'team' ? 'team workspace' : 'personal workspace'}, get insights on tasks, or generate reports.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2 max-w-2xl w-full">
                      {SUGGESTED_PROMPTS.map((prompt) => {
                        const Icon = prompt.icon;
                        return (
                          <button
                            key={prompt.label}
                            onClick={() => { setChatInput(prompt.query); chatInputRef.current?.focus(); }}
                            className="group flex items-center gap-4 rounded-2xl border p-4 text-left text-sm font-semibold transition-all hover:shadow-md bg-[color:var(--color-background)] border-[color:var(--color-border-light)] text-[color:var(--color-foreground)] hover:border-[color:var(--color-accent)]"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--color-accent-ghost)] text-[color:var(--color-accent)] group-hover:bg-[color:var(--color-accent)] group-hover:text-white transition-colors">
                              <Icon size={18} />
                            </div>
                            {prompt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {chatMessages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={clsx('flex gap-4 max-w-3xl', msg.role === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start')}
                      >
                        {msg.role === 'assistant' && (
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-sm bg-[color:var(--color-accent-ghost)] text-[color:var(--color-accent)]"
                          >
                            <Sparkles size={18} />
                          </div>
                        )}
                        <div
                          className={clsx(
                            'rounded-2xl px-5 py-4 text-[15px] font-medium leading-relaxed shadow-sm',
                            msg.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'
                          )}
                          style={{
                            background: msg.role === 'user' ? 'var(--color-foreground)' : 'var(--color-background)',
                            color: msg.role === 'user' ? 'var(--color-background)' : 'var(--color-foreground)',
                            border: msg.role === 'user' ? 'none' : '1px solid var(--color-border-light)',
                          }}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <p className={clsx("mt-3 text-[11px] font-bold uppercase tracking-widest", msg.role === 'user' ? 'text-[color:var(--color-background-secondary)]' : 'text-[color:var(--color-muted)]')}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {chatLoading && (
                      <div className="flex gap-4 mr-auto max-w-3xl">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-sm bg-[color:var(--color-accent-ghost)] text-[color:var(--color-accent)]"
                        >
                          <Sparkles size={18} />
                        </div>
                        <div className="rounded-2xl rounded-bl-sm px-6 py-4 bg-[color:var(--color-background)] border border-[color:var(--color-border-light)] flex items-center h-[56px]">
                          <Loader2 size={18} className="animate-spin text-[color:var(--color-accent)]" />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>

              <div className="border-t p-4 bg-[color:var(--color-background)] border-[color:var(--color-border-light)]">
                <div className="flex items-end gap-3 max-w-4xl mx-auto">
                  <textarea
                    ref={chatInputRef}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your workspace..."
                    rows={1}
                    className="flex-1 resize-none rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-4 text-[15px] font-medium outline-none transition-colors focus:border-[color:var(--color-foreground)] focus:ring-1 focus:ring-[color:var(--color-foreground)]"
                    style={{ minHeight: '56px', maxHeight: '140px' }}
                  />
                  <button
                    onClick={handleSendChat}
                    disabled={!chatInput.trim() || chatLoading}
                    className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-2xl bg-[color:var(--color-foreground)] text-[color:var(--color-background)] transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="parser"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-8">
                <h3 className="mb-6 text-lg font-bold text-[color:var(--color-foreground)] flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--color-accent-ghost)] text-[color:var(--color-accent)] mr-4">
                    <Wand2 size={20} />
                  </div>
                  Natural Language Input
                </h3>
                <textarea
                  value={parseInput}
                  onChange={(e) => setParseInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your task in natural language..."
                  rows={4}
                  className="mb-6 w-full resize-none rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] px-5 py-4 text-[15px] font-medium outline-none transition-colors focus:border-[color:var(--color-accent)] focus:ring-1 focus:ring-[color:var(--color-accent)]"
                />
                <button
                  onClick={handleParse}
                  disabled={!parseInput.trim() || parsing}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[color:var(--color-foreground)] px-6 py-4 text-[15px] font-bold text-[color:var(--color-background)] transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {parsing ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />}
                  {parsing ? 'Parsing...' : 'Parse Task'}
                </button>

                <div className="mt-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                    Examples
                  </p>
                  <div className="space-y-2">
                    {PARSE_EXAMPLES.map((example, i) => (
                      <button
                        key={i}
                        onClick={() => setParseInput(example)}
                        className="w-full rounded-lg border p-3 text-left text-xs leading-relaxed transition-all hover:shadow-sm"
                        style={{ background: 'var(--color-background)', borderColor: 'var(--color-border-light)', color: 'var(--color-muted)' }}
                      >
                        &quot;{example}&quot;
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="p-8">
                <h3 className="mb-6 text-lg font-bold text-[color:var(--color-foreground)] flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--color-accent-ghost)] text-[color:var(--color-accent)] mr-4">
                    <Sparkles size={20} />
                  </div>
                  Parsed Result
                </h3>
                {!parsedTask ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div
                      className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[color:var(--color-surface-active)] text-[color:var(--color-muted)] shadow-inner"
                    >
                      <Wand2 size={32} />
                    </div>
                    <p className="text-sm font-semibold text-[color:var(--color-muted)]">
                      Enter text on the left to see the parsed task.
                    </p>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div
                      className="rounded-xl border p-4"
                      style={{ background: 'var(--color-background)', borderColor: 'var(--color-border-light)' }}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-bold" style={{ color: 'var(--color-foreground)' }}>
                          {parsedTask.title}
                        </h4>
                        <button
                          onClick={() => handleCopy(parsedTask.title)}
                          className="rounded p-1 transition-colors hover:bg-[var(--color-surface-active)]"
                          style={{ color: 'var(--color-muted)' }}
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>

                      {parsedTask.description && (
                        <p className="mb-3 text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                          {parsedTask.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                          style={{ background: priorityColors[parsedTask.priority] + '20', color: priorityColors[parsedTask.priority] }}
                        >
                          <AlertCircle size={12} />
                          {parsedTask.priority}
                        </span>
                        {parsedTask.dueDate && (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                            style={{ background: 'var(--color-info-light)', color: 'var(--color-info)' }}
                          >
                            <Calendar size={12} />
                            {new Date(parsedTask.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={handleCreateFromParsed} className="btn btn-primary flex-1">
                        <Check size={16} />
                        Create Task
                      </button>
                      <button onClick={clearParsedTask} className="btn btn-ghost">
                        <Trash2 size={16} />
                        Clear
                      </button>
                    </div>
                  </motion.div>
                )}
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
