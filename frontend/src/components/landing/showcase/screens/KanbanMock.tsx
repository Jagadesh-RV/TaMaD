import { MockAvatar, MockCard, MockPill, MockProgress, MockSidebar, MockTopbar, palette } from '../MockChrome';

const columns = [
  {
    title: 'To do',
    color: palette.slate,
    cards: [
      { title: 'Research competitor pricing', labels: ['research'], tag: palette.blue, avatar: 'AK', id: 'TAM-21' },
      { title: 'Write copy for hero', labels: ['content'], tag: palette.violet, avatar: 'MJ', id: 'TAM-19' },
    ],
  },
  {
    title: 'In progress',
    color: palette.blue,
    cards: [
      { title: 'Build kanban view', labels: ['frontend'], tag: palette.blue, avatar: 'SL', progress: 65, id: 'TAM-14' },
      { title: 'AI task suggestions', labels: ['ai'], tag: palette.violet, avatar: 'RK', progress: 30, id: 'TAM-11' },
      { title: 'Auth flow polish', labels: ['auth'], tag: palette.emerald, avatar: 'DB', id: 'TAM-08' },
    ],
  },
  {
    title: 'Done',
    color: palette.emerald,
    cards: [
      { title: 'Design tokens setup', labels: ['design'], tag: palette.amber, avatar: 'LP', id: 'TAM-05' },
      { title: 'API rate limiting', labels: ['backend'], tag: palette.emerald, avatar: 'NW', id: 'TAM-03' },
    ],
  },
];

export function KanbanMock() {
  return (
    <div className="flex h-full">
      <MockSidebar active={1} items={['dashboard', 'tasks', 'calendar', 'projects', 'notes']} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MockTopbar title="Product Launch — Board" />
        <div className="grid flex-1 grid-cols-3 gap-3 overflow-hidden p-3.5">
          {columns.map((column) => (
            <div key={column.title} className="flex flex-col rounded-xl bg-slate-100 p-2">
              <div className="mb-2 flex items-center gap-1.5 px-1">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: column.color }} />
                <span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{column.title}</span>
                <span className="ml-auto rounded bg-white px-1 text-[8px] font-bold text-slate-400">{column.cards.length}</span>
              </div>
              <div className="flex-1 space-y-2">
                {column.cards.map((card) => (
                  <MockCard key={card.id} className="space-y-2 p-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-semibold leading-tight text-slate-700">{card.title}</span>
                      <MockAvatar initials={card.avatar} size={16} color={palette.slate} />
                    </div>
                    <div className="flex items-center justify-between">
                      <MockPill color={card.tag}>{card.labels[0]}</MockPill>
                      <span className="text-[8px] text-slate-400">{card.id}</span>
                    </div>
                    {card.progress != null && (
                      <div className="flex items-center gap-1.5">
                        <MockProgress value={card.progress} color={column.color} />
                        <span className="text-[8px] font-bold text-slate-400">{card.progress}%</span>
                      </div>
                    )}
                  </MockCard>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
