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
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/[0.05] blur-[140px] dark:bg-brand-600/10" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="The problem"
          title={<>Why great teams feel <span className="font-serif italic text-brand-600 dark:text-brand-300">disconnected</span></>}
          subtitle="The modern stack looks powerful — until you count the tabs, the logins, and the work lost between them."
        />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {problems.map((problem, index) => (
            <Reveal key={problem.title} delay={(index % 3) * 0.07}>
              <div className="group flex h-full flex-col rounded-3xl border border-navy-900/[0.07] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(15,23,42,0.25)] dark:border-white/[0.07] dark:bg-white/[0.03]">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-colors duration-300 group-hover:bg-rose-50 group-hover:text-rose-500 dark:bg-white/5 dark:text-slate-400">
                    <problem.icon size={21} />
                  </div>
                  <Badge tone="neutral" className="hidden sm:inline-flex">Problem</Badge>
                </div>
                <h3 className="text-[15px] font-bold text-navy-900 dark:text-white">{problem.title}</h3>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">{problem.problem}</p>
                <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-emerald-500/[0.07] p-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <p className="text-[12px] font-semibold leading-snug text-emerald-700 dark:text-emerald-300">{problem.solution}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <div className="mx-auto mt-14 flex max-w-2xl items-center justify-center gap-3 rounded-full border border-brand-500/20 bg-white/70 px-6 py-3.5 text-center shadow-sm backdrop-blur-md dark:border-brand-400/20 dark:bg-white/[0.04]">
            <Workflow size={18} className="shrink-0 text-brand-600 dark:text-brand-300" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              That’s why TaMaD was built — <strong className="font-bold">one platform instead of a pile of apps.</strong>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
