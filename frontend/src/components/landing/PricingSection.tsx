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

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Pricing"
          title={<>Simple pricing. <span className="font-serif italic text-foreground-secondary">Serious value.</span></>}
          subtitle="Start free, upgrade when your team does. No credit card required, cancel anytime."
        />

        <Reveal>
          <div className="mb-12 flex items-center justify-center gap-4">
            <span className={clsx('text-sm font-semibold transition-colors', !annual ? 'text-foreground' : 'text-foreground-tertiary')}>
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={annual}
              aria-label="Toggle annual billing"
              onClick={() => setAnnual((value) => !value)}
              className={clsx(
                'relative h-7 w-13 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2',
                annual ? 'bg-foreground' : 'bg-surface-active border border-border',
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
            <span className={clsx('text-sm font-semibold transition-colors', annual ? 'text-foreground' : 'text-foreground-tertiary')}>
              Annual
            </span>
            <Badge className="badge-success">
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
                    'card relative flex h-full flex-col p-7 transition-all duration-300 hover:-translate-y-1',
                    plan.popular
                      ? 'border-foreground shadow-lg'
                      : '',
                  )}
                >
                  {plan.popular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-background shadow-lg">
                      Most popular
                    </span>
                  )}

                  <h3 className="text-lg font-extrabold tracking-tight text-foreground">{plan.name}</h3>
                  <p className="mt-1 text-[13px] text-foreground-secondary">{plan.tagline}</p>

                  <div className="mt-6 flex items-baseline gap-1.5">
                    {price === null ? (
                      <span className="text-4xl font-extrabold tracking-tight text-foreground">Custom</span>
                    ) : (
                      <>
                        <span className="text-4xl font-extrabold tracking-tight text-foreground">${price}</span>
                        <span className="text-sm font-medium text-foreground-tertiary">/ month</span>
                      </>
                    )}
                  </div>
                  <p className="mt-1 h-4 text-[11.5px] text-foreground-tertiary">
                    {price !== null && price > 0 && annual ? 'billed annually' : price !== null && price > 0 ? 'billed monthly' : price === 0 ? 'free forever' : ''}
                  </p>

                  <ul className="mt-6 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-[13.5px] text-foreground-secondary">
                        <span
                          className={clsx(
                            'mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full',
                            plan.popular ? 'bg-foreground text-background' : 'bg-surface-active border border-border text-foreground-secondary',
                          )}
                          style={{ width: 18, height: 18 }}
                        >
                          <Check size={11} strokeWidth={3} />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={plan.name === 'Enterprise' ? '/contact' : '/register'}
                    className={clsx("btn mt-8 w-full btn-lg", plan.popular ? "btn-primary" : "btn-secondary")}
                  >
                    {plan.cta}
                  </a>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1}>
          <p className="mx-auto mt-10 max-w-xl text-center text-xs leading-relaxed text-foreground-tertiary">
            All prices in USD. Student & nonprofit discounts available — just ask. Enterprise plans include
            annual-only billing.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
