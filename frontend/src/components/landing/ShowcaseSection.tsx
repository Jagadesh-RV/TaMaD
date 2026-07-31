import { useEffect, useState, type ComponentType } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { BrowserFrame } from './showcase/BrowserFrame';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { DashboardMock } from './showcase/screens/DashboardMock';
import { TasksMock } from './showcase/screens/TasksMock';
import { KanbanMock } from './showcase/screens/KanbanMock';
import { CalendarMock } from './showcase/screens/CalendarMock';
import { ProjectsMock } from './showcase/screens/ProjectsMock';
import { SprintMock } from './showcase/screens/SprintMock';
import { AnalyticsMock } from './showcase/screens/AnalyticsMock';
import { AIMock } from './showcase/screens/AIMock';
import { NotesMock } from './showcase/screens/NotesMock';
import { WhiteboardMock } from './showcase/screens/WhiteboardMock';
import { MeetingsMock } from './showcase/screens/MeetingsMock';
import { TeamMock } from './showcase/screens/TeamMock';
import { FilesMock } from './showcase/screens/FilesMock';
import { DocumentsMock } from './showcase/screens/DocumentsMock';

interface ScreenEntry {
  label: string;
  description: string;
  url: string;
  Component: ComponentType;
}

const screens: ScreenEntry[] = [
  { label: 'Dashboard', description: 'A unified dashboard that brings your tasks, focus, velocity and priorities into one glance.', url: 'app.tamad.app/dashboard', Component: DashboardMock },
  { label: 'Tasks', description: 'Capture, organize and track work with rich tasks, priorities and due dates.', url: 'app.tamad.app/tasks', Component: TasksMock },
  { label: 'Kanban', description: 'Visualize flow with drag-and-drop boards for any workflow.', url: 'app.tamad.app/agile/board', Component: KanbanMock },
  { label: 'Calendar', description: 'Events, meetings and deadlines — synchronized in one calendar.', url: 'app.tamad.app/calendar', Component: CalendarMock },
  { label: 'Projects', description: 'Track milestones, progress and owners across every initiative.', url: 'app.tamad.app/projects', Component: ProjectsMock },
  { label: 'Sprint Planning', description: 'Plan sprints, estimate points and balance team capacity.', url: 'app.tamad.app/agile/planning', Component: SprintMock },
  { label: 'Analytics', description: 'Understand throughput, cycle time and workload with live charts.', url: 'app.tamad.app/analytics', Component: AnalyticsMock },
  { label: 'AI Assistant', description: 'Ask TaMaD anything — summaries, drafts and suggestions from your workspace.', url: 'app.tamad.app/ai', Component: AIMock },
  { label: 'Notes', description: 'A fast, focused writing surface that auto-saves as you think.', url: 'app.tamad.app/notes', Component: NotesMock },
  { label: 'Whiteboard', description: 'Sketch ideas and plan together on a shared infinite canvas.', url: 'app.tamad.app/whiteboard', Component: WhiteboardMock },
  { label: 'Meetings', description: 'Video meetings with live AI transcripts and action items.', url: 'app.tamad.app/team/tamad-meet', Component: MeetingsMock },
  { label: 'Team Dashboard', description: "See who's online, what's moving and how the team is tracking.", url: 'app.tamad.app/team', Component: TeamMock },
  { label: 'Files', description: 'Every file, one place — shared across your workspace.', url: 'app.tamad.app/files', Component: FilesMock },
  { label: 'Documents', description: "A living knowledge base for your team's documentation.", url: 'app.tamad.app/documents', Component: DocumentsMock },
];

const CYCLE_MS = 5000;

export function ShowcaseSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % screens.length);
    }, CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [paused]);

  const entry = screens[active];

  return (
    <section id="tour" className="relative overflow-hidden py-24 md:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-brand-500/[0.07] blur-[120px] dark:bg-brand-600/10" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Product Tour"
          title={<>One workspace. <span className="font-serif italic text-brand-600 dark:text-brand-300">Every screen.</span></>}
          subtitle="From personal dashboards to team boards, sprints and meetings — see the surfaces that keep TaMaD connected."
        />

        <Reveal>
          <div
            className="mb-10 flex flex-wrap items-center justify-center gap-2"
            role="tablist"
            aria-label="Product screens"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {screens.map((screen, index) => (
              <button
                key={screen.label}
                role="tab"
                aria-selected={index === active}
                onClick={() => { setActive(index); setPaused(true); }}
                className={clsx(
                  'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-300',
                  index === active
                    ? 'border-brand-600 bg-brand-600 text-white shadow-[0_6px_20px_rgba(37,99,235,0.35)]'
                    : 'border-navy-900/10 bg-white/70 text-slate-600 hover:border-brand-500/40 hover:text-brand-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-brand-300',
                )}
              >
                {screen.label}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="relative mx-auto max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 24, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.99 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="flex justify-center"
            >
              <BrowserFrame url={entry.url} float={1.2} glow="rgba(37,99,235,0.16)">
                <entry.Component />
              </BrowserFrame>
            </motion.div>
          </AnimatePresence>
        </div>

        <Reveal delay={0.15}>
          <p className="mx-auto mt-8 max-w-xl text-center text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {entry.description}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
