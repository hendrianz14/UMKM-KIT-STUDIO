'use client';

import React, { useState } from 'react';
import type { Product } from '@/types/storefront.types';
import OverviewView from './admin/OverviewView';
import ProductManagementView from './admin/ProductManagementView';
import SettingsView from './admin/SettingsView';
import ProductEditView from './admin/ProductEditView';
import StorePreviewView from './admin/StorePreviewView';
import { HomeIcon } from './icons/HomeIcon';
import { TagIcon } from './icons/TagIcon';
import { CogIcon } from './icons/CogIcon';
import { StorefrontIcon } from './icons/StorefrontIcon';
import { useStore } from '@/hooks/useStore';

type AdminNav = 'overview' | 'products' | 'settings' | 'store-preview';

const AdminView: React.FC = () => {
    const { storefrontSettings } = useStore();
    const [activeNav, setActiveNav] = useState<AdminNav>('overview');
    const [editingProduct, setEditingProduct] = useState<Product | null | 'new'>(null);

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
    ];
    
    const activeLabel = navItems.find(item => item.id === activeNav)?.label || 'Admin';

    const renderContent = () => {
        if (editingProduct !== null) {
            return <ProductEditView productToEdit={editingProduct === 'new' ? null : editingProduct} onBack={handleFinishEditing} />;
        }

        switch (activeNav) {
            case 'overview': return <OverviewView />;
            case 'products': return <ProductManagementView onEditProduct={handleStartEdit} onNewProduct={handleStartNew} />;
            case 'settings': return <SettingsView />;
            case 'store-preview': return <StorePreviewView />;
            default: return <OverviewView />;
        }
    };

    return (
        <div className="flex h-screen bg-light font-sans">
            {/* Sidebar for Desktop */}
            <aside className="w-64 bg-white shadow-md flex-shrink-0 hidden md:flex md:flex-col">
                <div className="p-6 border-b">
                  <h1 className="text-2xl font-bold text-primary">{storefrontSettings.name}</h1>
                  <p className="text-sm text-gray-600">Admin Panel</p>
                </div>
                <nav className="p-4">
                    <ul>
                        {navItems.map(item => (
                            <li key={item.id}>
                                <button
                                    onClick={() => { setEditingProduct(null); setActiveNav(item.id as AdminNav); }}
                                    className={`w-full flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 text-base ${
                                        activeNav === item.id && editingProduct === null
                                            ? 'bg-secondary text-white font-bold'
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

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="md:hidden bg-white shadow-sm p-4 sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-gray-800">{editingProduct ? 'Edit Produk' : activeLabel}</h2>
                </header>
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
                    {renderContent()}
                </main>
            </div>

            {/* Bottom Navigation for Mobile */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-20 flex justify-around">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => { setEditingProduct(null); setActiveNav(item.id as AdminNav); }}
                        className={`flex flex-col items-center justify-center text-center p-2 w-full transition-colors duration-200 ${
                            activeNav === item.id && editingProduct === null
                                ? 'text-secondary font-bold'
                                : 'text-gray-500 hover:text-secondary'
                        }`}
                        aria-current={activeNav === item.id && editingProduct === null}
                    >
                        {item.icon}
                        <span className="text-xs mt-1">{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default AdminView;
