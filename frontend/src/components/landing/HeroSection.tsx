import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, Play, Calendar, Star } from 'lucide-react';
import { Reveal } from './Reveal';
import { scrollToSection } from './scrollTo';

const modules = [
  'Personal Workspace',
  'Team Collaboration',
  'AI Assistant',
  'Automation',
  'Agile Boards',
  'Meetings',
  'Knowledge Base',
  'Analytics',
];

const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const heroItem = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};

export function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="about" className="relative flex min-h-[100svh] flex-col overflow-hidden bg-background">

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-5 pb-24 pt-36 text-center md:pt-40">
        <motion.div variants={heroContainer} initial="hidden" animate="show">
          <motion.div variants={heroItem}>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface py-1.5 pl-1.5 pr-4 text-xs font-semibold text-foreground-secondary shadow-sm">
              <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-background">
                <Sparkles size={11} /> New
              </span>
              The next-generation productivity platform
            </span>
          </motion.div>

          <motion.h1
            variants={heroItem}
            className="mt-7 text-balance text-5xl font-extrabold leading-[1.04] tracking-tight text-foreground sm:text-6xl md:text-7xl"
          >
            One workspace for{' '}
            <span className="font-serif font-normal italic text-foreground-secondary">
              work, AI &amp; life
            </span>
            .
          </motion.h1>

          <motion.p
            variants={heroItem}
            className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-foreground-secondary md:text-lg"
          >
            TaMaD unifies personal productivity, team collaboration, AI assistance, automation, and Agile
            project management into a single, beautifully simple platform — so you can stop juggling tools and
            start doing your best work.
          </motion.p>

          <motion.div variants={heroItem} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="/register" className="btn btn-primary btn-lg">
              Start Free
            </a>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => scrollToSection('features')}
            >
              <Play size={17} /> Watch Demo
            </button>
            <a href="/contact" className="btn btn-ghost btn-lg hidden sm:inline-flex">
              <Calendar size={17} /> Book Demo
            </a>
          </motion.div>

          <motion.div variants={heroItem} className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-5">
            <div className="flex items-center -space-x-2.5">
              {['AK', 'MJ', 'SL', 'RK', 'DB'].map((initials, index) => (
                <span
                  key={initials}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-foreground text-[10px] font-bold text-background"
                >
                  {initials}
                </span>
              ))}
            </div>
            <div className="text-sm text-foreground-secondary">
              <span className="mr-1 inline-flex items-center gap-0.5 align-middle text-foreground">
                {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={13} fill="currentColor" strokeWidth={0} />)}
              </span>
              <strong className="font-bold text-foreground">4.9/5</strong> from 10,000+ people and teams
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 w-full"
        >
          <Reveal delay={0.2}>
            <p className="mb-4 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-foreground-tertiary">
              Everything, unified
            </p>
            <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2.5">
              {modules.map((module, index) => (
                <span
                  key={module}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground-secondary shadow-sm"
                  style={{ animation: reduceMotion ? undefined : `float-y ${7 + index}s ease-in-out ${index * 0.4}s infinite` }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                  {module}
                </span>
              ))}
            </div>
          </Reveal>
        </motion.div>
      </div>

    </section>
  );
}
