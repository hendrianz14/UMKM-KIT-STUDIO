"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import {
  mapProductRowToProduct,
  mapProductToRow,
  mapSettingsToRow,
  mapStorefrontRowToSettings,
  type ProductRow,
  type StorefrontRow,
} from '@/lib/storefront-transformers';
import { slugify } from '@/lib/utils.client';
import type { Product, QuoteItem, StorefrontSettings } from '@/types/storefront.types';
import { ProductStatus } from '@/types/storefront.types';

interface StorefrontContextValue {
  storefrontSettings: StorefrontSettings;
  products: Product[];
  quoteItems: QuoteItem[];
  addProduct: (productData: Omit<Product, 'id' | 'slug' | 'updatedAt' | 'createdAt' | 'storeId'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  duplicateProduct: (productId: string) => Promise<void>;
  updateStorefrontSettings: (settings: StorefrontSettings) => Promise<void>;
  addToQuote: (item: QuoteItem) => void;
  updateQuoteItem: (productId: string, variantId: string | undefined, quantity: number, notes: string) => void;
  removeFromQuote: (productId: string, variantId?: string) => void;
  clearQuote: () => void;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setStorefrontSettings: React.Dispatch<React.SetStateAction<StorefrontSettings>>;
}

const StorefrontContext = createContext<StorefrontContextValue | null>(null);

export function StorefrontProvider({
  children,
  initialProducts,
  initialSettings,
}: {
  children: ReactNode;
  initialProducts: Product[];
  initialSettings: StorefrontSettings;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [storefrontSettings, setStorefrontSettings] =
    useState<StorefrontSettings>(initialSettings);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const storageKey = useMemo(
    () =>
      storefrontSettings?.id
        ? `storefront_quote_${storefrontSettings.id}`
        : null,
    [storefrontSettings?.id],
  );
  const hasLoadedPersistedQuotes = useRef(false);

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (!storageKey) {
      return;
    }

    hasLoadedPersistedQuotes.current = false;

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as QuoteItem[];
        if (Array.isArray(parsed)) {
          setQuoteItems(parsed);
        } else {
          setQuoteItems([]);
        }
      } else {
        setQuoteItems([]);
      }
    } catch (error) {
      console.error('Failed to load persisted quote items', error);
      setQuoteItems([]);
    } finally {
      hasLoadedPersistedQuotes.current = true;
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (!storageKey) {
      return;
    }
    if (!hasLoadedPersistedQuotes.current) {
      return;
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(quoteItems));
    } catch (error) {
      console.error('Failed to persist quote items', error);
    }
  }, [quoteItems, storageKey]);

  const addProduct = useCallback<StorefrontContextValue['addProduct']>(
    async (productData) => {
      if (!storefrontSettings?.id) {
        throw new Error('Storefront belum dikonfigurasi.');
      }

      const slug = slugify(productData.name);
      const row = {
        ...mapProductToRow(productData, storefrontSettings.id, slug),
        store_id: storefrontSettings.id,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('products')
        .insert(row)
        .select()
        .single<ProductRow>();

      if (error) {
        console.error('createProduct failed', error);
        throw error;
      }

      const mapped = mapProductRowToProduct(data);
      setProducts((prev) => [mapped, ...prev]);
      handleRefresh();
    },
    [handleRefresh, storefrontSettings.id, supabase],
  );

  const updateProduct = useCallback<StorefrontContextValue['updateProduct']>(
    async (product) => {
      if (!product.id || !storefrontSettings.id) {
        throw new Error('Produk atau store tidak valid.');
      }

      const slug = slugify(product.name);
      const row = {
        ...mapProductToRow(product, storefrontSettings.id, slug),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('products')
        .update(row)
        .eq('id', product.id)
        .select()
        .single<ProductRow>();

      if (error) {
        console.error('updateProduct failed', error);
        throw error;
      }

      const updated = mapProductRowToProduct(data);
      setProducts((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      handleRefresh();
    },
    [handleRefresh, storefrontSettings.id, supabase],
  );

  const deleteProduct = useCallback<StorefrontContextValue['deleteProduct']>(
    async (productId) => {
      const { error } = await supabase.from('products').delete().eq('id', productId);

      if (error) {
        throw error;
      }

      setProducts((prev) => prev.filter((item) => item.id !== productId));
      handleRefresh();
    },
    [handleRefresh, supabase],
  );

  const duplicateProduct = useCallback<
    StorefrontContextValue['duplicateProduct']
  >(
    async (productId) => {
      const original = products.find((item) => item.id === productId);
      if (!original) {
        return;
      }

      let newName = `${original.name} (Copy)`;
      let counter = 2;
      while (products.some((item) => item.name === newName)) {
        newName = `${original.name} (Copy ${counter})`;
        counter += 1;
      }

      const randomId = () => crypto.randomUUID();

      const clone: Omit<Product, 'id' | 'slug' | 'updatedAt' | 'storeId' | 'createdAt'> =
        JSON.parse(JSON.stringify(original));
      clone.name = newName;
      clone.status = ProductStatus.DRAFT;
      clone.images = clone.images.map((image) => {
        const newId = `img-${randomId()}`;
        return {
          ...image,
          id: newId,
        };
      });

      if (clone.images.length > 0) {
        const originalCover = original.images.find(
          (image) => image.id === original.coverImageId,
        );
        const matchedCover = originalCover
          ? clone.images.find((image) => image.url === originalCover.url)
          : null;
        clone.coverImageId = matchedCover?.id ?? clone.images[0].id;
      } else {
        clone.coverImageId = undefined;
      }

      clone.variants.groups = clone.variants.groups.map((group) => ({
        ...group,
        id: `vg-${randomId()}`,
      }));
      clone.variants.combinations = clone.variants.combinations.map((combo) => ({
        ...combo,
        id: `combo-${randomId()}`,
      }));
      clone.specs = clone.specs.map((spec) => ({
        ...spec,
        id: `spec-${randomId()}`,
      }));
      clone.faq = clone.faq.map((faq) => ({
        ...faq,
        id: `faq-${randomId()}`,
      }));

      await addProduct(clone);
    },
    [addProduct, products],
  );

  const updateStorefrontSettings = useCallback<
    StorefrontContextValue['updateStorefrontSettings']
  >(
    async (settings) => {
      const { error, data } = await supabase
        .from('storefront_settings')
        .update(mapSettingsToRow(settings))
        .eq('id', settings.id)
        .select()
        .single<StorefrontRow>();

      if (error) {
        throw error;
      }

      const mapped = mapStorefrontRowToSettings(data);
      setStorefrontSettings(mapped);
      handleRefresh();
    },
    [handleRefresh, supabase],
  );

  const addToQuote = useCallback<StorefrontContextValue['addToQuote']>((item) => {
    setQuoteItems((prev) => {
      const index = prev.findIndex(
        (quote) => quote.productId === item.productId && quote.variantId === item.variantId,
      );
      if (index === -1) {
        return [...prev, item];
      }
      const next = [...prev];
      next[index] = {
        ...next[index],
        quantity: next[index].quantity + item.quantity,
      };
      return next;
    });
  }, []);

  const updateQuoteItem = useCallback<StorefrontContextValue['updateQuoteItem']>(
    (productId, variantId, quantity, notes) => {
      setQuoteItems((prev) =>
        prev.map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity, notes }
            : item,
        ),
      );
    },
    [],
  );

  const removeFromQuote = useCallback<StorefrontContextValue['removeFromQuote']>(
    (productId, variantId) => {
      setQuoteItems((prev) =>
        prev.filter((item) => !(item.productId === productId && item.variantId === variantId)),
      );
    },
    [],
  );

  const clearQuote = useCallback(() => {
    setQuoteItems([]);
  }, []);

  const value = useMemo<StorefrontContextValue>(
    () => ({
      storefrontSettings,
      products,
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
      setProducts,
      setStorefrontSettings,
    }),
    [
      storefrontSettings,
      products,
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
    ],
  );

  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>;
}

export function useStorefront() {
  const ctx = useContext(StorefrontContext);
  if (!ctx) {
    throw new Error('useStorefront must be used within StorefrontProvider');
  }
  return ctx;
}
