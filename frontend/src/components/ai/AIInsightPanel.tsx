import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowUpRight, AlertTriangle, Clock, TrendingUp,
  CalendarClock, Lightbulb, Target,
} from 'lucide-react';
import { Card } from '../ui/Card';

interface TaskLike {
  _id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AIInsightPanelProps {
  tasks: TaskLike[];
  projectsCount?: number;
  today?: string;
  title?: string;
}

type InsightKind = 'success' | 'info' | 'warn' | 'danger';

interface Insight {
  kind: InsightKind;
  icon: React.ElementType;
  title: string;
  body: string;
  action?: string;
}

const KIND_STYLE: Record<InsightKind, { bg: string; text: string }> = {
  success: { bg: 'var(--color-success-light)', text: 'var(--color-success)' },
  info: { bg: 'var(--color-info-light)', text: 'var(--color-info)' },
  warn: { bg: 'var(--color-warning-light)', text: 'var(--color-warning)' },
  danger: { bg: 'var(--color-danger-light)', text: 'var(--color-danger)' },
};

/**
 * AIInsightPanel
 * --------------
 * The AI as a teammate — not a chatbot. It reads the live state of the
 * workspace and speaks first: warns about risk, recommends focus, and
 * celebrates momentum. Every insight is derived from real data.
 */
export default function AIInsightPanel({ tasks, projectsCount = 0, today }: AIInsightPanelProps) {
  const navigate = useNavigate();
  const todayStr = today ?? new Date().toISOString().slice(0, 10);

  const insights = useMemo<Insight[]>(() => {
    const list: Insight[] = [];
    const total = tasks.length;
    const overdue = tasks.filter(t => t.dueDate && t.dueDate < todayStr && t.status !== 'done');
    const dueToday = tasks.filter(t => t.dueDate === todayStr && t.status !== 'done');
    const inFlight = tasks.filter(t => t.status === 'in-progress');
    const done = tasks.filter(t => t.status === 'done');
    const completionRate = total > 0 ? Math.round((done.length / total) * 100) : 0;

    if (overdue.length > 0) {
      const urgent = overdue.filter(t => t.priority === 'urgent' || t.priority === 'high').length;
      list.push({
        kind: urgent > 0 ? 'danger' : 'warn',
        icon: AlertTriangle,
        title: `${overdue.length} task${overdue.length > 1 ? 's' : ''} are past due`,
        body: urgent > 0
          ? `${urgent} high-impact item${urgent > 1 ? 's' : ''} risk slipping the team. Clear these first.`
          : 'Clearing these now will restore momentum for the rest of the week.',
        action: 'Review overdue',
      });
    }

    if (dueToday.length > 0) {
      list.push({
        kind: 'info',
        icon: CalendarClock,
        title: `${dueToday.length} deliverable${dueToday.length > 1 ? 's' : ''} due today`,
        body: dueToday.length > 2
          ? 'A packed plate. I can help you rebalance tomorrow to protect focus.'
          : 'A focused window — protect your morning for these.',
        action: 'See today',
      });
    }

    if (inFlight.length >= 4) {
      list.push({
        kind: 'warn',
        icon: Clock,
        title: 'Work in progress is spreading',
        body: `${inFlight.length} items are open at once. Limiting to three boosts delivery speed.`,
      });
    }

    if (total > 0 && completionRate >= 60) {
      list.push({
        kind: 'success',
        icon: TrendingUp,
        title: `Momentum is strong — ${completionRate}% completion`,
        body: projectsCount > 0
          ? `Across ${projectsCount} project${projectsCount > 1 ? 's' : ''}, you're compounding progress. Keep the streak.`
          : 'You are compounding progress. Keep the streak alive.',
      });
    } else if (total === 0) {
      list.push({
        kind: 'info',
        icon: Lightbulb,
        title: 'Your workspace is a blank canvas',
        body: 'Describe a task in plain language and I will turn it into a structured work item.',
        action: 'Let me help',
      });
    } else {
      list.push({
        kind: 'info',
        icon: Target,
        title: 'A clear next move will unlock the week',
        body: 'Pick the smallest unfinished task and finish it — momentum builds from a single win.',
      });
    }

    return list.slice(0, 3);
  }, [tasks, projectsCount, todayStr]);

  return (
    <Card className="p-6 overflow-hidden">
      {/* AI persona header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[color:var(--color-accent)] to-[color:var(--color-info)] text-white shadow-md">
              <Sparkles size={20} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[color:var(--color-success)] ring-2 ring-[color:var(--color-surface)]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[color:var(--color-foreground)]">TaMaD AI</p>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[color:var(--color-muted)]">
              Reading your workspace
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/ai')}
          className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold text-[color:var(--color-accent)] transition-colors hover:bg-[color:var(--color-accent-ghost)]"
        >
          Open <ArrowUpRight size={12} />
        </button>
      </div>

      {/* Insights */}
      <div className="space-y-3">
        {insights.map((insight, i) => {
          const Icon = insight.icon;
          const style = KIND_STYLE[insight.kind];
          return (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 + i * 0.09, type: 'spring', stiffness: 300, damping: 30 }}
              className="flex gap-3 rounded-2xl border p-3.5 transition-colors"
              style={{ background: 'var(--color-background)', borderColor: 'var(--color-border-light)' }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: style.bg, color: style.text }}>
                <Icon size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold leading-snug text-[color:var(--color-foreground)]">{insight.title}</p>
                <p className="mt-0.5 text-xs font-medium leading-relaxed text-[color:var(--color-foreground-secondary)]">{insight.body}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
