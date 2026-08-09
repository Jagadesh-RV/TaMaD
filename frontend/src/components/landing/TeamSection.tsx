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

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Team workspace"
              title={<>Built for teams that <span className="font-serif italic text-foreground-secondary">move together</span></>}
              subtitle="From two co-founders to two hundred engineers — TaMaD keeps everyone aligned without standing in anyone's way."
              className="mb-10 md:mb-12"
            />

            <div className="space-y-5">
              {bullets.map((bullet, index) => (
                <Reveal key={bullet.title} delay={index * 0.07}>
                  <div className="card group flex gap-4 p-4 hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-active text-foreground-secondary transition-colors group-hover:bg-foreground group-hover:text-background">
                      <bullet.icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-foreground">{bullet.title}</h3>
                      <p className="mt-1 text-[13.5px] leading-relaxed text-foreground-secondary">{bullet.text}</p>
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
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background">ND</div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface bg-success" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Nova Design</p>
                    <p className="text-[11px] text-foreground-tertiary">42 members · 8 online now</p>
                  </div>
                  <Badge className="badge-success">
                    <Cpu size={11} /> Live
                  </Badge>
                </div>

                <div className="space-y-3 p-5">
                  {members.map((member, index) => (
                    <div key={member.initials} className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-background bg-foreground"
                      >
                        {member.initials}
                      </div>
                      <div className="flex-1 truncate">
                        <p className="text-[13px] font-semibold text-foreground">{member.name}</p>
                        <p className="truncate text-[11.5px] text-foreground-secondary">{member.state}</p>
                      </div>
                      <MousePointer2 size={14} className="shrink-0 text-foreground-tertiary" style={{ opacity: 0.5 + index * 0.1 }} />
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 border-t border-border-light px-5 py-4">
                  <div className="flex -space-x-2">
                    {members.slice(0, 3).map((member) => (
                      <div
                        key={member.initials}
                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-foreground text-[10px] font-bold text-background"
                      >
                        {member.initials}
                      </div>
                    ))}
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-surface-active text-[10px] font-bold text-foreground-secondary">
                      +2
                    </div>
                  </div>
                  <p className="flex-1 text-[12px] font-medium text-foreground-secondary">
                    <CheckCircle2 size={12} className="mr-1 inline text-success" />
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
