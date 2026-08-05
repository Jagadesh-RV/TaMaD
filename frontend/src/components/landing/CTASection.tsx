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
          className="relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-gradient-to-br from-brand-700 via-brand-600 to-violet-700 px-6 py-20 text-center shadow-[0_50px_120px_-40px_rgba(37,99,235,0.6)] md:px-16 md:py-24"
        >
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />

          <div className="relative">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-white shadow-lg backdrop-blur-md"
            >
              <LogoMark size={36} />
            </motion.div>

            <h2 className="mx-auto max-w-2xl text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-white md:text-5xl">
              Your team&apos;s whole workflow, finally in one place.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/80 md:text-lg">
              Join thousands of teams who traded the stack for the platform. Set up your workspace in minutes — free forever, no card required.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button to="/register" size="lg" className="bg-white text-brand-700 shadow-[0_12px_40px_rgba(0,0,0,0.2)] hover:bg-white/95">
                <Sparkles size={18} />
                Start free today
                <ArrowRight size={18} />
              </Button>
              <Button to="/contact" size="lg" className="border border-white/40 bg-white/10 text-white backdrop-blur-md hover:bg-white/20">
                Talk to sales
              </Button>
            </div>

            <p className="mt-7 text-xs font-medium uppercase tracking-[0.18em] text-white/60">
              Free forever plan · No credit card · Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
