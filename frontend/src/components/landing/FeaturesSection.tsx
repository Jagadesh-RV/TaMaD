import {
  CheckSquare, Calendar, StickyNote, Target, Repeat, Timer, LayoutDashboard,
  Users, FolderKanban, Rocket, Bug, Video, PenTool, Sparkles, Workflow,
  BookOpen, FileText, Files, BarChart3, Bell, ArrowUpRight, type LucideIcon,
} from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';

interface Module {
  icon: LucideIcon;
  title: string;
  text: string;
}

const groups: { label: string; blurb: string; modules: Module[] }[] = [
  {
    label: 'Work your way',
    blurb: 'A personal command center that adapts to how you think.',
    modules: [
      { icon: LayoutDashboard, title: 'Personal Workspace', text: 'Your default home — boards, lists and views tuned for you.' },
      { icon: CheckSquare, title: 'Tasks', text: 'Capture, prioritize and complete tasks with rich context.' },
      { icon: Calendar, title: 'Calendar', text: 'Schedule, deadlines and events in one intelligent timeline.' },
      { icon: StickyNote, title: 'Notes', text: 'Fast, focused writing that auto-saves and connects to your work.' },
      { icon: Target, title: 'Goals', text: 'Break ambitions into measurable, trackable milestones.' },
      { icon: Repeat, title: 'Habits', text: 'Build routines that compound into real progress.' },
      { icon: Timer, title: 'Focus Timer', text: 'Deep-work sessions that protect your most valuable hours.' },
    ],
  },
  {
    label: 'Move as one',
    blurb: 'Collaboration without the chaos of a dozen threads.',
    modules: [
      { icon: Users, title: 'Team Workspace', text: 'Organizations, members, roles and permissions done right.' },
      { icon: FolderKanban, title: 'Projects', text: 'Portfolios, milestones and progress for every initiative.' },
      { icon: Rocket, title: 'Sprints', text: 'Plan, estimate and deliver in predictable iterations.' },
      { icon: Bug, title: 'Issues', text: 'Track bugs and blockers with full context attached.' },
      { icon: Video, title: 'Meetings', text: 'Video calls with live transcripts and automatic action items.' },
      { icon: PenTool, title: 'Whiteboards', text: 'Sketch and decide together on a shared canvas.' },
    ],
  },
  {
    label: 'Built-in power',
    blurb: 'The platform layer every tool forgets to give you.',
    modules: [
      { icon: Sparkles, title: 'AI Assistant', text: 'Summaries, drafts and suggestions grounded in your workspace.' },
      { icon: Workflow, title: 'Automation', text: 'Visual flows plus n8n integration for infinite reach.' },
      { icon: BookOpen, title: 'Knowledge Base', text: 'A living wiki your team actually keeps updated.' },
      { icon: FileText, title: 'Documents', text: 'Beautiful docs that never get lost.' },
      { icon: Files, title: 'Files', text: 'Every asset shared, versioned and searchable.' },
      { icon: BarChart3, title: 'Analytics', text: 'Reports on velocity, workload and productivity.' },
      { icon: Bell, title: 'Notifications', text: 'Signal over noise — know only what needs you.' },
    ],
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Capabilities"
          title={<>Twenty modules. <span className="font-serif italic text-foreground-secondary">Zero sprawl.</span></>}
          subtitle="Every module is built to work together — your notes surface in tasks, your meetings create action items, your AI knows the whole picture."
        />

        <div className="space-y-16">
          {groups.map((group) => (
            <div key={group.label}>
              <Reveal>
                <div className="mb-7 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h3 className="text-lg font-extrabold tracking-tight text-foreground">{group.label}</h3>
                  <span className="h-1 w-1 self-center rounded-full bg-border" aria-hidden="true" />
                  <p className="text-sm text-foreground-secondary">{group.blurb}</p>
                </div>
              </Reveal>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {group.modules.map((module, index) => (
                  <Reveal key={module.title} delay={(index % 4) * 0.06}>
                    <div className="card group relative h-full overflow-hidden p-5 hover:-translate-y-1 transition-transform duration-300">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-active text-foreground transition-all duration-300 group-hover:bg-foreground group-hover:text-background">
                          <module.icon size={19} />
                        </div>
                        <ArrowUpRight size={15} className="text-border opacity-0 transition-all duration-300 group-hover:opacity-100" />
                      </div>
                      <h4 className="text-sm font-bold text-foreground">{module.title}</h4>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-foreground-secondary">{module.text}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
