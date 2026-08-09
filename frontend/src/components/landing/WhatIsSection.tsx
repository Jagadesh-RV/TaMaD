import { Zap, Users, FolderKanban, Sparkles, Workflow, BookOpen, Video, Files, BarChart3 } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';


const pillars = [
  { icon: Zap, title: 'Personal Productivity', text: 'Tasks, goals, habits and focus timers for how you actually work.' },
  { icon: Users, title: 'Team Collaboration', text: 'Organizations, roles, live edits and real-time updates across teams.' },
  { icon: FolderKanban, title: 'Project Management', text: 'Projects, milestones and portfolios with Agile boards and sprints.' },
  { icon: Sparkles, title: 'AI Assistant', text: 'An assistant that knows your entire workspace — from tasks to docs.' },
  { icon: Workflow, title: 'Automation', text: 'Visual workflows and n8n integrations that remove repetitive work.' },
  { icon: BookOpen, title: 'Knowledge Management', text: 'Notes, documents and a shared knowledge base that stays current.' },
  { icon: Video, title: 'Meetings', text: 'Video meetings with live transcripts, summaries and action items.' },
  { icon: Files, title: 'Files', text: 'All your files and documents, organized in one secure place.' },
];

export function WhatIsSection() {
  return (
    <section id="solutions" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="What is TaMaD"
          title={<>Everything you work with. <span className="font-serif italic text-foreground-secondary">One home.</span></>}
          subtitle="TaMaD is a unified platform that fuses nine capabilities most teams buy separately — so your personal work and your team's work finally live in the same place."
        />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          <Reveal direction="scale" className="col-span-2 row-span-2">
            <div className="relative flex h-full min-h-[280px] flex-col justify-between overflow-hidden rounded-3xl border border-border bg-foreground p-7 text-background shadow-sm md:p-9">
              <div className="relative flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-active text-foreground">
                  <span className="font-bold text-xl">T</span>
                </div>
                <div>
                  <p className="text-sm font-extrabold tracking-tight">TaMaD</p>
                  <p className="text-[11px] font-medium text-background/70">One workspace</p>
                </div>
              </div>
              <div className="relative">
                <h3 className="text-2xl font-extrabold leading-tight tracking-tight md:text-3xl">
                  Nine tools collapsed into one. Zero context switching.
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-background/75">
                  Stop paying for a stack of apps that don&apos;t talk to each other. TaMaD brings your whole
                  workflow together — seamlessly, privately and beautifully.
                </p>
              </div>
            </div>
          </Reveal>

          {pillars.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 0.05}>
              <div className="card group relative h-full overflow-hidden p-6 hover:-translate-y-1 transition-transform duration-300">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-surface-active text-foreground-secondary transition-colors duration-300 group-hover:bg-foreground group-hover:text-background">
                  <pillar.icon size={21} />
                </div>
                <h3 className="text-sm font-bold text-foreground">{pillar.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-foreground-secondary">{pillar.text}</p>
              </div>
            </Reveal>
          ))}

          <Reveal delay={0.1}>
            <div className="card group relative h-full overflow-hidden p-6 hover:-translate-y-1 transition-transform duration-300">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-surface-active text-foreground-secondary transition-colors duration-300 group-hover:bg-foreground group-hover:text-background">
                <BarChart3 size={21} />
              </div>
              <h3 className="text-sm font-bold text-foreground">Analytics</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-foreground-secondary">
                Track progress, velocity and productivity across everything you do.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
