import React from 'react';
import HeadNav from '@/components/HeadNav';
import Footer from '@/components/Footer';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800 font-sans antialiased">
      <HeadNav />
      <main className="flex-grow pt-16">{children}</main>
      <Footer />
    </div>
  );
}
