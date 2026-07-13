import { useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, TrendingUp, CheckCircle2, ListTodo } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTaskStore } from '../store/taskStore';

export default function AnalyticsPage() {
  const { tasks, loading, fetchTasks } = useTaskStore() as any;

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const completed = tasks.filter((t: any) => t.status === 'done').length;
  const inProgress = tasks.filter((t: any) => t.status === 'in-progress').length;
  const todo = tasks.filter((t: any) => t.status === 'todo').length;
  const total = tasks.length;

  const chartData = [
    { name: 'To Do', count: todo, color: '#94a3b8' },
    { name: 'In Progress', count: inProgress, color: '#0071e3' },
    { name: 'Done', count: completed, color: '#34c759' },
  ];

  return (
    <div className="page relative z-10">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="page-title mb-2">Analytics</h1>
          <p className="text-secondary text-lg font-medium">
            Track productivity and performance insights
          </p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm font-semibold">Syncing Data...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Total Tasks', value: total, icon: ListTodo, color: 'text-primary', bg: 'bg-blue-50' },
          { title: 'Completed', value: completed, icon: CheckCircle2, color: 'text-success', bg: 'bg-green-50' },
          { title: 'Efficiency', value: total > 0 ? `${Math.round((completed / total) * 100)}%` : '0%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 group hover:-translate-y-1 transition-transform"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 font-semibold mb-1 text-sm uppercase tracking-wider">
                  {stat.title}
                </p>
                <h2 className="text-4xl font-bold text-[#1d1d1f] mt-2 tracking-tight">
                  {stat.value}
                </h2>
              </div>
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} transition-colors group-hover:scale-105`}>
                <stat.icon size={28} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 h-96 flex flex-col">
          <h3 className="text-lg font-bold text-[#1d1d1f] mb-6">Task Distribution</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#1d1d1f', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col">
          <h3 className="text-lg font-bold text-[#1d1d1f] mb-4">AI Insights</h3>
          <div className="space-y-4 flex-1">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-sm text-gray-700">
              <span className="font-bold text-primary block mb-1">Observation</span>
              You have {inProgress} tasks currently in progress. Consider finishing them before starting new ones to avoid context switching.
            </div>
            <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-sm text-gray-700">
              <span className="font-bold text-success block mb-1">Achievement</span>
              You've completed {completed} tasks so far. Keep up the great momentum!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}