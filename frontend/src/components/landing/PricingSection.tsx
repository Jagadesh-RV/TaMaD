import { useState } from 'react';
import clsx from 'clsx';
import { Check, Sparkles } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { Badge } from './Badge';
import { Button } from './Button';

interface Plan {
  name: string;
  tagline: string;
  monthly: number | null;
  annual: number | null;
  cta: string;
  popular?: boolean;
  features: string[];
}

const plans: Plan[] = [
  {
    name: 'Free',
    tagline: 'Everything a solo maker needs to get organized.',
    monthly: 0,
    annual: 0,
    cta: 'Start for free',
    features: [
      'Personal workspace',
      'Unlimited tasks & notes',
      'Calendar & goals',
      'Focus timer & habits',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    tagline: 'For teams that want the full platform under one roof.',
    monthly: 9,
    annual: 7,
    cta: 'Start 14-day trial',
    popular: true,
    features: [
      'Everything in Free',
      'Team workspace & shared boards',
      'Projects, sprints & issues',
      'Meetings with transcripts',
      'Whiteboards & knowledge base',
      'AI assistant & automation',
      'Files, docs & analytics',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    tagline: 'Security, control and scale for serious organizations.',
    monthly: null,
    annual: null,
    cta: 'Talk to sales',
    features: [
      'Everything in Pro',
      'SSO & SCIM provisioning',
      'Advanced roles & audit logs',
      'Dedicated infrastructure',
      'SLA & custom onboarding',
      'n8n enterprise workflows',
    ],
  },
];

export function PricingSection() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute left-1/2 top-24 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-brand-500/[0.05] blur-[150px] dark:bg-brand-500/[0.1]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Pricing"
          title={<>Simple pricing. <span className="font-serif italic text-brand-600 dark:text-brand-300">Serious value.</span></>}
          subtitle="Start free, upgrade when your team does. No credit card required, cancel anytime."
        />

        <Reveal>
          <div className="mb-12 flex items-center justify-center gap-4">
            <span className={clsx('text-sm font-semibold transition-colors', !annual ? 'text-navy-900 dark:text-white' : 'text-slate-400')}>
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={annual}
              aria-label="Toggle annual billing"
              onClick={() => setAnnual((value) => !value)}
              className={clsx(
                'relative h-7 w-13 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
                annual ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700',
              )}
              style={{ width: '52px' }}
            >
              <span
                className={clsx(
                  'absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300',
                  annual ? 'left-[26px]' : 'left-1',
                )}
              />
            </button>
            <span className={clsx('text-sm font-semibold transition-colors', annual ? 'text-navy-900 dark:text-white' : 'text-slate-400')}>
              Annual
            </span>
            <Badge tone="success">
              <Sparkles size={11} /> Save 22%
            </Badge>
          </div>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-5">
          {plans.map((plan, index) => {
            const price = annual ? plan.annual : plan.monthly;
            return (
              <Reveal key={plan.name} delay={index * 0.08}>
                <div
                  className={clsx(
                    'relative flex h-full flex-col rounded-3xl p-7 transition-all duration-300',
                    plan.popular
                      ? 'border-2 border-brand-600/60 bg-gradient-to-b from-brand-600/[0.08] via-white to-white shadow-[0_36px_90px_-40px_rgba(37,99,235,0.45)] dark:from-brand-500/[0.12] dark:via-slate-900 dark:to-slate-900'
                      : 'border border-navy-900/[0.08] bg-white hover:-translate-y-1 hover:shadow-[0_24px_60px_-32px_rgba(15,23,42,0.3)] dark:border-white/[0.08] dark:bg-white/[0.03]',
                  )}
                >
                  {plan.popular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg">
                      Most popular
                    </span>
                  )}

                  <h3 className="text-lg font-extrabold tracking-tight text-navy-900 dark:text-white">{plan.name}</h3>
                  <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">{plan.tagline}</p>

                  <div className="mt-6 flex items-baseline gap-1.5">
                    {price === null ? (
                      <span className="text-4xl font-extrabold tracking-tight text-navy-900 dark:text-white">Custom</span>
                    ) : (
                      <>
                        <span className="text-4xl font-extrabold tracking-tight text-navy-900 dark:text-white">${price}</span>
                        <span className="text-sm font-medium text-slate-400">/ month</span>
                      </>
                    )}
                  </div>
                  <p className="mt-1 h-4 text-[11.5px] text-slate-400">
                    {price !== null && price > 0 && annual ? 'billed annually' : price !== null && price > 0 ? 'billed monthly' : price === 0 ? 'free forever' : ''}
                  </p>

                  <ul className="mt-6 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-[13.5px] text-slate-600 dark:text-slate-300">
                        <span
                          className={clsx(
                            'mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full',
                            plan.popular ? 'bg-brand-600 text-white' : 'bg-brand-500/12 text-brand-600 dark:text-brand-300',
                          )}
                          style={{ width: 18, height: 18 }}
                        >
                          <Check size={11} strokeWidth={3} />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    to={plan.name === 'Enterprise' ? '/contact' : '/register'}
                    variant={plan.popular ? 'primary' : 'secondary'}
                    className="mt-8 w-full"
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1}>
          <p className="mx-auto mt-10 max-w-xl text-center text-xs leading-relaxed text-slate-400 dark:text-slate-500">
            All prices in USD. Student & nonprofit discounts available — just ask. Enterprise plans include
            annual-only billing.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
