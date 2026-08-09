import { Quote, Star } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  hue: number;
}

const testimonials: Testimonial[] = [
  {
    quote:
      'We replaced four tools on day one. Our velocity report went up 18% the first sprint — mostly because people finally stopped redoing each other\u2019s work.',
    name: 'Priya Raman',
    role: 'Engineering Lead',
    company: 'Fathom Analytics',
    hue: 262,
  },
  {
    quote:
      'The AI is the first one that actually knows our context. It summarized three months of meeting chaos into a roadmap my whole team finally agrees on.',
    name: 'Daniel Osei',
    role: 'Product Manager',
    company: 'Orbit Health',
    hue: 190,
  },
  {
    quote:
      'Automation paid for itself in week one. New client intake used to cost us a day of copying data around — now it just happens.',
    name: 'Elena Rossi',
    role: 'Founder & CEO',
    company: 'Studio Lume',
    hue: 22,
  },
  {
    quote:
      'As a two-person startup we couldn\u2019t justify the enterprise stack. TaMaD gave us the whole thing, for the price of a couple of coffees.',
    name: 'Tom Beckett',
    role: 'Co-founder',
    company: 'Nimbus Labs',
    hue: 155,
  },
  {
    quote:
      'Whiteboards, docs, sprints and meetings all in one place. The knowledge base actually gets used now because the info never gets lost in another app.',
    name: 'Sofia Lindqvist',
    role: 'Head of Ops',
    company: 'Northwind',
    hue: 330,
  },
  {
    quote:
      'I was the skeptic on the team. Then I built my first automation in four minutes and now I automate everything I touch.',
    name: 'Marcus Chen',
    role: 'Full-stack Engineer',
    company: 'Paperplane',
    hue: 210,
  },
];

const featured: Testimonial = {
  quote:
    'TaMaD is the first platform that treats an entire organization as one connected system — tasks, docs, meetings and goals in a single nervous system. It feels less like a tool and more like the way a company should think.',
  name: 'Amara Nwosu',
  role: 'COO',
  company: 'Lumen Collective',
  hue: 45,
};

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title={<>Loved by teams who <span className="font-serif italic text-foreground-secondary">hated the clutter</span></>}
          subtitle="Hundreds of teams have consolidated their stack on TaMaD. Here's what they say when we ask why."
        />

        <Reveal>
          <figure className="card relative mx-auto mb-8 max-w-4xl overflow-hidden p-8 md:p-12">
            <Quote size={96} className="absolute -right-4 -top-4 text-border" aria-hidden="true" />
            <blockquote className="relative text-balance text-xl font-semibold leading-relaxed text-foreground md:text-2xl">
              “{featured.quote}”
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-background bg-foreground"
              >
                AN
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{featured.name}</p>
                <p className="text-xs text-foreground-secondary">
                  {featured.role} · {featured.company}
                </p>
              </div>
              <div className="ml-auto hidden items-center gap-1 sm:flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className="fill-foreground text-foreground" />
                ))}
              </div>
            </figcaption>
          </figure>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={(index % 3) * 0.07}>
              <figure className="card flex h-full flex-col p-6 hover:-translate-y-1 transition-transform duration-300">
                <div className="mb-4 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} className="fill-foreground text-foreground" />
                  ))}
                </div>
                <blockquote className="flex-1 text-[13.5px] leading-relaxed text-foreground-secondary">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border-light pt-5">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-background bg-foreground"
                  >
                    {testimonial.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-foreground">{testimonial.name}</p>
                    <p className="text-[11.5px] text-foreground-secondary">
                      {testimonial.role} · {testimonial.company}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
