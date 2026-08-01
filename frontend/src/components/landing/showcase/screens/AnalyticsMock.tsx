import { MockAvatar, MockCard, MockSidebar, MockTopbar, palette } from '../MockChrome';
import { MiniBarChart, MockLegend } from '../MockCharts';

export function AnalyticsMock() {
  return (
    <div className="flex h-full">
      <MockSidebar active={0} items={['dashboard', 'analytics', 'calendar', 'projects', 'notes']} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MockTopbar title="Analytics" />
        <div className="flex-1 space-y-3 overflow-hidden p-3.5">
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Tasks completed', value: '312', color: palette.blue },
              { label: 'Sprints delivered', value: '9', color: palette.emerald },
              { label: 'Avg. cycle time', value: '3.2d', color: palette.violet },
              { label: 'Team utilization', value: '87%', color: palette.amber },
            ].map((stat) => (
              <MockCard key={stat.label} className="p-3">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-lg font-extrabold tracking-tight text-slate-800">{stat.value}</span>
                  <span className="h-2 w-2 rounded-full" style={{ background: stat.color }} />
                </div>
              </MockCard>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-3">
            <MockCard className="col-span-3 p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-700">Throughput</span>
                <span className="text-[9px] font-semibold text-slate-400">Per week</span>
              </div>
              <MiniBarChart className="h-28" />
            </MockCard>
            <MockCard className="col-span-2 p-3.5">
              <span className="mb-2 block text-[10px] font-bold text-slate-700">Workload</span>
              <MockLegend
                items={[
                  { label: 'Engineering', color: palette.blue, value: '10' },
                  { label: 'Design', color: palette.violet, value: '6' },
                  { label: 'Product', color: palette.emerald, value: '4' },
                  { label: 'Marketing', color: palette.amber, value: '3' },
                ]}
              />
            </MockCard>
          </div>
          <MockCard className="flex items-center justify-between p-3">
            <span className="text-[10px] font-semibold text-slate-600">Sprint velocity trending up</span>
            <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">+24%</span>
          </MockCard>
        </div>
      </div>
    </div>
  );
}
