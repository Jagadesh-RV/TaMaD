import { MockAvatar, MockCard, MockPill, MockSidebar, MockTopbar, palette } from '../MockChrome';

const files = [
  { name: 'brand-assets.zip', type: 'Archive', size: '48 MB', color: palette.amber, avatar: 'AK' },
  { name: 'roadmap-v2.pdf', type: 'PDF', size: '2.1 MB', color: palette.rose, avatar: 'MJ' },
  { name: 'sprint-demo.mov', type: 'Video', size: '212 MB', color: palette.violet, avatar: 'SL' },
  { name: 'design-system.sketch', type: 'Design', size: '18 MB', color: palette.blue, avatar: 'RK' },
  { name: 'data-export.csv', type: 'Sheet', size: '860 KB', color: palette.emerald, avatar: 'DB' },
];

export function FilesMock() {
  return (
    <div className="flex h-full">
      <MockSidebar active={4} items={['dashboard', 'tasks', 'files', 'calendar', 'notes']} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MockTopbar title="Files" />
        <div className="flex-1 overflow-hidden p-3.5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5">
              <svg viewBox="0 0 16 16" className="h-3 w-3 text-slate-400" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <span className="text-[10px] text-slate-400">Search files…</span>
            </div>
            <div className="flex h-7 items-center rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] font-semibold text-slate-600">
              Upload
            </div>
          </div>
          <div className="space-y-1.5">
            {files.map((file) => (
              <MockCard key={file.name} className="flex items-center gap-2.5 px-3 py-2.5">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[9px] font-extrabold text-white"
                  style={{ background: file.color }}
                >
                  {file.type.slice(0, 2).toUpperCase()}
                </span>
                <span className="flex-1 truncate text-[10px] font-semibold text-slate-700">{file.name}</span>
                <span className="text-[9px] text-slate-400">{file.size}</span>
                <MockAvatar initials={file.avatar} size={18} color={palette.slate} />
              </MockCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
