import clsx from 'clsx';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { LogoMark } from './Logo';

type Cell = 'full' | 'partial' | 'none';

const features: { label: string; tamad: Cell; tools: Cell[] }[] = [
  { label: 'Personal workspace', tamad: 'full', tools: ['full', 'full', 'none', 'partial', 'none', 'none'] },
  { label: 'Team workspace', tamad: 'full', tools: ['full', 'full', 'full', 'full', 'partial', 'partial'] },
  { label: 'AI assistant', tamad: 'full', tools: ['full', 'full', 'partial', 'full', 'partial', 'partial'] },
  { label: 'Automation', tamad: 'full', tools: ['none', 'full', 'full', 'full', 'full', 'partial'] },
  { label: 'Video meetings', tamad: 'full', tools: ['none', 'partial', 'none', 'none', 'partial', 'full'] },
  { label: 'Agile & sprints', tamad: 'full', tools: ['partial', 'full', 'full', 'full', 'none', 'none'] },
  { label: 'Whiteboards', tamad: 'full', tools: ['full', 'full', 'none', 'none', 'none', 'none'] },
  { label: 'Knowledge base', tamad: 'full', tools: ['full', 'partial', 'partial', 'none', 'partial', 'partial'] },
  { label: 'Analytics & reports', tamad: 'full', tools: ['partial', 'full', 'full', 'partial', 'partial', 'partial'] },
  { label: 'Goals, habits & focus', tamad: 'full', tools: ['none', 'full', 'none', 'none', 'none', 'none'] },
  { label: 'Calendar', tamad: 'full', tools: ['partial', 'full', 'partial', 'partial', 'partial', 'partial'] },
  { label: 'Unified dashboard', tamad: 'full', tools: ['partial', 'partial', 'none', 'none', 'none', 'none'] },
];

const competitors = ['Notion', 'ClickUp', 'Jira', 'Linear', 'Slack', 'MS Teams'];

function CellMark({ value, tamad = false }: { value: Cell; tamad?: boolean }) {
  if (value === 'full') {
    return (
      <span
        className={clsx(
          'mx-auto flex h-5 w-5 items-center justify-center rounded-full',
          tamad ? 'bg-brand-600 text-white' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
        )}
      >
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
          <path d="M2 6.2L4.6 8.8L10 3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (value === 'partial') {
    return (
      <span className="mx-auto flex h-5 w-5 items-center justify-center">
        <span className="block h-2 w-2 rounded-full border-2 border-slate-300 dark:border-slate-600" />
      </span>
    );
  }
  return <span className="mx-auto block text-center text-slate-300 dark:text-slate-600">—</span>;
}

export function WhyTamadSection() {
  return (
    <section id="why" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Why TaMaD"
          title={<>The full stack, <span className="font-serif italic text-brand-600 dark:text-brand-300">without the stack</span></>}
          subtitle="Teams don't need to choose between a task tool, a wiki, a meeting app and a chat platform. Compare the capabilities you actually use — all built into one."
        />

        <Reveal>
          <div className="overflow-hidden rounded-3xl border border-navy-900/[0.07] bg-white shadow-[0_24px_70px_-40px_rgba(15,23,42,0.3)] dark:border-white/[0.07] dark:bg-white/[0.03]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-navy-900/[0.06] dark:border-white/[0.08]">
                    <th scope="col" className="w-[30%] px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Capability
                    </th>
                    <th scope="col" className="bg-brand-600/[0.05] px-4 py-5 text-center">
                      <span className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-1.5">
                        <LogoMark size={20} />
                        <span className="text-sm font-extrabold tracking-tight text-brand-700 dark:text-brand-300">TaMaD</span>
                      </span>
                    </th>
                    {competitors.map((name) => (
                      <th key={name} scope="col" className="px-4 py-5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, index) => (
                    <tr
                      key={feature.label}
                      className={clsx(
                        'border-b border-navy-900/[0.05] transition-colors hover:bg-slate-50 dark:border-white/[0.05] dark:hover:bg-white/[0.02]',
                        index % 2 === 1 && 'bg-slate-50/60 dark:bg-white/[0.015]',
                      )}
                    >
                      <th scope="row" className="px-6 py-3.5 text-[13px] font-semibold text-navy-900 dark:text-slate-200">
                        {feature.label}
                      </th>
                      <td className="bg-brand-600/[0.05] px-4 py-3.5 text-center dark:bg-brand-500/[0.06]">
                        <CellMark value={feature.tamad} tamad />
                      </td>
                      {feature.tools.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-3.5 text-center">
                          <CellMark value={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                      ● Built-in · ◌ Partial via add-ons · — Not available
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            We're not here to criticize anyone — Notion, Linear and the rest are great at what they do. The point is
            simple: <strong className="font-semibold text-navy-900 dark:text-white">you shouldn't need all of them.</strong>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
