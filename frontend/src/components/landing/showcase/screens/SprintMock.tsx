import { MockAvatar, MockCard, MockPill, MockProgress, MockSidebar, MockTopbar, palette } from '../MockChrome';

const sprint = [
  { name: 'Unassigned backlog', color: palette.slate, count: 12, items: ['Map data model', 'Wireframe mobile flows'] },
  { name: 'Sprint 12', color: palette.blue, count: 18, items: ['Build analytics views', 'Ship AI summaries', 'Migrate notes engine'], active: true },
  { name: 'Completed', color: palette.emerald, count: 32, items: ['Set up CI/CD', 'Auth hardening', 'Design system v2'] },
];

export function SprintMock() {
  return (
    <div className="flex h-full">
      <MockSidebar active={3} items={['dashboard', 'tasks', 'calendar', 'projects', 'notes']} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MockTopbar title="Sprint Planning — Q3" />
        <div className="grid flex-1 grid-cols-3 gap-3 overflow-hidden p-3.5">
          {sprint.map((column) => (
            <div key={column.name} className="flex flex-col rounded-xl border border-slate-200 bg-white p-2.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-slate-600">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: column.color }} />
                  {column.name}
                </span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[8px] font-bold text-slate-500">{column.count}</span>
              </div>
              <div className="flex-1 space-y-2">
                {column.items.map((item) => (
                  <MockCard key={item} className="space-y-2 p-2.5">
                    <span className="block text-[10px] font-semibold text-slate-700">{item}</span>
                    <div className="flex items-center justify-between">
                      <MockAvatar initials={item.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()} size={16} color={column.color} />
                      <span className="text-[8px] font-bold text-slate-400">8 pts</span>
                    </div>
                  </MockCard>
                ))}
              </div>
              {column.active && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-blue-50 p-2">
                  <MockProgress value={61} color={palette.blue} />
                  <span className="text-[8px] font-bold text-blue-600">61%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
