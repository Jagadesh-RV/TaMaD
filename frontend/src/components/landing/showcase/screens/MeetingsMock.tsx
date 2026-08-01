import { MockPill, MockSidebar, MockTopbar, palette } from '../MockChrome';

const tiles = [
  { color: '#1d3a8a', label: 'Standup' },
  { color: '#0e7490', label: 'Sprint Review' },
  { color: '#5b21b6', label: 'Design Sync' },
  { color: '#065f46', label: 'Planning' },
  { color: '#1e40af', label: '1:1' },
  { color: '#9a3412', label: 'Retro' },
];

export function MeetingsMock() {
  return (
    <div className="flex h-full">
      <MockSidebar active={0} items={['dashboard', 'tasks', 'meetings', 'calendar', 'notes']} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MockTopbar title="TaMaD Meet" />
        <div className="flex flex-1 flex-col gap-2.5 overflow-hidden p-3.5">
          <div className="grid grid-cols-3 gap-2">
            {tiles.map((tile) => (
              <div key={tile.label} className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg" style={{ background: tile.color }}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent_60%)]" />
                <div className="absolute bottom-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-[8px] font-bold text-slate-700">
                  {tile.label.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                </div>
                <span className="text-[8px] font-semibold text-white/70">{tile.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-[10px] font-bold text-white">▶</span>
              <span className="text-[10px] font-bold text-slate-700">Start instant meeting</span>
            </div>
            <MockPill color={palette.emerald}>Live AI transcript</MockPill>
          </div>
        </div>
      </div>
    </div>
  );
}
