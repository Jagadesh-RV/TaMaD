import { Users, UserCog, Radio, MousePointer2, CheckCircle2, Cpu } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { Badge } from './Badge';

const bullets = [
  {
    icon: Radio,
    title: 'Real-time everything',
    text: 'Changes, mentions and statuses land the second they happen — no refresh, no "did you get it?"',
  },
  {
    icon: Users,
    title: 'Shared boards that scale',
    text: 'Give the right people the right views, from a single source of truth.',
  },
  {
    icon: UserCog,
    title: 'Roles & permissions you control',
    text: 'Owners, admins, members and guests — with granular access per project and document.',
  },
];

const members = [
  { initials: 'AK', hue: 262, name: 'Aisha', state: 'Viewing project roadmap' },
  { initials: 'MT', hue: 155, name: 'Marco', state: 'Editing sprint plan' },
  { initials: 'JL', hue: 22, name: 'Jules', state: 'Commenting on task #184' },
  { initials: 'SR', hue: 190, name: 'Sam', state: 'In meeting · Operations sync' },
  { initials: 'NG', hue: 330, name: 'Nina', state: 'Reviewing knowledge base' },
];

export function TeamSection() {
  return (
    <section id="teams" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute left-0 top-1/3 h-[400px] w-[500px] -translate-x-1/2 rounded-full bg-violet-500/[0.06] blur-[140px]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Team workspace"
              title={<>Built for teams that <span className="font-serif italic text-brand-600 dark:text-brand-300">move together</span></>}
              subtitle="From two co-founders to two hundred engineers — TaMaD keeps everyone aligned without standing in anyone's way."
              className="mb-10 md:mb-12"
            />

            <div className="space-y-5">
              {bullets.map((bullet, index) => (
                <Reveal key={bullet.title} delay={index * 0.07}>
                  <div className="group flex gap-4 rounded-2xl border border-transparent p-3 transition-all duration-300 hover:border-navy-900/[0.07] hover:bg-white/70 hover:shadow-sm dark:hover:border-white/[0.08] dark:hover:bg-white/[0.04]">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 transition-colors group-hover:bg-violet-600 group-hover:text-white dark:text-violet-300">
                      <bullet.icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-navy-900 dark:text-white">{bullet.title}</h3>
                      <p className="mt-1 text-[13.5px] leading-relaxed text-slate-500 dark:text-slate-400">{bullet.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={0.15}>
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-6 rounded-[2rem] bg-violet-500/10 blur-2xl" aria-hidden="true" />

              <div className="relative overflow-hidden rounded-[1.75rem] border border-navy-900/10 bg-white shadow-[0_40px_90px_-40px_rgba(15,23,42,0.4)] dark:border-white/10 dark:bg-slate-900">
                <div className="flex items-center gap-3 border-b border-navy-900/[0.06] px-5 py-4 dark:border-white/[0.08]">
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">ND</div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-navy-900 dark:text-white">Nova Design</p>
                    <p className="text-[11px] text-slate-400">42 members · 8 online now</p>
                  </div>
                  <Badge tone="success">
                    <Cpu size={11} /> Live
                  </Badge>
                </div>

                <div className="space-y-3 p-5">
                  {members.map((member, index) => (
                    <div key={member.initials} className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                        style={{ background: `linear-gradient(135deg, hsl(${member.hue} 70% 52%), hsl(${member.hue + 40} 70% 45%))` }}
                      >
                        {member.initials}
                      </div>
                      <div className="flex-1 truncate">
                        <p className="text-[13px] font-semibold text-navy-900 dark:text-white">{member.name}</p>
                        <p className="truncate text-[11.5px] text-slate-400">{member.state}</p>
                      </div>
                      <MousePointer2 size={14} className="shrink-0 text-violet-500" style={{ opacity: 0.5 + index * 0.1 }} />
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 border-t border-navy-900/[0.06] px-5 py-4 dark:border-white/[0.08]">
                  <div className="flex -space-x-2">
                    {members.slice(0, 3).map((member) => (
                      <div
                        key={member.initials}
                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white dark:border-slate-900"
                        style={{ background: `linear-gradient(135deg, hsl(${member.hue} 70% 52%), hsl(${member.hue + 40} 70% 45%))` }}
                      >
                        {member.initials}
                      </div>
                    ))}
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-500 dark:border-slate-900 dark:bg-white/10 dark:text-slate-300">
                      +2
                    </div>
                  </div>
                  <p className="flex-1 text-[12px] font-medium text-slate-500 dark:text-slate-400">
                    <CheckCircle2 size={12} className="mr-1 inline text-emerald-500" />
                    Everyone synced
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
