import { Sparkles, FileText, CalendarClock, ListChecks, Wand2, Send } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { Badge } from './Badge';

const capabilities = [
  {
    icon: FileText,
    title: 'Summarize anything',
    text: 'Docs, meetings, long threads — compressed into the signal, not the noise.',
  },
  {
    icon: CalendarClock,
    title: 'Plan with context',
    text: 'It drafts your week from actual deadlines, meetings and priorities — not a generic prompt.',
  },
  {
    icon: ListChecks,
    title: 'Generate action items',
    text: 'Every meeting transcript becomes a set of tasks, assigned and ready.',
  },
];

const suggestions = [
  'Summarize this sprint for the team',
  'Draft a project update',
  'Turn my meeting notes into tasks',
];

export function AISection() {
  return (
    <section id="ai" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/[0.07] blur-[150px] dark:bg-brand-500/[0.12]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              align="left"
              eyebrow="TaMaD AI"
              title={<>AI that knows <span className="font-serif italic text-brand-600 dark:text-brand-300">your whole workspace</span></>}
              subtitle="Generic chatbots answer with a search engine's memory. TaMaD AI answers with yours — your projects, meetings, docs and goals — grounded in real data."
              className="mb-10 md:mb-12"
            />

            <div className="space-y-5">
              {capabilities.map((cap, index) => (
                <Reveal key={cap.title} delay={index * 0.07}>
                  <div className="group flex gap-4 rounded-2xl border border-transparent p-3 transition-all duration-300 hover:border-navy-900/[0.07] hover:bg-white/70 hover:shadow-sm dark:hover:border-white/[0.08] dark:hover:bg-white/[0.04]">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-500/[0.08] text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-400/10 dark:text-brand-300">
                      <cap.icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-navy-900 dark:text-white">{cap.title}</h3>
                      <p className="mt-1 text-[13.5px] leading-relaxed text-slate-500 dark:text-slate-400">{cap.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={0.15}>
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-brand-500/20 via-violet-500/10 to-transparent blur-2xl" aria-hidden="true" />

              <div className="relative overflow-hidden rounded-[1.75rem] border border-navy-900/10 bg-white shadow-[0_40px_90px_-40px_rgba(15,23,42,0.4)] dark:border-white/10 dark:bg-slate-900">
                <div className="flex items-center gap-3 border-b border-navy-900/[0.06] px-5 py-4 dark:border-white/[0.08]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-500 text-white">
                    <Sparkles size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-navy-900 dark:text-white">TaMaD AI</p>
                    <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Grounded in your workspace
                    </p>
                  </div>
                  <Wand2 size={16} className="text-slate-300 dark:text-slate-600" />
                </div>

                <div className="space-y-4 p-5">
                  <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-brand-600 px-4 py-2.5 text-[13px] font-medium text-white shadow-sm">
                    What's blocking the launch sprint?
                  </div>

                  <div className="w-fit max-w-[92%] rounded-2xl rounded-bl-md border border-navy-900/[0.06] bg-slate-50 px-4 py-3 text-[13px] leading-relaxed text-slate-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300">
                    <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">
                      <Sparkles size={12} /> Answer
                    </p>
                    Two tasks are at risk:
                    <span className="mt-2 flex flex-col gap-1.5">
                      <span className="rounded-lg border border-rose-500/20 bg-rose-500/[0.07] px-2.5 py-1.5 text-[12px]">Payment API integration — due in 2 days, 6h of work left</span>
                      <span className="rounded-lg border border-amber-500/20 bg-amber-500/[0.07] px-2.5 py-1.5 text-[12px]">Onboarding copy — awaiting review since Monday</span>
                    </span>
                    <p className="mt-2">I've drafted an updated sprint plan that rebalances both before the launch date.</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full border border-navy-900/[0.08] px-3 py-1 text-[11px] font-medium text-slate-500 dark:border-white/10 dark:text-slate-400">Show me</span>
                    {suggestions.map((s) => (
                      <span
                        key={s}
                        className="hidden rounded-full border border-brand-500/25 bg-brand-500/[0.06] px-3 py-1 text-[11px] font-medium text-brand-600 sm:inline-flex dark:text-brand-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-navy-900/[0.06] px-5 py-4 dark:border-white/[0.08]">
                  <div className="flex-1 rounded-full border border-navy-900/10 bg-slate-50 px-4 py-2 text-[12px] text-slate-400 dark:border-white/10 dark:bg-white/[0.05]">
                    Ask TaMaD about your work…
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white shadow-md shadow-brand-600/30">
                    <Send size={15} />
                  </div>
                </div>
              </div>

              <Badge className="absolute -right-3 -top-3 rotate-3 shadow-lg">
                <Sparkles size={12} /> Native AI
              </Badge>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
