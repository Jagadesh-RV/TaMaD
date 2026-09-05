import { useEffect, useState } from 'react';
import { 
  Users, Building2, Server, Activity, 
  ArrowUpRight, ArrowDownRight, Zap 
} from 'lucide-react';
import { useAdminAuthStore } from '../../store/adminAuthStore';

interface PlatformMetrics {
  totalUsers: number;
  totalOrgs: number;
  totalTeams: number;
  totalWorkspaces: number;
}

export default function AdminDashboard() {
  const token = useAdminAuthStore(s => s.token);
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/v1/admin/metrics/overview`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMetrics();
  }, [token]);

  const stats = [
    { label: 'Total Users', value: metrics?.totalUsers || 0, icon: Users, change: '+12%', positive: true },
    { label: 'Organizations', value: metrics?.totalOrgs || 0, icon: Building2, change: '+4%', positive: true },
    { label: 'Active Teams', value: metrics?.totalTeams || 0, icon: Zap, change: '+2%', positive: true },
    { label: 'Workspaces', value: metrics?.totalWorkspaces || 0, icon: Server, change: '+8%', positive: true },
  ];

  return (
    <div className="p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Platform Overview</h1>
          <p className="mt-1 text-sm text-slate-400">Real-time metrics for TaMaD infrastructure.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500 ring-1 ring-emerald-500/20">
          <Activity size={14} className="animate-pulse" />
          System Operational
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 rounded-xl bg-slate-800/50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                  <stat.icon size={20} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-semibold text-white">{stat.value.toLocaleString()}</p>
                <p className={`flex items-center gap-1 text-sm font-medium ${stat.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stat.positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {stat.change}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Placeholders for future charts */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 h-96 flex items-center justify-center text-slate-500">
          Signups & Activity Chart Placeholder
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 h-96 flex items-center justify-center text-slate-500">
          System Health Monitoring Placeholder
        </div>
      </div>
    </div>
  );
}
