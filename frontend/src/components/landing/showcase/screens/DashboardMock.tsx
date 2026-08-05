import { MockAvatar, MockCard, MockCheckbox, MockPill, MockSidebar, MockTopbar, palette } from '../MockChrome';
import { MiniAreaChart, MockLegend, MockStatCard } from '../MockCharts';

const tasks = [
  { title: 'Ship landing page redesign', status: 'In Progress', color: palette.blue, checked: false, avatar: 'AK' },
  { title: 'Q3 roadmap review', status: 'Done', color: palette.emerald, checked: true, avatar: 'MJ' },
  { title: 'Prepare sprint demo', status: 'In Progress', color: palette.amber, checked: false, avatar: 'SL' },
  { title: 'Sync with design team', status: 'Done', color: palette.slate, checked: true, avatar: 'RK' },
];

export function DashboardMock() {
  return (
    <div className="flex h-full">
      <MockSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MockTopbar title="Good morning, Alex" />
        <div className="flex-1 space-y-3 overflow-hidden p-3.5">
          <div className="grid grid-cols-3 gap-3">
            <MockStatCard label="Tasks done" value="24" delta="+18%" />
            <MockStatCard label="Focus time" value="6h 42m" delta="+9%" accent={palette.violet} />
            <MockStatCard label="Sprint velocity" value="48" delta="-3%" up={false} accent={palette.rose} />
          </div>
          <div className="grid grid-cols-5 gap-3">
            <MockCard className="col-span-3 p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-700">Productivity</span>
                <span className="text-[9px] font-semibold text-slate-400">Last 12 weeks</span>
              </div>
              <MiniAreaChart className="h-24" />
            </MockCard>
            <MockCard className="col-span-2 p-3.5">
              <span className="mb-2 block text-[10px] font-bold text-slate-700">By project</span>
              <MockLegend
                items={[
                  { label: 'Design system', color: palette.blue, value: '42%' },
                  { label: 'Mobile app', color: palette.emerald, value: '26%' },
                  { label: 'Automation', color: palette.amber, value: '14%' },
                ]}
              />
            </MockCard>
          </div>
          <MockCard className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2.5">
              <span className="text-[10px] font-bold text-slate-700">Today&apos;s focus</span>
              <span className="text-[9px] font-bold text-blue-600">View all →</span>
            </div>
            <div className="space-y-1 px-3.5 py-2.5">
              {tasks.map((task) => (
                <div key={task.title} className="flex items-center gap-2.5 rounded-lg py-1">
                  <MockCheckbox checked={task.checked} color={task.color} />
                  <span className="flex-1 truncate text-[10px] font-medium text-slate-600">{task.title}</span>
                  <MockPill color={task.color}>{task.status}</MockPill>
                  <MockAvatar initials={task.avatar} size={18} color={palette.slate} />
                </div>
              ))}
            </div>
          </MockCard>
        </div>
      </div>
    </div>
  );
}
