import React from 'react';
import CreditsHistoryPage from '@/components/CreditsHistoryPage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function CreditsHistoryRoute() {
  return <CreditsHistoryPage />;
}

