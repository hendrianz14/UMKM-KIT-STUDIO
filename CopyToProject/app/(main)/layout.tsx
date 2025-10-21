import React from 'react';
import Header from '@/components/Header';
import QuoteDrawer from '@/components/QuoteDrawer';
import { QuoteProvider } from '@/context/QuoteContext';
import { StorefrontSettings, Product } from '@/types';
// Ganti ini dengan data fetching asli Anda
import { mockStorefrontSettings, mockProducts } from '@/data/mockData';

// Placeholder data fetching. Ganti dengan logika asli Anda,
// misalnya mengambil settings berdasarkan domain atau parameter.
async function getLayoutData() {
    return {
        settings: mockStorefrontSettings,
        products: mockProducts
    };
}

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { settings, products } = await getLayoutData();

  return (
    // Body dan html tag akan otomatis ditambahkan oleh Next.js
    <QuoteProvider>
      <LayoutClientWrapper settings={settings} products={products}>
        {children}
      </LayoutClientWrapper>
    </QuoteProvider>
  )
}

// Komponen wrapper ini diperlukan agar Header & QuoteDrawer, yang merupakan Client Components,
// bisa dirender di dalam Server Component Layout dan mengakses context dari QuoteProvider.
'use client';
import { useState } from 'react';

const LayoutClientWrapper = ({
    children,
    settings,
    products
}: {
    children: React.ReactNode,
    settings: StorefrontSettings,
    products: Product[]
}) => {
    const [isQuoteDrawerOpen, setIsQuoteDrawerOpen] = useState(false);
    return (
        <>
            <Header 
                settings={settings}
                onQuoteClick={() => setIsQuoteDrawerOpen(true)} 
            />
            <main>{children}</main>
            <QuoteDrawer
                isOpen={isQuoteDrawerOpen}
                onClose={() => setIsQuoteDrawerOpen(false)}
                settings={settings}
                products={products}
            />
        </>
    )
}