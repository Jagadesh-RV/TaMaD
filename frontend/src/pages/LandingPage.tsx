import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { enableLandingScroll } from '../components/landing/scroll';
import { PublicNavbar } from '../components/landing/PublicNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { ShowcaseSection } from '../components/landing/ShowcaseSection';
import { ProblemSection } from '../components/landing/ProblemSection';
import { WhyTamadSection } from '../components/landing/WhyTamadSection';
import { WhatIsSection } from '../components/landing/WhatIsSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { AISection } from '../components/landing/AISection';
import { AutomationSection } from '../components/landing/AutomationSection';
import { TeamSection } from '../components/landing/TeamSection';
import { TestimonialsSection } from '../components/landing/TestimonialsSection';
import { PricingSection } from '../components/landing/PricingSection';
import { FAQSection } from '../components/landing/FAQSection';
import { CTASection } from '../components/landing/CTASection';
import { Footer } from '../components/landing/Footer';

export default function LandingPage() {
  useEffect(() => {
    enableLandingScroll();
    return () => {
      document.documentElement.classList.remove('landing-scroll');
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>TaMaD — One workspace for work, AI &amp; life</title>
        <meta
          name="description"
          content="TaMaD unifies personal productivity, team collaboration, AI, automation and Agile project management in one beautiful platform. Start free — no card required."
        />
      </Helmet>

      <div className="min-h-screen bg-white font-sans text-navy-900 antialiased selection:bg-brand-500/20 dark:bg-navy-950 dark:text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>

        <PublicNavbar />

        <main id="main-content">
          <HeroSection />
          <ShowcaseSection />
          <ProblemSection />
          <WhyTamadSection />
          <WhatIsSection />
          <FeaturesSection />
          <AISection />
          <AutomationSection />
          <TeamSection />
          <TestimonialsSection />
          <PricingSection />
          <FAQSection />
          <CTASection />
        </main>

        <Footer />
      </div>
    </>
  );
}
