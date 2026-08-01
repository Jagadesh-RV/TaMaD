import { MockAvatar, MockBar, MockCard, MockPill, MockSidebar, MockTopbar, palette } from '../MockChrome';

const docs = [
  { title: 'Q3 Strategy', updated: '2h ago', color: palette.blue },
  { title: 'Product Requirements', updated: 'Yesterday', color: palette.violet },
  { title: 'Meeting Notes', updated: '3d ago', color: palette.emerald },
];

export function NotesMock() {
  return (
    <div className="flex h-full">
      <MockSidebar active={4} items={['dashboard', 'tasks', 'calendar', 'notes', 'ai']} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MockTopbar title="Notes" />
        <div className="flex h-full flex-1 gap-2.5 overflow-hidden p-3.5">
          <div className="flex w-2/5 flex-col gap-2">
            {docs.map((doc) => (
              <MockCard key={doc.title} className="space-y-1.5 p-2.5">
                <span className="block text-[10px] font-bold text-slate-700">{doc.title}</span>
                <span className="block text-[8px] text-slate-400">{doc.updated}</span>
                <MockBar width="90%" height={5} color="#eef2f7" />
                <MockBar width="70%" height={5} color="#eef2f7" />
              </MockCard>
            ))}
          </div>
          <MockCard className="flex flex-1 flex-col p-3.5">
            <span className="text-[12px] font-extrabold tracking-tight text-slate-800">Q3 Strategy</span>
            <span className="mt-0.5 text-[8px] text-slate-400">Last edited by Mia · 2h ago</span>
            <div className="mt-3 space-y-2">
              <MockBar width="100%" height={7} color="#e2e8f0" />
              <MockBar width="92%" height={7} color="#e2e8f0" />
              <MockBar width="98%" height={7} color="#e2e8f0" />
              <MockBar width="60%" height={7} color="#e2e8f0" />
            </div>
            <div className="mt-3 rounded-lg border-l-2 border-blue-400 bg-blue-50/70 p-2">
              <MockBar width="55%" height={7} color="#bfdbfe" />
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
              <div className="flex -space-x-1">
                <MockAvatar color={palette.blue} size={18} />
                <MockAvatar color={palette.violet} size={18} />
              </div>
              <MockPill color={palette.emerald}>Auto-saved</MockPill>
            </div>
          </MockCard>
        </div>
      </div>
    </div>
  );
}
