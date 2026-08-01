import { MockAvatar, MockCard, MockPill, MockProgress, MockSidebar, MockTopbar, palette } from '../MockChrome';

const projects = [
  { name: 'TaMaD Website', tagline: 'Marketing site redesign', progress: 72, color: palette.blue, members: ['AK', 'MJ', 'SL'], tasks: '38 tasks' },
  { name: 'Mobile App', tagline: 'iOS + Android', progress: 46, color: palette.violet, members: ['RK', 'DB'], tasks: '52 tasks' },
  { name: 'Automation Hub', tagline: 'n8n workflows', progress: 88, color: palette.emerald, members: ['LP', 'NW'], tasks: '21 tasks' },
  { name: 'Team Meet', tagline: 'Video infrastructure', progress: 31, color: palette.amber, members: ['SL', 'MJ'], tasks: '29 tasks' },
];

export function ProjectsMock() {
  return (
    <div className="flex h-full">
      <MockSidebar active={3} items={['dashboard', 'tasks', 'calendar', 'projects', 'notes']} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MockTopbar title="Projects" />
        <div className="flex-1 overflow-hidden p-3.5">
          <div className="grid grid-cols-2 gap-3">
            {projects.map((project) => (
              <MockCard key={project.name} className="flex flex-col p-3.5">
                <div className="mb-2 flex items-start justify-between">
                  <span className="text-[11px] font-bold text-slate-800">{project.name}</span>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: project.color }} />
                </div>
                <span className="text-[9px] text-slate-400">{project.tagline}</span>
                <div className="mb-1.5 mt-3 flex items-center justify-between text-[9px]">
                  <span className="font-semibold text-slate-500">{project.tasks}</span>
                  <span className="font-bold text-slate-700">{project.progress}%</span>
                </div>
                <MockProgress value={project.progress} color={project.color} />
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex -space-x-1.5">
                    {project.members.map((member) => (
                      <MockAvatar key={member} initials={member} size={18} color={palette.slate} />
                    ))}
                  </div>
                  <MockPill color={project.color}>Open</MockPill>
                </div>
              </MockCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
