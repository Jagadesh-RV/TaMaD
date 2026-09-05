import { useEffect, useState } from 'react';
import { 
  Activity, Server, Database, Cloud, 
  Cpu, HardDrive, RefreshCw, AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export default function AdminHealthPage() {
  const [loading, setLoading] = useState(false);

  // In a real implementation, this would fetch from /api/v1/admin/health
  // For now, we simulate real-time metrics
  const [metrics, setMetrics] = useState({
    api: { status: 'healthy', latency: 45, uptime: '99.99%' },
    mongodb: { status: 'healthy', latency: 12, size: '2.4 GB' },
    redis: { status: 'healthy', latency: 2, size: '156 MB' },
    storage: { status: 'healthy', used: '145 GB', total: '1 TB' },
    ai: { status: 'degraded', latency: 850, errors: 12 },
    n8n: { status: 'healthy', activeWorkflows: 45, queueSize: 0 }
  });

  const refreshHealth = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'healthy') return <CheckCircle2 size={18} className="text-emerald-500" />;
    if (status === 'degraded') return <AlertTriangle size={18} className="text-amber-500" />;
    return <AlertTriangle size={18} className="text-red-500" />;
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="text-emerald-500" />
            System Health
          </h1>
          <p className="mt-1 text-sm text-slate-400">Real-time infrastructure monitoring and diagnostics.</p>
        </div>
        <button 
          onClick={refreshHealth}
          disabled={loading}
          className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* API Server */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <Server size={20} />
              </div>
              <h3 className="font-semibold text-white">API Server</h3>
            </div>
            <StatusIcon status={metrics.api.status} />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Latency</span>
              <span className="text-sm font-medium text-slate-200">{metrics.api.latency} ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Uptime</span>
              <span className="text-sm font-medium text-slate-200">{metrics.api.uptime}</span>
            </div>
          </div>
        </div>

        {/* MongoDB */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Database size={20} />
              </div>
              <h3 className="font-semibold text-white">MongoDB</h3>
            </div>
            <StatusIcon status={metrics.mongodb.status} />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Latency</span>
              <span className="text-sm font-medium text-slate-200">{metrics.mongodb.latency} ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Database Size</span>
              <span className="text-sm font-medium text-slate-200">{metrics.mongodb.size}</span>
            </div>
          </div>
        </div>

        {/* Redis */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                <HardDrive size={20} />
              </div>
              <h3 className="font-semibold text-white">Redis Cache</h3>
            </div>
            <StatusIcon status={metrics.redis.status} />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Latency</span>
              <span className="text-sm font-medium text-slate-200">{metrics.redis.latency} ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Memory Used</span>
              <span className="text-sm font-medium text-slate-200">{metrics.redis.size}</span>
            </div>
          </div>
        </div>

        {/* Firebase Storage */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <Cloud size={20} />
              </div>
              <h3 className="font-semibold text-white">Firebase Storage</h3>
            </div>
            <StatusIcon status={metrics.storage.status} />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Used Storage</span>
              <span className="text-sm font-medium text-slate-200">{metrics.storage.used} / {metrics.storage.total}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '14.5%' }}></div>
            </div>
          </div>
        </div>

        {/* AI Control Center */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 ring-1 ring-amber-500/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                <Cpu size={20} />
              </div>
              <h3 className="font-semibold text-white">Gemini AI Engine</h3>
            </div>
            <StatusIcon status={metrics.ai.status} />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Latency (p95)</span>
              <span className="text-sm font-medium text-amber-400">{metrics.ai.latency} ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Errors (1hr)</span>
              <span className="text-sm font-medium text-amber-400">{metrics.ai.errors}</span>
            </div>
          </div>
        </div>

        {/* n8n Automation */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
                <Activity size={20} />
              </div>
              <h3 className="font-semibold text-white">n8n Automations</h3>
            </div>
            <StatusIcon status={metrics.n8n.status} />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Active Workflows</span>
              <span className="text-sm font-medium text-slate-200">{metrics.n8n.activeWorkflows}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Queue Size</span>
              <span className="text-sm font-medium text-slate-200">{metrics.n8n.queueSize}</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
