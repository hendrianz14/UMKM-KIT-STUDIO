'use client';

import React, { useMemo, useState } from 'react';

import { useStorefrontContext } from '@/contexts/StorefrontContext';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import type { AdminTab } from '@/components/AdminSidebar';
import OverviewView from '@/components/admin/OverviewView';
import ProductManagementView from '@/components/admin/ProductManagementView';
import StorePreviewView from '@/components/admin/StorePreviewView';
import SettingsView from '@/components/admin/SettingsView';

const DEFAULT_TAB: AdminTab = 'products';

const AdminView: React.FC = () => {
  const { storefront } = useStorefrontContext();
  const [activeTab, setActiveTab] = useState<AdminTab>(DEFAULT_TAB);

  const subtitle = useMemo(() => {
    if (!storefront) {
      return 'Siapkan storefront Anda untuk mulai berjualan.';
    }
    return `URL publik: kitstudio.shop/${storefront.slug}`;
  }, [storefront]);

  const content = useMemo(() => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView />;
      case 'products':
        return <ProductManagementView />;
      case 'preview':
        return <StorePreviewView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <ProductManagementView />;
    }
  }, [activeTab]);

  return (
    <AdminLayoutClient
      activeTab={activeTab}
      onTabChange={setActiveTab}
      title={storefront?.name ?? 'Storefront KitStudio'}
      subtitle={subtitle}
    >
      {content}
    </AdminLayoutClient>
  );
};

export default AdminView;

