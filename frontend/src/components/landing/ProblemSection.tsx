import { Workflow, Layers, Clock, MessageSquare, Repeat, BookX, Bot, Check } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { Badge } from './Badge';

const problems = [
  {
    icon: Layers,
    title: 'Too many disconnected tools',
    problem: 'Your team lives in six apps that never talk to each other — tasks here, docs there, meetings everywhere.',
    solution: 'Everything lives in one unified workspace.',
  },
  {
    icon: Clock,
    title: 'Context switching kills focus',
    problem: 'Hunting for information across apps burns hours every single week.',
    solution: 'Unified search across all your work, instantly.',
  },
  {
    icon: MessageSquare,
    title: 'Poor communication',
    problem: 'Updates, decisions and feedback get buried in endless threads.',
    solution: 'Shared boards, live collaboration and real-time sync.',
  },
  {
    icon: Repeat,
    title: 'Manual, repetitive work',
    problem: 'Copy-pasting between tools and chasing statuses wastes your best people.',
    solution: 'Visual automation flows handle the busywork.',
  },
  {
    icon: BookX,
    title: 'Scattered documentation',
    problem: 'Knowledge dies in random docs nobody can find when it matters.',
    solution: 'A living knowledge base, owned by the whole team.',
  },
  {
    icon: Bot,
    title: 'A fragmented AI experience',
    problem: 'Generic AI has no idea what you’re working on, so its help stays shallow.',
    solution: 'TaMaD AI understands your entire workspace.',
  },
];

export function ProblemSection() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="The problem"
          title={<>Why great teams feel <span className="font-serif italic text-foreground-secondary">disconnected</span></>}
          subtitle="The modern stack looks powerful — until you count the tabs, the logins, and the work lost between them."
        />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {problems.map((problem, index) => (
            <Reveal key={problem.title} delay={(index % 3) * 0.07}>
              <div className="card group flex h-full flex-col p-6 hover:-translate-y-1 transition-transform duration-300">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-active text-foreground-secondary transition-colors duration-300 group-hover:bg-foreground group-hover:text-background">
                    <problem.icon size={21} />
                  </div>
                  <Badge className="hidden sm:inline-flex badge-neutral">Problem</Badge>
                </div>
                <h3 className="text-[15px] font-bold text-foreground">{problem.title}</h3>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-foreground-secondary">{problem.problem}</p>
                <div className="mt-5 flex items-start gap-2.5 rounded-lg bg-[var(--color-success-light)] p-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-[color:var(--color-foreground)]">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <p className="text-[12px] font-semibold leading-snug text-success">{problem.solution}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <div className="mx-auto mt-14 flex max-w-2xl items-center justify-center gap-3 rounded-full border border-border bg-surface px-6 py-3.5 text-center shadow-sm">
            <Workflow size={18} className="shrink-0 text-foreground-secondary" />
            <p className="text-sm font-medium text-foreground">
              That’s why TaMaD was built — <strong className="font-bold">one platform instead of a pile of apps.</strong>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
