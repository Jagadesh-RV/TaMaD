import { MockSidebar, MockTopbar } from '../MockChrome';

export function WhiteboardMock() {
  return (
    <div className="flex h-full">
      <MockSidebar active={4} items={['dashboard', 'tasks', 'calendar', 'notes', 'whiteboard']} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MockTopbar title="Whiteboard — Product Flow" />
        <div className="relative flex-1 overflow-hidden bg-white">
          <div
            className="absolute inset-0 opacity-[0.55]"
            style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '18px 18px' }}
          />
          <div className="absolute left-6 top-6 flex h-14 w-24 flex-col justify-center rounded-lg border border-blue-200 bg-blue-50 px-2">
            <span className="text-[8px] font-bold text-blue-700">IDEA</span>
            <span className="text-[7px] text-blue-400">Product vision</span>
          </div>
          <div className="absolute left-[40%] top-16 flex h-14 w-28 flex-col justify-center rounded-lg border border-violet-200 bg-violet-50 px-2">
            <span className="text-[8px] font-bold text-violet-700">PLAN</span>
            <span className="text-[7px] text-violet-400">Sprint roadmap</span>
          </div>
          <div className="absolute right-8 top-8 flex h-16 w-28 flex-col justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-2">
            <span className="text-[8px] font-bold text-emerald-700">SHIP</span>
            <span className="text-[7px] text-emerald-400">Release checklist</span>
          </div>
          <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
            <path d="M120 46 C 180 30, 200 40, 230 66" stroke="#93c5fd" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
            <path d="M240 66 C 270 90, 290 90, 330 78" stroke="#c4b5fd" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
            <path d="M120 46 C 160 20, 260 26, 330 78" stroke="#a7f3d0" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
          </svg>
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
            <span className="h-3 w-3 rounded-sm bg-blue-600" />
            <span className="h-3 w-3 rounded-full border-2 border-slate-300" />
            <span className="h-3 w-3 rotate-45 border border-slate-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="ml-2 text-[8px] font-semibold text-slate-400">4 collaborators live</span>
          </div>
        </div>
      </div>
    </div>
  );
}
