import { redirect } from 'next/navigation';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Preview from '@/components/Preview';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import CTASection from '@/components/CTASection';
import { createSupabaseServerClientReadOnly } from '@/utils/supabase/server';

export default async function Page() {
  const supabase = await createSupabaseServerClientReadOnly();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

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
