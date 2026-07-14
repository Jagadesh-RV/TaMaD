import { useEffect } from 'react';
import {
  CheckCircle2,
  Clock3,
  Zap,
  TrendingUp,
  Loader2,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTaskStore } from '../store/taskStore';
import GlassCard from '../components/ui/GlassCard';

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
    {
      title: 'Tasks Completed',
      value: completedTasks,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Pending Tasks',
      value: pendingTasks,
      icon: Clock3,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Efficiency',
      value: `${efficiency}%`,
      icon: TrendingUp,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Productivity',
      value: `${productivity}%`,
      icon: Zap,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
  ];

  return (
    <div className="page relative z-10">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <h1 className="page-title mb-0">
              Overview
            </h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-secondary text-lg font-medium"
          >
            Your AI-powered productivity intelligence
          </motion.p>
        </div>
        
        {loading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 text-[#111111] bg-white px-5 py-2.5 rounded-xl border border-border shadow-sm"
          >
            <Loader2 size={18} className="animate-spin text-primary" />
            <span className="text-sm font-medium tracking-wide">Syncing Intelligence...</span>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <GlassCard key={stat.title} delay={i * 0.1} className="p-6 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary font-medium mb-2 text-xs uppercase tracking-wider">
                  {stat.title}
                </p>
                <h2 className="text-3xl font-semibold text-[#111111] mt-1 tracking-tight flex items-baseline gap-1">
                  {loading ? (
                    <span className="animate-pulse bg-gray-200 text-transparent rounded w-16 h-8 inline-block">00</span>
                  ) : (
                    stat.value
                  )}
                </h2>
              </div>
              <div className={`p-3.5 rounded-xl border ${stat.bg} ${stat.color} transition-transform duration-300 group-hover:scale-105`}>
                <stat.icon size={24} strokeWidth={2} />
              </div>
            </div>
            
            <div className="mt-6 w-full h-1 bg-black/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: loading ? '0%' : '70%' }}
                transition={{ duration: 1, delay: 0.2 + (i * 0.1) }}
                className={`h-full ${stat.color.replace('text', 'bg')} rounded-full opacity-80`}
              />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}