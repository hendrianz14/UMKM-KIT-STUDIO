import React from 'react';
import GalleryPage from '@/components/GalleryPage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function GalleryRoute() {
  return <GalleryPage />;
}

