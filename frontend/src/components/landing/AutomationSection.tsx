import { Zap, Workflow, GitBranch, MousePointerClick, ArrowDown, Puzzle } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { Badge } from './Badge';

const flows = [
  {
    id: 'f1',
    trigger: 'New task assigned',
    condition: 'Priority = High',
    action: 'Notify owner + log to sprint',
  },
  {
    id: 'f2',
    trigger: 'Meeting ends',
    condition: 'Transcript ready',
    action: 'Create action items + update roadmap',
  },
  {
    id: 'f3',
    trigger: 'File version bumped',
    condition: 'Document updated',
    action: 'Share with stakeholders',
  },
];

function FlowNode({ kind, title }: { kind: 'trigger' | 'condition' | 'action'; title: string }) {
  const styles = {
    trigger: 'border-brand-500/30 bg-brand-500/[0.07] text-brand-700 dark:text-brand-300',
    condition: 'border-amber-500/30 bg-amber-500/[0.07] text-amber-700 dark:text-amber-300',
    action: 'border-emerald-500/30 bg-emerald-500/[0.07] text-emerald-700 dark:text-emerald-300',
  }[kind];
  const dot = {
    trigger: 'bg-brand-500',
    condition: 'bg-amber-500',
    action: 'bg-emerald-500',
  }[kind];
  const label = { trigger: 'When', condition: 'If', action: 'Then' }[kind];

  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm backdrop-blur-sm ${styles}`}>
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${dot} text-[10px] font-bold text-white`}>
        {kind === 'trigger' ? 'W' : kind === 'condition' ? '?' : '→'}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</span>
      <span className="truncate text-[13px] font-semibold">{title}</span>
    </div>
  );
}

export function AutomationSection() {
  return (
    <section id="automation" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal delay={0.1}>
            <div className="order-2 lg:order-1">
              <div className="relative mx-auto w-full max-w-md space-y-3">
                <div className="absolute -inset-5 rounded-[2rem] bg-violet-500/[0.08] blur-2xl" aria-hidden="true" />

                <div className="relative rounded-2xl border border-navy-900/[0.08] bg-white/80 p-3.5 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.45)] backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04]">
                  <FlowNode kind="trigger" title="New task assigned" />
                  <div className="flex justify-center py-0.5">
                    <ArrowDown size={14} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <FlowNode kind="condition" title="Priority = High" />
                  <div className="flex justify-center py-0.5">
                    <ArrowDown size={14} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <FlowNode kind="action" title="Notify owner + log to sprint" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {flows.slice(1).map((flow) => (
                    <div
                      key={flow.id}
                      className="relative overflow-hidden rounded-2xl border border-navy-900/[0.08] bg-white/70 p-3 text-center backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      <p className="truncate text-[11px] font-semibold text-slate-600 dark:text-slate-300">{flow.trigger}</p>
                      <p className="mt-0.5 truncate text-[10px] text-slate-400">{flow.action}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-2">
                  <Badge tone="success">
                    <Workflow size={12} /> Visual builder
                  </Badge>
                  <Badge>
                    <Puzzle size={12} /> n8n integration
                  </Badge>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="order-1 lg:order-2">
            <SectionHeading
              align="left"
              eyebrow="Automation"
              title={<>Let the busywork <span className="font-serif italic text-brand-600 dark:text-brand-300">run itself</span></>}
              subtitle="Build visual When → If → Then flows that move work forward without you. When automation meets a wall, TaMaD's n8n integration extends it anywhere — external apps, databases, even your own APIs."
              className="mb-10 md:mb-12"
            />

            <div className="space-y-5">
              <Reveal>
                <div className="flex gap-4 rounded-2xl border border-navy-900/[0.07] bg-white/60 p-4 dark:border-white/[0.07] dark:bg-white/[0.03]">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-300">
                    <MousePointerClick size={20} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-navy-900 dark:text-white">Point, click, automate</h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-slate-500 dark:text-slate-400">
                      No code, no recipes to dig for. Pick a trigger, set a condition, choose what happens next.
                    </p>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.07}>
                <div className="flex gap-4 rounded-2xl border border-navy-900/[0.07] bg-white/60 p-4 dark:border-white/[0.07] dark:bg-white/[0.03]">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-300">
                    <GitBranch size={20} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-navy-900 dark:text-white">Endless reach with n8n</h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-slate-500 dark:text-slate-400">
                      The moment a flow needs the outside world, n8n hands you 400+ integrations and a full logic canvas.
                    </p>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.14}>
                <div className="flex gap-4 rounded-2xl border border-navy-900/[0.07] bg-white/60 p-4 dark:border-white/[0.07] dark:bg-white/[0.03]">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-300">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-navy-900 dark:text-white">Recover hours every week</h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-slate-500 dark:text-slate-400">
                      Teams using TaMaD automation report an average of 6 hours saved per person, per week.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
