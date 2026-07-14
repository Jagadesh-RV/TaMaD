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

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const completed = safeTasks.filter((t: any) => t.status === 'done').length;
  const inProgress = safeTasks.filter((t: any) => t.status === 'in-progress').length;
  const todo = safeTasks.filter((t: any) => t.status === 'todo').length;
  const total = safeTasks.length;

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
          <div className="flex items-center gap-2 text-[#111111] bg-white px-4 py-2 rounded-full border border-border shadow-sm">
            <Loader2 size={18} className="animate-spin text-primary" />
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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 group hover:-translate-y-1 transition-transform"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary font-medium mb-1 text-xs uppercase tracking-wider">
                  {stat.title}
                </p>
                <h2 className="text-3xl font-semibold text-[#111111] mt-2 tracking-tight">
                  {stat.value}
                </h2>
              </div>
              <div className={`p-3.5 rounded-xl ${stat.bg} ${stat.color} transition-colors group-hover:scale-105`}>
                <stat.icon size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 h-96 flex flex-col">
          <h3 className="text-lg font-semibold text-[#111111] mb-6">Task Distribution</h3>
          {total === 0 ? (
            <div className="flex-1 flex items-center justify-center text-secondary font-medium">
              Analytics will appear once data is available
            </div>
          ) : (
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" stroke="#6E6E73" tick={{ fill: '#6E6E73' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#6E6E73" tick={{ fill: '#6E6E73' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E8E8ED', borderRadius: '12px', color: '#111111', boxShadow: '0 4px 12px -4px rgba(0, 0, 0, 0.08)' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="glass-panel p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-[#111111] mb-4">AI Insights</h3>
          <div className="space-y-4 flex-1">
            {total === 0 ? (
              <div className="flex-1 flex h-full items-center justify-center text-secondary font-medium text-center p-4">
                AI insights will appear as you use TaMaD.
              </div>
            ) : (
              <>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-sm text-[#111111]">
                  <span className="font-semibold text-primary block mb-1">Observation</span>
                  You have {inProgress} tasks currently in progress. Consider finishing them before starting new ones to avoid context switching.
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-sm text-[#111111]">
                  <span className="font-semibold text-success block mb-1">Achievement</span>
                  You've completed {completed} tasks so far. Keep up the great momentum!
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}