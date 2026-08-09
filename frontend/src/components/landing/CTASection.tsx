import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { LogoMark } from './Logo';

export function CTASection() {
  return (
    <section className="relative px-5 pb-28 md:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="card relative overflow-hidden rounded-[2.5rem] bg-foreground px-6 py-20 text-center md:px-16 md:py-24"
        >
          <div className="pointer-events-none absolute inset-0 opacity-10" aria-hidden="true" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--color-background) 1px, transparent 0)', backgroundSize: '28px 28px' }} />

          <div className="relative">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-background text-foreground shadow-sm"
            >
              <LogoMark size={36} />
            </motion.div>

            <h2 className="mx-auto max-w-2xl text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-background md:text-5xl">
              Your team&apos;s whole workflow, finally in one place.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-background-secondary md:text-lg">
              Join thousands of teams who traded the stack for the platform. Set up your workspace in minutes — free forever, no card required.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a href="/register" className="btn btn-primary bg-background text-foreground hover:bg-background-secondary border-background shadow-sm btn-lg">
                <Sparkles size={18} />
                Start free today
                <ArrowRight size={18} />
              </a>
              <a href="/contact" className="btn btn-secondary text-background border-background-secondary hover:bg-surface/10 btn-lg">
                Talk to sales
              </a>
            </div>

            <p className="mt-7 text-xs font-medium uppercase tracking-[0.18em] text-background-secondary">
              Free forever plan · No credit card · Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
