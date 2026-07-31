import { MockAvatar, MockCard, MockPill, MockSidebar, MockTopbar, palette } from '../MockChrome';

const members = [
  { name: 'Alex Kim', role: 'Owner', initials: 'AK', color: palette.blue, online: true },
  { name: 'Mia Johnson', role: 'Admin', initials: 'MJ', color: palette.violet, online: true },
  { name: 'Sam Lee', role: 'Member', initials: 'SL', color: palette.emerald, online: false },
  { name: 'Ravi Patel', role: 'Member', initials: 'RK', color: palette.amber, online: true },
  { name: 'Dana Brooks', role: 'Viewer', initials: 'DB', color: palette.rose, online: false },
];

const activity = [
  { text: 'Mia completed 6 tasks', time: '12m', color: palette.emerald },
  { text: 'Sam moved "Kanban view" to Done', time: '48m', color: palette.blue },
  { text: 'Ravi commented on TAM-14', time: '1h', color: palette.amber },
];

export function TeamMock() {
  return (
    <div className="flex h-full">
      <MockSidebar active={0} items={['dashboard', 'tasks', 'team', 'calendar', 'notes']} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MockTopbar title="Launch Team" />
        <div className="flex h-full flex-1 gap-2.5 overflow-hidden p-3.5">
          <MockCard className="flex flex-1 flex-col p-3">
            <span className="mb-2.5 flex items-center justify-between text-[10px] font-bold text-slate-700">
              Members <span className="rounded bg-slate-100 px-1.5 text-[8px] font-bold text-slate-500">{members.length}</span>
            </span>
            <div className="space-y-1.5">
              {members.map((member) => (
                <div key={member.name} className="flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-slate-50">
                  <div className="relative">
                    <MockAvatar initials={member.initials} size={24} color={member.color} />
                    <span
                      className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-white"
                      style={{ background: member.online ? palette.emerald : '#cbd5e1' }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-[10px] font-semibold text-slate-700">{member.name}</span>
                    <span className="block text-[8px] text-slate-400">{member.role}</span>
                  </div>
                  <MockPill color={member.online ? palette.emerald : palette.slate}>{member.online ? 'Online' : 'Away'}</MockPill>
                </div>
              ))}
            </div>
          </MockCard>
          <div className="flex w-2/5 flex-col gap-2">
            <MockCard className="p-3">
              <span className="mb-2 block text-[10px] font-bold text-slate-700">Live activity</span>
              <div className="space-y-2">
                {activity.map((item) => (
                  <div key={item.text} className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full" style={{ background: item.color }} />
                    <div>
                      <p className="text-[9px] leading-snug text-slate-600">{item.text}</p>
                      <span className="text-[8px] text-slate-400">{item.time} ago</span>
                    </div>
                  </div>
                ))}
              </div>
            </MockCard>
            <MockCard className="flex items-center justify-between p-3">
              <span className="text-[10px] font-semibold text-slate-600">Weekly goal</span>
              <span className="text-[10px] font-bold text-emerald-600">82%</span>
            </MockCard>
          </div>
        </div>
      </div>
    </div>
  );
}
