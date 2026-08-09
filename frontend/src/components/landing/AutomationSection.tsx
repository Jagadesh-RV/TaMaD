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
    trigger: 'border-border bg-surface-active text-foreground',
    condition: 'border-border bg-surface-active text-foreground',
    action: 'border-border bg-surface-active text-foreground',
  }[kind];
  const dot = {
    trigger: 'bg-foreground',
    condition: 'bg-foreground-secondary',
    action: 'bg-foreground',
  }[kind];
  const label = { trigger: 'When', condition: 'If', action: 'Then' }[kind];

  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm ${styles}`}>
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${dot} text-[10px] font-bold text-background`}>
        {kind === 'trigger' ? 'W' : kind === 'condition' ? '?' : '→'}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-tertiary">{label}</span>
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
                <div className="relative rounded-2xl border border-border bg-surface p-3.5 shadow-sm">
                  <FlowNode kind="trigger" title="New task assigned" />
                  <div className="flex justify-center py-0.5">
                    <ArrowDown size={14} className="text-foreground-tertiary" />
                  </div>
                  <FlowNode kind="condition" title="Priority = High" />
                  <div className="flex justify-center py-0.5">
                    <ArrowDown size={14} className="text-foreground-tertiary" />
                  </div>
                  <FlowNode kind="action" title="Notify owner + log to sprint" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {flows.slice(1).map((flow) => (
                    <div
                      key={flow.id}
                      className="relative overflow-hidden rounded-2xl border border-border bg-surface-active p-3 text-center"
                    >
                      <p className="truncate text-[11px] font-semibold text-foreground">{flow.trigger}</p>
                      <p className="mt-0.5 truncate text-[10px] text-foreground-secondary">{flow.action}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-2">
                  <Badge className="badge-success">
                    <Workflow size={12} /> Visual builder
                  </Badge>
                  <Badge className="badge-neutral">
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
              title={<>Let the busywork <span className="font-serif italic text-foreground-secondary">run itself</span></>}
              subtitle="Build visual When → If → Then flows that move work forward without you. When automation meets a wall, TaMaD's n8n integration extends it anywhere — external apps, databases, even your own APIs."
              className="mb-10 md:mb-12"
            />

            <div className="space-y-5">
              <Reveal>
                <div className="card flex gap-4 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-active text-foreground-secondary">
                    <MousePointerClick size={20} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-foreground">Point, click, automate</h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-foreground-secondary">
                      No code, no recipes to dig for. Pick a trigger, set a condition, choose what happens next.
                    </p>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.07}>
                <div className="card flex gap-4 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-active text-foreground-secondary">
                    <GitBranch size={20} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-foreground">Endless reach with n8n</h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-foreground-secondary">
                      The moment a flow needs the outside world, n8n hands you 400+ integrations and a full logic canvas.
                    </p>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.14}>
                <div className="card flex gap-4 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-active text-foreground-secondary">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-foreground">Recover hours every week</h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-foreground-secondary">
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
