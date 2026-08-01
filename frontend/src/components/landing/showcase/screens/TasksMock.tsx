import { MockAvatar, MockCard, MockCheckbox, MockPill, MockSidebar, MockTopbar, palette } from '../MockChrome';

const rows = [
  { title: 'Finalize onboarding flow', priority: 'High', color: palette.rose, due: 'Today', avatar: 'AK', checked: false },
  { title: 'Write API documentation', priority: 'Medium', color: palette.amber, due: 'Tomorrow', avatar: 'MJ', checked: true },
  { title: 'Fix calendar timezone bug', priority: 'High', color: palette.rose, due: 'Today', avatar: 'SL', checked: false },
  { title: 'Design empty states', priority: 'Low', color: palette.slate, due: 'Aug 12', avatar: 'RK', checked: true },
  { title: 'AI meeting summaries', priority: 'Urgent', color: palette.violet, due: 'Today', avatar: 'DB', checked: false },
  { title: 'Update sprint backlog', priority: 'Medium', color: palette.amber, due: 'Aug 14', avatar: 'LP', checked: false },
];

export function TasksMock() {
  return (
    <div className="flex h-full">
      <MockSidebar active={1} items={['dashboard', 'tasks', 'calendar', 'projects', 'notes']} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MockTopbar title="Tasks" />
        <div className="flex-1 space-y-2 overflow-hidden p-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5">
              <svg viewBox="0 0 16 16" className="h-3 w-3 text-slate-400" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <span className="text-[10px] text-slate-400">Search tasks…</span>
            </div>
            <div className="flex h-7 items-center rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] font-semibold text-slate-600">
              + Add task
            </div>
          </div>
          <div className="space-y-1.5 pt-1">
            {rows.map((row) => (
              <MockCard key={row.title} className="flex items-center gap-2.5 px-3 py-2">
                <MockCheckbox checked={row.checked} color={row.color} />
                <span className="flex-1 truncate text-[10px] font-medium text-slate-700">{row.title}</span>
                <MockPill color={row.color}>{row.priority}</MockPill>
                <span className="text-[9px] font-semibold text-slate-400">{row.due}</span>
                <MockAvatar initials={row.avatar} size={18} color={palette.slate} />
              </MockCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
