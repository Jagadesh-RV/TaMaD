import { MockPill, MockSidebar, MockTopbar, palette } from '../MockChrome';

const week = ['Mon 4', 'Tue 5', 'Wed 6', 'Thu 7', 'Fri 8', 'Sat 9', 'Sun 10'];

const events: Record<string, { title: string; color: string; span?: number }[]> = {
  'Mon 4': [{ title: 'Standup', color: palette.blue }, { title: 'Sprint review', color: palette.violet }],
  'Tue 5': [{ title: '1:1 with Mia', color: palette.emerald }],
  'Wed 6': [{ title: 'Design critique', color: palette.amber, span: 2 }],
  'Thu 7': [{ title: 'Deep work block', color: palette.cyan, span: 2 }],
  'Fri 8': [{ title: 'Demo day', color: palette.rose }],
  'Sat 9': [],
  'Sun 10': [{ title: 'Plan week', color: palette.slate }],
};

export function CalendarMock() {
  return (
    <div className="flex h-full">
      <MockSidebar active={2} items={['dashboard', 'tasks', 'calendar', 'projects', 'notes']} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MockTopbar title="Calendar — August" />
        <div className="flex flex-1 flex-col p-3.5">
          <div className="grid grid-cols-7 gap-1.5">
            {week.map((day, index) => (
              <div key={day} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-center py-1">
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${index === 4 ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                  >
                    {day}
                  </span>
                </div>
                {(events[day] ?? []).map((event, eIndex) => (
                  <div
                    key={event.title}
                    className="rounded-md px-1.5 py-1 text-[8px] font-semibold text-white"
                    style={{
                      background: event.color,
                      minHeight: event.span ? 26 : 16,
                    }}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: palette.blue }} />
              <span className="text-[9px] font-semibold text-slate-600">3 meetings today</span>
            </div>
            <MockPill color={palette.violet}>+ Schedule</MockPill>
          </div>
        </div>
      </div>
    </div>
  );
}
