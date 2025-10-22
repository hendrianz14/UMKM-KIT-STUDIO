import React from 'react';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Preview from '@/components/Preview';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import CTASection from '@/components/CTASection';

export default function Page() {
  return (
    <>
      <Hero />
      <Features />
      <Preview />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTASection />
    </>
  );
}
