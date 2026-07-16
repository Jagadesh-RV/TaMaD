import { useEffect } from 'react';
import { CheckCircle2, Clock3, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTaskStore } from '../store/taskStore';
import { Card } from '../components/ui/Card';

export default function DashboardPage() {
  const { tasks, loading, fetchTasks } = useTaskStore() as any;

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const completedTasks = safeTasks.filter((t: any) => t.status === 'done').length;
  const pendingTasks = safeTasks.filter((t: any) => t.status !== 'done').length;
  const totalTasks = safeTasks.length;
  const efficiency = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const productivity = totalTasks === 0 ? 0 : Math.min(100, Math.round((completedTasks * 1.5 / (totalTasks || 1)) * 100));

  const stats = [
    { title: 'Today', value: pendingTasks, icon: Clock3, accent: 'text-amber-500' },
    { title: 'Completed', value: completedTasks, icon: CheckCircle2, accent: 'text-emerald-500' },
    { title: 'Focus score', value: `${productivity}%`, icon: Zap, accent: 'text-indigo-500' },
    { title: 'Momentum', value: `${efficiency}%`, icon: TrendingUp, accent: 'text-sky-500' },
  ];

  return (
    <div className="page">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--color-muted)]">Executive overview</p>
          <h1 className="page-title">A calmer way to run your week.</h1>
          <p className="text-sm text-[color:var(--color-muted)]">Track your commitments, protect focus time, and keep momentum without the noise.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-[color:var(--color-surface)] px-3 py-2 text-sm text-[color:var(--color-muted)]">
          <Sparkles size={16} className="text-[color:var(--color-accent)]" />
          {loading ? 'Syncing…' : 'Updated just now'}
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
            <Card variant="elevated" className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-muted)]">{stat.title}</p>
                <div className={`rounded-xl bg-[color:var(--color-surface-hover)] p-2 ${stat.accent}`}>
                  <stat.icon size={18} />
                </div>
              </div>
              <div className="text-3xl font-semibold text-[color:var(--color-foreground)]">{loading ? '—' : stat.value}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card variant="elevated" className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--color-foreground)]">This week at a glance</h2>
            <p className="mt-1 text-sm text-[color:var(--color-muted)]">A simple view of what’s moving and what deserves attention.</p>
          </div>
          <div className="rounded-full bg-[color:var(--color-surface-hover)] px-3 py-1 text-sm text-[color:var(--color-muted)]">{totalTasks} items</div>
        </div>
      </Card>
    </div>
  );
}