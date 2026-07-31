import { MockAvatar, MockBar, MockCard, MockPill, MockSidebar, MockTopbar, palette } from '../MockChrome';

const documents = [
  { title: 'Product Requirements', tag: 'PRD', color: palette.blue, words: '2.4k words', avatars: ['AK', 'MJ'] },
  { title: 'Sprint Retro Notes', tag: 'Notes', color: palette.violet, words: '840 words', avatars: ['SL', 'RK', 'DB'] },
  { title: 'Engineering Handbook', tag: 'Wiki', color: palette.emerald, words: '12k words', avatars: ['NW'] },
  { title: 'Onboarding Guide', tag: 'Guide', color: palette.amber, words: '3.1k words', avatars: ['LP', 'AK'] },
];

export function DocumentsMock() {
  return (
    <div className="flex h-full">
      <MockSidebar active={4} items={['dashboard', 'tasks', 'documents', 'calendar', 'notes']} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MockTopbar title="Documents & Knowledge" />
        <div className="flex-1 space-y-3 overflow-hidden p-3.5">
          <div className="grid grid-cols-2 gap-3">
            {documents.map((doc) => (
              <MockCard key={doc.title} className="p-3">
                <div className="mb-2 flex items-start justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${doc.color}1a` }}>
                    <span className="text-[9px] font-extrabold" style={{ color: doc.color }}>{doc.tag.slice(0, 2)}</span>
                  </span>
                  <MockPill color={doc.color}>{doc.tag}</MockPill>
                </div>
                <span className="block text-[11px] font-bold text-slate-800">{doc.title}</span>
                <span className="mt-0.5 block text-[8px] text-slate-400">{doc.words}</span>
                <div className="mt-2.5 space-y-1.5">
                  <MockBar width="100%" height={5} color="#eef2f7" />
                  <MockBar width="80%" height={5} color="#eef2f7" />
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <div className="flex -space-x-1.5">
                    {doc.avatars.map((avatar) => (
                      <MockAvatar key={avatar} initials={avatar} size={18} color={palette.slate} />
                    ))}
                  </div>
                  <span className="text-[8px] font-semibold text-slate-400">Updated today</span>
                </div>
              </MockCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
