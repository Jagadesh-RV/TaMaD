import { Zap, Users, FolderKanban, Sparkles, Workflow, BookOpen, Video, Files, BarChart3 } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { LogoMark } from './Logo';

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
          title={<>Everything you work with. <span className="font-serif italic text-brand-600 dark:text-brand-300">One home.</span></>}
          subtitle="TaMaD is a unified platform that fuses nine capabilities most teams buy separately — so your personal work and your team's work finally live in the same place."
        />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          <Reveal direction="scale" className="col-span-2 row-span-2">
            <div className="relative flex h-full min-h-[280px] flex-col justify-between overflow-hidden rounded-3xl border border-brand-500/20 bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 p-7 text-white shadow-[0_24px_60px_-20px_rgba(37,99,235,0.5)] md:p-9">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
              <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-indigo-400/20 blur-2xl" aria-hidden="true" />
              <div className="relative flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
                  <LogoMark size={40} />
                </span>
                <div>
                  <p className="text-sm font-extrabold tracking-tight">TaMaD</p>
                  <p className="text-[11px] font-medium text-white/70">One workspace</p>
                </div>
              </div>
              <div className="relative">
                <h3 className="text-2xl font-extrabold leading-tight tracking-tight md:text-3xl">
                  Nine tools collapsed into one. Zero context switching.
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/75">
                  Stop paying for a stack of apps that don&apos;t talk to each other. TaMaD brings your whole
                  workflow together — seamlessly, privately and beautifully.
                </p>
              </div>
            </div>
          </Reveal>

          {pillars.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 0.05}>
              <div className="group relative h-full overflow-hidden rounded-3xl border border-navy-900/[0.07] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/30 hover:shadow-[0_20px_50px_-24px_rgba(37,99,235,0.25)] dark:border-white/[0.07] dark:bg-white/[0.03]">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 transition-transform duration-300 group-hover:scale-110 dark:text-brand-300">
                  <pillar.icon size={21} />
                </div>
                <h3 className="text-sm font-bold text-navy-900 dark:text-white">{pillar.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">{pillar.text}</p>
              </div>
            </Reveal>
          ))}

          <Reveal delay={0.1}>
            <div className="group relative h-full overflow-hidden rounded-3xl border border-slate-900/[0.07] bg-slate-900 p-6 text-white transition-all duration-300 hover:-translate-y-1 dark:border-white/10">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-brand-300">
                <BarChart3 size={21} />
              </div>
              <h3 className="text-sm font-bold">Analytics</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">
                Track progress, velocity and productivity across everything you do.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
