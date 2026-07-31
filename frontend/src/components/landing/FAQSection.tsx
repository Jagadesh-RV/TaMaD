import { useState } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';

const faqs = [
  {
    q: 'Is TaMaD really an all-in-one platform?',
    a: 'Yes. Tasks, projects, sprints, issues, calendar, notes, docs, whiteboards, meetings, files, knowledge base, analytics, goals, habits and AI all share one database, one login and one search. There is no tab-switching or data to sync between them.',
  },
  {
    q: 'How is TaMaD AI different from ChatGPT or Copilot?',
    a: 'Generic AI doesn\u2019t know your projects, your deadlines or your meeting history. TaMaD AI is grounded in your workspace — it summarizes real documents, turns actual meeting transcripts into action items, and drafts plans based on your real workload.',
  },
  {
    q: 'Can we import from Notion, Jira or Trello?',
    a: 'Importers for Notion, Jira, Trello, Asana and CSV are on the roadmap and rolling out progressively. Migration concierge is available on Pro and Enterprise so you don\u2019t lose a single task in the move.',
  },
  {
    q: 'What is the n8n integration exactly?',
    a: 'When a flow needs to reach beyond TaMaD — an external CRM, a database, your own API — n8n is embedded so you can connect 400+ services and add advanced logic. It\u2019s available on Pro, with enterprise-grade features on Enterprise.',
  },
  {
    q: 'Is my data private and secure?',
    a: 'Yes. Data is encrypted in transit and at rest, hosted in a modern cloud region, and never sold or used to train third-party models. Enterprise adds SSO, SCIM, audit logs and dedicated infrastructure.',
  },
  {
    q: 'What happens if I outgrow the free plan?',
    a: 'You keep your workspace and everything in it. When you upgrade, nothing is lost or duplicated — you simply unlock team features, AI, automation and integrations. You can also downgrade anytime.',
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title={<>Questions, <span className="font-serif italic text-brand-600 dark:text-brand-300">answered</span></>}
          subtitle="Everything teams usually ask before making the switch."
        />

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = open === index;
            return (
              <Reveal key={faq.q} delay={index * 0.04}>
                <div
                  className={clsx(
                    'overflow-hidden rounded-2xl border transition-colors duration-300',
                    isOpen
                      ? 'border-brand-500/30 bg-white shadow-[0_16px_44px_-28px_rgba(37,99,235,0.35)] dark:border-brand-400/25 dark:bg-white/[0.05]'
                      : 'border-navy-900/[0.08] bg-white hover:border-navy-900/[0.14] dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:border-white/[0.14]',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
                  >
                    <span className="text-[15px] font-bold text-navy-900 dark:text-white">{faq.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.25 }}
                      className={clsx(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors',
                        isOpen ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300',
                      )}
                    >
                      <Plus size={16} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <p className="px-6 pb-6 text-[13.5px] leading-relaxed text-slate-500 dark:text-slate-400">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
