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
    } catch {}
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
        className="mb-6 flex gap-1 rounded-xl p-1"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', width: 'fit-content' }}
      >
        <button
          onClick={() => setActiveTab('chat')}
          className={clsx('rounded-lg px-4 py-2 text-sm font-medium transition-all', activeTab === 'chat' ? 'btn-primary' : 'btn-ghost')}
          style={activeTab === 'chat' ? {} : { color: 'var(--color-muted)' }}
        >
          <MessageSquare size={14} className="mr-1.5 inline" />
          Workspace Chat
        </button>
        <button
          onClick={() => setActiveTab('parser')}
          className={clsx('rounded-lg px-4 py-2 text-sm font-medium transition-all', activeTab === 'parser' ? 'btn-primary' : 'btn-ghost')}
          style={activeTab === 'parser' ? {} : { color: 'var(--color-muted)' }}
        >
          <Wand2 size={14} className="mr-1.5 inline" />
          Task Parser
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
            <div
              className="flex flex-col rounded-xl border"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', height: 'calc(100vh - 280px)', minHeight: '500px' }}
            >
              <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'thin' }}>
                {chatMessages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center">
                    <div
                      className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                      style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
                    >
                      <Sparkles size={28} />
                    </div>
                    <h3 className="mb-2 text-lg font-bold" style={{ color: 'var(--color-foreground)' }}>AI Workspace Assistant</h3>
                    <p className="mb-8 text-sm text-center max-w-md" style={{ color: 'var(--color-muted)' }}>
                      Ask questions about your {currentWorkspace?.type === 'team' ? 'team workspace' : 'personal workspace'}, get insights on tasks, or generate reports.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2 max-w-lg w-full">
                      {SUGGESTED_PROMPTS.map((prompt) => {
                        const Icon = prompt.icon;
                        return (
                          <button
                            key={prompt.label}
                            onClick={() => { setChatInput(prompt.query); chatInputRef.current?.focus(); }}
                            className="flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition-all hover:shadow-soft"
                            style={{ background: 'var(--color-background)', borderColor: 'var(--color-border-light)', color: 'var(--color-foreground)' }}
                          >
                            <Icon size={16} style={{ color: 'var(--color-accent)' }} />
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
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={clsx('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                      >
                        {msg.role === 'assistant' && (
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                            style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
                          >
                            <Sparkles size={14} />
                          </div>
                        )}
                        <div
                          className={clsx(
                            'max-w-[70%] rounded-xl px-4 py-3 text-sm leading-relaxed',
                            msg.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'
                          )}
                          style={{
                            background: msg.role === 'user' ? 'var(--color-accent)' : 'var(--color-background)',
                            color: msg.role === 'user' ? 'white' : 'var(--color-foreground)',
                            border: msg.role === 'user' ? 'none' : '1px solid var(--color-border-light)',
                          }}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <p className="mt-2 text-[10px] opacity-60">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {chatLoading && (
                      <div className="flex gap-3">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
                        >
                          <Sparkles size={14} />
                        </div>
                        <div className="rounded-xl rounded-bl-sm px-4 py-3" style={{ background: 'var(--color-background)', border: '1px solid var(--color-border-light)' }}>
                          <div className="flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
                            <span className="text-sm" style={{ color: 'var(--color-muted)' }}>Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>

              <div className="border-t p-4" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-end gap-3">
                  <textarea
                    ref={chatInputRef}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your workspace..."
                    rows={1}
                    className="input flex-1 resize-none"
                    style={{ minHeight: '42px', maxHeight: '120px' }}
                  />
                  <button
                    onClick={handleSendChat}
                    disabled={!chatInput.trim() || chatLoading}
                    className="btn btn-primary shrink-0"
                    style={{ height: '42px', width: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="parser"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="card p-6">
                <h3 className="mb-4 text-base font-bold" style={{ color: 'var(--color-foreground)' }}>
                  <Wand2 size={16} className="mr-2 inline" style={{ color: 'var(--color-accent)' }} />
                  Natural Language Input
                </h3>
                <textarea
                  value={parseInput}
                  onChange={(e) => setParseInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your task in natural language..."
                  rows={4}
                  className="input mb-4 w-full resize-none"
                />
                <button
                  onClick={handleParse}
                  disabled={!parseInput.trim() || parsing}
                  className="btn btn-primary w-full"
                >
                  {parsing ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
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
                        "{example}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="mb-4 text-base font-bold" style={{ color: 'var(--color-foreground)' }}>
                  <Sparkles size={16} className="mr-2 inline" style={{ color: 'var(--color-accent)' }} />
                  Parsed Result
                </h3>
                {!parsedTask ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div
                      className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ background: 'var(--color-surface-active)', color: 'var(--color-muted)' }}
                    >
                      <Wand2 size={20} />
                    </div>
                    <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
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
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
