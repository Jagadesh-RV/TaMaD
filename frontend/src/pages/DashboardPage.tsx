import { useEffect } from 'react';
import {
  CheckCircle2,
  Clock3,
  Zap,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTaskStore } from '../store/taskStore';

export default function DashboardPage() {
  const { tasks, loading, fetchTasks } = useTaskStore() as any;

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const completedTasks = tasks.filter((t: any) => t.status === 'done').length;
  const pendingTasks = tasks.filter((t: any) => t.status !== 'done').length;
  const totalTasks = tasks.length;
  const efficiency = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const productivity = totalTasks === 0 ? 0 : Math.min(100, Math.round((completedTasks * 1.5 / (totalTasks || 1)) * 100));

  const stats = [
    {
      title: 'Tasks Completed',
      value: completedTasks,
      icon: CheckCircle2,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      title: 'Pending Tasks',
      value: pendingTasks,
      icon: Clock3,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      title: 'Efficiency',
      value: `${efficiency}%`,
      icon: TrendingUp,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Productivity',
      value: `${productivity}%`,
      icon: Zap,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
  ];

  return (
    <div className="page relative z-10">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="page-title mb-2">
            Dashboard
          </h1>
          <p className="text-secondary text-lg font-medium">
            AI-powered productivity intelligence
          </p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm font-semibold">Syncing Data...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 group hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 font-semibold mb-1 text-sm uppercase tracking-wider">
                  {stat.title}
                </p>
                <h2 className="text-4xl font-bold text-[#1d1d1f] mt-2 tracking-tight">
                  {loading ? <span className="animate-pulse bg-gray-200 text-transparent rounded">000</span> : stat.value}
                </h2>
              </div>
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} transition-colors group-hover:scale-105`}>
                <stat.icon size={28} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}