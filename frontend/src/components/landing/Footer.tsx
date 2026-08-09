import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Youtube, Mail } from 'lucide-react';
import { Logo } from './Logo';

const productLinks = [
  { label: 'Features', id: 'features' },
  { label: 'AI Assistant', id: 'ai' },
  { label: 'Automation', id: 'automation' },
  { label: 'Pricing', id: 'pricing' },
  { label: 'FAQ', id: 'faq' },
];

const resourceLinks = [
  { label: 'Documentation', href: '#' },
  { label: 'Contact', href: '/contact' },
  { label: 'About', id: 'about' },
];

const legalLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
];

const socials = [
  { label: 'Twitter / X', icon: Twitter, href: '#' },
  { label: 'GitHub', icon: Github, href: '#' },
  { label: 'LinkedIn', icon: Linkedin, href: '#' },
  { label: 'YouTube', icon: Youtube, href: '#' },
];

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

export function Footer() {
  return (
    <footer id="docs" className="relative border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <Logo size={40} />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-foreground-secondary">
              One workspace for personal productivity, team collaboration, AI, automation, and Agile project
              management.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground-secondary transition-all hover:-translate-y-0.5 hover:border-foreground-tertiary hover:text-foreground"
                >
                  <social.icon size={17} />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Product">
            {productLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => link.id && scrollTo(link.id)}
                className="text-left text-sm text-foreground-secondary transition-colors hover:text-foreground"
              >
                {link.label}
              </button>
            ))}
          </FooterColumn>

          <FooterColumn title="Resources">
            {resourceLinks.map((link) =>
              link.id ? (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => link.id && scrollTo(link.id)}
                  className="text-left text-sm text-foreground-secondary transition-colors hover:text-foreground"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  to={link.href!}
                  className="text-sm text-foreground-secondary transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ),
            )}
          </FooterColumn>

          <FooterColumn title="Legal">
            {legalLinks.map((link) => (
              <span
                key={link.label}
                className="text-sm text-foreground-secondary transition-colors hover:text-foreground"
              >
                {link.label}
              </span>
            ))}
          </FooterColumn>

          <FooterColumn title="Contact">
            <a
              href="mailto:support@tamad.app"
              className="inline-flex items-center gap-2 text-sm text-foreground-secondary transition-colors hover:text-foreground"
            >
              <Mail size={15} /> support@tamad.app
            </a>
            <span className="text-sm text-foreground-tertiary">Mon–Fri, 9:00–18:00 UTC</span>
          </FooterColumn>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border-light pt-8 sm:flex-row">
          <p className="text-sm text-foreground-tertiary">
            © {new Date().getFullYear()} TaMaD. All rights reserved.
          </p>
          <p className="text-sm text-foreground-tertiary">
            Organize your universe — everything in one workspace.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-bold tracking-wide text-foreground">{title}</h3>
      {children}
    </div>
  );
}
