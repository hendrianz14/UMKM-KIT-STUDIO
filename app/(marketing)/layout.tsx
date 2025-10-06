import React from 'react';
import HeadNav from '@/components/HeadNav';
import Footer from '@/components/Footer';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white text-gray-800 font-sans antialiased">
      <HeadNav />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
