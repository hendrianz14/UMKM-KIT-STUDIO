'use client';

import { useState } from 'react';
import Link from 'next/link';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';
import HomeIcon from '../icons/HomeIcon';
import TagIcon from '../icons/TagIcon';
import CogIcon from '../icons/CogIcon';
import StorefrontIcon from '../icons/StorefrontIcon';
import { useStorefront } from '../StorefrontProvider';
import type { Product } from '@/lib/storefront/types';
import OverviewView from './OverviewView';
import ProductManagementView from './ProductManagementView';
import SettingsView from './SettingsView';
import StorePreviewView from './StorePreviewView';
import ProductEditView from './ProductEditView';

type AdminNav = 'overview' | 'products' | 'settings' | 'store-preview';

const StorefrontAdminView = () => {
  const { storefront } = useStorefront();
  const [activeNav, setActiveNav] = useState<AdminNav>('overview');
  const [editingProduct, setEditingProduct] = useState<Product | null | 'new'>(
    null,
  );

  const handleStartEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleStartNew = () => {
    setEditingProduct('new');
  };

  const handleFinishEditing = () => {
    setEditingProduct(null);
    setActiveNav('products');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <HomeIcon /> },
    { id: 'products', label: 'Produk', icon: <TagIcon /> },
    { id: 'settings', label: 'Pengaturan', icon: <CogIcon /> },
    { id: 'store-preview', label: 'Preview', icon: <StorefrontIcon /> },
  ] as const;

  const activeLabel =
    navItems.find((item) => item.id === activeNav)?.label ?? 'Admin';

  const renderContent = () => {
    if (editingProduct !== null) {
      return (
        <ProductEditView
          productToEdit={editingProduct === 'new' ? null : editingProduct}
          onBack={handleFinishEditing}
        />
      );
    }

    switch (activeNav) {
      case 'overview':
        return <OverviewView />;
      case 'products':
        return (
          <ProductManagementView
            onEditProduct={handleStartEdit}
            onNewProduct={handleStartNew}
          />
        );
      case 'settings':
        return <SettingsView />;
      case 'store-preview':
        return <StorePreviewView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-light font-sans">
      <aside className="hidden w-64 flex-shrink-0 flex-col bg-white shadow-md md:flex">
        <div className="border-b p-6">
          <h1 className="text-2xl font-bold text-primary">{storefront.name}</h1>
          <p className="text-sm text-gray-600">Admin Panel</p>
        </div>
        <nav className="p-4">
          <ul>
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setActiveNav(item.id);
                  }}
                  className={`my-1 flex w-full items-center rounded-lg px-4 py-3 text-base transition-colors duration-200 ${
                    activeNav === item.id && editingProduct === null
                      ? 'bg-secondary font-bold text-white'
                      : 'text-gray-700 hover:bg-light'
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Back to Dashboard */}
        <div className="bg-white border-b p-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary"
          >
            <ArrowLeftIcon />
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>
        <header className="sticky top-0 z-10 bg-white p-4 shadow-sm md:hidden">
          <h2 className="text-xl font-bold text-gray-800">
            {editingProduct ? 'Edit Produk' : activeLabel}
          </h2>
        </header>
        <main className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 md:pb-8 lg:p-8">
          {renderContent()}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-20 flex justify-around border-t bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:hidden">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setEditingProduct(null);
              setActiveNav(item.id);
            }}
            className={`flex w-full flex-col items-center justify-center p-2 text-center text-xs transition-colors duration-200 ${
              activeNav === item.id && editingProduct === null
                ? 'font-bold text-secondary'
                : 'text-gray-500 hover:text-secondary'
            }`}
            aria-current={
              activeNav === item.id && editingProduct === null ? 'page' : false
            }
          >
            {item.icon}
            <span className="mt-1">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default StorefrontAdminView;
