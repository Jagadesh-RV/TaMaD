
import { useEffect, useState } from 'react';

function ReportsPage() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const mockReports = [
      {
        id: 1,
        title: 'Weekly Productivity',
        status: 'Completed',
        createdAt: '2026-06-01'
      },
      {
        id: 2,
        title: 'Task Performance',
        status: 'Pending',
        createdAt: '2026-06-03'
      }
    ];

    setReports(mockReports);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Reports</h1>
          <p className="text-slate-400 mt-2 max-w-xl">A curated overview of your latest progress and activity trends, presented in a sleek, card-driven dashboard.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
          <div className="card p-4 bg-slate-900/80 border border-white/10">
            <div className="text-xs uppercase text-slate-500">Latest</div>
            <div className="text-2xl font-semibold text-white">{reports[0]?.title || '—'}</div>
          </div>
          <div className="card p-4 bg-slate-900/80 border border-white/10">
            <div className="text-xs uppercase text-slate-500">Status</div>
            <div className="text-2xl font-semibold text-brand-300">{reports[0]?.status || 'Pending'}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {reports.map((report) => (
          <div
            key={report.id}
            className="card p-6 bg-slate-950/90 border border-white/10 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">{report.title}</h2>
                <p className="text-sm text-slate-500 mt-1">Created {report.createdAt}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${report.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
                {report.status}
              </span>
            </div>
            <div className="mt-5 text-slate-300">This report helps you review productivity patterns, spot bottlenecks, and plan the next high-value sprint.</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReportsPage;