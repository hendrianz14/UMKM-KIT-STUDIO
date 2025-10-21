import React, { useState, useEffect } from 'react';
import { StoreProvider } from './context/StoreContext';
import AdminView from './views/AdminView';
import PublicView from './views/PublicView';
import ProductDetailView from './views/ProductDetailView';
import DemoWalkthrough from './components/DemoWalkthrough';
import Header from './components/Header';
import QuoteDrawer from './components/QuoteDrawer';

// A layout component for all public-facing pages to ensure consistency.
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isQuoteDrawerOpen, setIsQuoteDrawerOpen] = useState(false);
    return (
      <div className="bg-light min-h-screen font-sans text-gray-800">
        <Header onQuoteClick={() => setIsQuoteDrawerOpen(true)} />
        <main>{children}</main>
        <QuoteDrawer isOpen={isQuoteDrawerOpen} onClose={() => setIsQuoteDrawerOpen(false)} />
      </div>
    );
  };

const App: React.FC = () => {
    const [path, setPath] = useState(window.location.pathname);

    useEffect(() => {
        const onLocationChange = () => {
            setPath(window.location.pathname);
        };
        
        const handlePushState = () => {
          setTimeout(onLocationChange, 0);
        };

        window.addEventListener('popstate', onLocationChange);
        window.addEventListener('pushstate', handlePushState);

        return () => {
            window.removeEventListener('popstate', onLocationChange);
            window.removeEventListener('pushstate', handlePushState);
        };
    }, []);

    const renderPage = () => {
        if (path.startsWith('/admin')) {
            return (
                <>
                    <AdminView />
                    <DemoWalkthrough />
                </>
            );
        }
        
        const productMatch = path.match(/\/shop\/([^/]+)\/product\/([^/]+)/);
        if (productMatch) {
            const [, storeSlug, productSlug] = productMatch;
            return <PublicLayout><ProductDetailView storeSlug={storeSlug} productSlug={productSlug} /></PublicLayout>;
        }

        const storeMatch = path.match(/\/shop\/([^/]+)/);
        if (storeMatch) {
            const [, storeSlug] = storeMatch;
            return <PublicLayout><PublicView storeSlug={storeSlug} /></PublicLayout>;
        }

        // Fallback to admin for the demo. In a real app, this would be a 404 page.
        return (
            <>
                <AdminView />
                <DemoWalkthrough />
            </>
        );
    };

    return (
        <StoreProvider>
            {renderPage()}
        </StoreProvider>
    );
};

export default App;