import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { Product, StorefrontSettings, QuoteItem, ProductStatus } from '../types';
import { mockProducts, mockStorefrontSettings } from '../data/mockData';
import { slugify } from '../utils';

interface StoreContextType {
  products: Product[];
  storefrontSettings: StorefrontSettings;
  quoteItems: QuoteItem[];
  addProduct: (productData: Omit<Product, 'id' | 'slug' | 'updatedAt'>) => void;
  updateProduct: (updatedProduct: Product) => void;
  deleteProduct: (productId: string) => void;
  duplicateProduct: (productId: string) => void;
  updateStorefrontSettings: (settings: StorefrontSettings) => void;
  addToQuote: (item: QuoteItem) => void;
  updateQuoteItem: (productId: string, variantId: string | undefined, quantity: number, notes: string) => void;
  removeFromQuote: (productId: string, variantId?: string) => void;
  clearQuote: () => void;
}

export const StoreContext = createContext<StoreContextType | undefined>(undefined);

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [storefrontSettings, setStorefrontSettings] = useState<StorefrontSettings>(mockStorefrontSettings);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);

  const addProduct = useCallback((productData: Omit<Product, 'id' | 'slug' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      slug: slugify(productData.name),
      updatedAt: new Date().toISOString(),
    };
    setProducts(prev => [newProduct, ...prev]);
  }, []);

  const updateProduct = useCallback((updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? { ...updatedProduct, updatedAt: new Date().toISOString(), slug: slugify(updatedProduct.name) } : p));
  }, []);

  const deleteProduct = useCallback((productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  }, []);

  const duplicateProduct = useCallback((productId: string) => {
    const originalProduct = products.find(p => p.id === productId);
    if (!originalProduct) return;

    // Find a unique name for the duplicated product
    let newName = `${originalProduct.name} (Copy)`;
    let counter = 2;
    while (products.some(p => p.name === newName)) {
        newName = `${originalProduct.name} (Copy ${counter})`;
        counter++;
    }
    
    const randomId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Deep copy the product and prepare it for the `addProduct` function
    const newProductData: Omit<Product, 'id' | 'slug' | 'updatedAt'> = {
        ...JSON.parse(JSON.stringify(originalProduct)),
        name: newName,
        status: ProductStatus.DRAFT, // Always default duplicated products to Draft
    };
    
    // Re-ID all nested elements to prevent key conflicts and ensure they are new entities
    newProductData.images = newProductData.images.map(img => ({...img, id: `img-${randomId()}`}));
    if (newProductData.images.length > 0) {
        const originalCover = originalProduct.images.find(img => img.id === originalProduct.coverImageId);
        const newCover = originalCover ? newProductData.images.find(img => img.url === originalCover.url) : null;
        newProductData.coverImageId = newCover ? newCover.id : newProductData.images[0]?.id;
    } else {
        newProductData.coverImageId = undefined;
    }
    
    newProductData.variants.groups = newProductData.variants.groups.map(group => ({...group, id: `vg-${randomId()}`}));
    newProductData.variants.combinations = newProductData.variants.combinations.map(combo => ({...combo, id: `combo-${randomId()}`}));
    newProductData.specs = newProductData.specs.map(spec => ({...spec, id: `spec-${randomId()}`}));
    newProductData.faq = newProductData.faq.map(f => ({...f, id: `faq-${randomId()}`}));

    addProduct(newProductData);
  }, [products, addProduct]);

  const updateStorefrontSettings = useCallback((settings: StorefrontSettings) => {
    setStorefrontSettings(settings);
  }, []);
  
  const addToQuote = useCallback((item: QuoteItem) => {
    setQuoteItems(prev => {
        const existingItem = prev.find(i => i.productId === item.productId && i.variantId === item.variantId);
        if (existingItem) {
            return prev.map(i => i.productId === item.productId && i.variantId === item.variantId ? { ...i, quantity: i.quantity + item.quantity } : i);
        }
        return [...prev, item];
    });
  }, []);

  const updateQuoteItem = useCallback((productId: string, variantId: string | undefined, quantity: number, notes: string) => {
    setQuoteItems(prev => prev.map(i => (i.productId === productId && i.variantId === variantId) ? {...i, quantity, notes } : i));
  }, []);
  
  const removeFromQuote = useCallback((productId: string, variantId?: string) => {
    setQuoteItems(prev => prev.filter(i => !(i.productId === productId && i.variantId === variantId)));
  }, []);

  const clearQuote = useCallback(() => {
    setQuoteItems([]);
  }, []);

  return (
    <StoreContext.Provider value={{
      products,
      storefrontSettings,
      quoteItems,
      addProduct,
      updateProduct,
      deleteProduct,
      duplicateProduct,
      updateStorefrontSettings,
      addToQuote,
      updateQuoteItem,
      removeFromQuote,
      clearQuote,
    }}>
      {children}
    </StoreContext.Provider>
  );
};