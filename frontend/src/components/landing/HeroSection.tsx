import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, Play, Calendar, Star } from 'lucide-react';
import { HeroBackdrop } from './Backdrop';
import { Button } from './Button';
import { Badge } from './Badge';
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
    <section id="about" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <HeroBackdrop className="absolute inset-0" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-5 pb-24 pt-36 text-center md:pt-40">
        <motion.div variants={heroContainer} initial="hidden" animate="show">
          <motion.div variants={heroItem}>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-white/70 py-1.5 pl-1.5 pr-4 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-md dark:border-brand-400/25 dark:bg-white/[0.05] dark:text-slate-200">
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                <Sparkles size={11} /> New
              </span>
              The next-generation productivity platform
            </span>
          </motion.div>

          <motion.h1
            variants={heroItem}
            className="mt-7 text-balance text-5xl font-extrabold leading-[1.04] tracking-tight text-navy-950 dark:text-white sm:text-6xl md:text-7xl"
          >
            One workspace for{' '}
            <span className="font-serif font-normal italic text-brand-600 dark:text-brand-300">
              work, AI &amp; life
            </span>
            .
          </motion.h1>

          <motion.p
            variants={heroItem}
            className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-slate-600 dark:text-slate-300 md:text-lg"
          >
            TaMaD unifies personal productivity, team collaboration, AI assistance, automation, and Agile
            project management into a single, beautifully simple platform — so you can stop juggling tools and
            start doing your best work.
          </motion.p>

          <motion.div variants={heroItem} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button to="/register" size="lg">
              Start Free
            </Button>
            <Button
              variant="glass"
              size="lg"
              onClick={() => scrollToSection('features')}
            >
              <Play size={17} /> Watch Demo
            </Button>
            <Button to="/contact" variant="ghost" size="lg" className="hidden sm:inline-flex">
              <Calendar size={17} /> Book Demo
            </Button>
          </motion.div>

          <motion.div variants={heroItem} className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-5">
            <div className="flex items-center -space-x-2.5">
              {['AK', 'MJ', 'SL', 'RK', 'DB'].map((initials, index) => (
                <span
                  key={initials}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white dark:border-navy-950"
                  style={{ background: ['#2563eb', '#7c3aed', '#059669', '#d97706', '#e11d48'][index] }}
                >
                  {initials}
                </span>
              ))}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              <span className="mr-1 inline-flex items-center gap-0.5 align-middle text-amber-500">
                {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={13} fill="currentColor" strokeWidth={0} />)}
              </span>
              <strong className="font-bold text-navy-900 dark:text-white">4.9/5</strong> from 10,000+ people and teams
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
            <p className="mb-4 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
              Everything, unified
            </p>
            <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2.5">
              {modules.map((module, index) => (
                <span
                  key={module}
                  className="inline-flex items-center gap-1.5 rounded-full border border-navy-900/[0.08] bg-white/60 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300"
                  style={{ animation: reduceMotion ? undefined : `float-y ${7 + index}s ease-in-out ${index * 0.4}s infinite` }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  {module}
                </span>
              ))}
            </div>
          </Reveal>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent dark:from-navy-950" aria-hidden="true" />
    </section>
  );
}
