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
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              align="left"
              eyebrow="TaMaD AI"
              title={<>AI that knows <span className="font-serif italic text-foreground-secondary">your whole workspace</span></>}
              subtitle="Generic chatbots answer with a search engine's memory. TaMaD AI answers with yours — your projects, meetings, docs and goals — grounded in real data."
              className="mb-10 md:mb-12"
            />

            <div className="space-y-5">
              {capabilities.map((cap, index) => (
                <Reveal key={cap.title} delay={index * 0.07}>
                  <div className="card group flex gap-4 p-4 hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-active text-foreground-secondary transition-colors group-hover:bg-foreground group-hover:text-background">
                      <cap.icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-foreground">{cap.title}</h3>
                      <p className="mt-1 text-[13.5px] leading-relaxed text-foreground-secondary">{cap.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={0.15}>
            <div className="relative mx-auto w-full max-w-md">
              <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-sm">
                <div className="flex items-center gap-3 border-b border-border-light px-5 py-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background">
                    <Sparkles size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">TaMaD AI</p>
                    <p className="flex items-center gap-1.5 text-[11px] text-foreground-tertiary">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                      Grounded in your workspace
                    </p>
                  </div>
                  <Wand2 size={16} className="text-foreground-tertiary" />
                </div>

                <div className="space-y-4 p-5">
                  <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-foreground px-4 py-2.5 text-[13px] font-medium text-background shadow-sm">
                    What&apos;s blocking the launch sprint?
                  </div>

                  <div className="w-fit max-w-[92%] rounded-2xl rounded-bl-md border border-border bg-background-secondary px-4 py-3 text-[13px] leading-relaxed text-foreground-secondary">
                    <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-foreground">
                      <Sparkles size={12} /> Answer
                    </p>
                    Two tasks are at risk:
                    <span className="mt-2 flex flex-col gap-1.5">
                      <span className="rounded-lg border border-[var(--color-danger-light)] bg-[var(--color-danger-light)] px-2.5 py-1.5 text-[12px] text-danger">Payment API integration — due in 2 days, 6h of work left</span>
                      <span className="rounded-lg border border-[var(--color-warning-light)] bg-[var(--color-warning-light)] px-2.5 py-1.5 text-[12px] text-warning">Onboarding copy — awaiting review since Monday</span>
                    </span>
                    <p className="mt-2 text-foreground">I&apos;ve drafted an updated sprint plan that rebalances both before the launch date.</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full border border-border px-3 py-1 text-[11px] font-medium text-foreground-secondary">Show me</span>
                    {suggestions.map((s) => (
                      <span
                        key={s}
                        className="hidden rounded-full border border-border bg-surface-active px-3 py-1 text-[11px] font-medium text-foreground sm:inline-flex"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-border-light px-5 py-4">
                  <div className="flex-1 rounded-full border border-border bg-surface px-4 py-2 text-[12px] text-foreground-tertiary">
                    Ask TaMaD about your work…
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background">
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
