'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  NewProductInput,
  Product,
  ProductStatus,
  QuoteItem,
  StorefrontSettings,
  StorefrontSettingsUpdate,
} from '@/lib/storefront/types';
import {
  createStorefrontProductAction,
  deleteStorefrontProductAction,
  updateStorefrontProductAction,
  updateStorefrontSettingsAction,
} from '@/app/storefront/actions';

interface StorefrontContextValue {
  storefront: StorefrontSettings;
  products: Product[];
  quoteItems: QuoteItem[];
  addToQuote: (item: QuoteItem) => void;
  updateQuoteItem: (
    productId: string,
    variantId: string | undefined,
    quantity: number,
    notes: string,
  ) => void;
  removeFromQuote: (productId: string, variantId?: string) => void;
  clearQuote: () => void;
  addProduct: (productData: NewProductInput) => Promise<Product>;
  updateProduct: (product: Product) => Promise<Product>;
  deleteProduct: (productId: string) => Promise<void>;
  duplicateProduct: (productId: string) => Promise<Product>;
  updateStorefrontSettings: (
    updates: StorefrontSettingsUpdate,
  ) => Promise<StorefrontSettings>;
}

const StorefrontContext = createContext<StorefrontContextValue | null>(null);

interface StorefrontProviderProps {
  storefront: StorefrontSettings;
  products: Product[];
  children: ReactNode;
}

export const StorefrontProvider = ({
  storefront,
  products,
  children,
}: StorefrontProviderProps) => {
  const [storefrontState, setStorefrontState] =
    useState<StorefrontSettings>(storefront);
  const [productState, setProductState] = useState<Product[]>(products);
  // Initialize cart from localStorage synchronously to avoid empty flash when navigating back
  const initialCartKey = storefront.id || storefront.slug;
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(`umkm_cart_${initialCartKey}`);
        if (raw) {
          const parsed = JSON.parse(raw) as QuoteItem[];
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    setStorefrontState(storefront);
  }, [storefront]);

  useEffect(() => {
    setProductState(products);
  }, [products]);

  // Persist quote/cart items per-storefront in localStorage so they survive refresh/navigation
  const storageKey = useMemo(
    () => `umkm_cart_${storefrontState.id || storefrontState.slug}`,
    [storefrontState.id, storefrontState.slug],
  );

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as QuoteItem[];
        if (Array.isArray(parsed)) {
          setQuoteItems(parsed);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(quoteItems));
      }
    } catch {
      // ignore storage errors
    }
  }, [storageKey, quoteItems]);

  const addToQuote = useCallback((item: QuoteItem) => {
    setQuoteItems((prev) => {
      const existingItem = prev.find(
        (value) =>
          value.productId === item.productId &&
          value.variantId === item.variantId,
      );

      if (existingItem) {
        return prev.map((value) =>
          value.productId === item.productId && value.variantId === item.variantId
            ? { ...value, quantity: value.quantity + item.quantity }
            : value,
        );
      }

      return [...prev, item];
    });
  }, []);

  const updateQuoteItem = useCallback(
    (
      productId: string,
      variantId: string | undefined,
      quantity: number,
      notes: string,
    ) => {
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

  const removeFromQuote = useCallback((productId: string, variantId?: string) => {
    setQuoteItems((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.variantId === variantId),
      ),
    );
  }, []);

  const clearQuote = useCallback(() => {
    setQuoteItems([]);
  }, []);

  const addProduct = useCallback(
    async (productData: NewProductInput) => {
      const createdProduct = await createStorefrontProductAction(
        storefrontState.id,
        storefrontState.slug,
        productData,
      );
      setProductState((prev) => [createdProduct, ...prev]);
      return createdProduct;
    },
    [storefrontState.id, storefrontState.slug],
  );

  const updateProduct = useCallback(
    async (product: Product) => {
      const updated = await updateStorefrontProductAction(
        storefrontState.id,
        storefrontState.slug,
        product,
      );
      setProductState((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      return updated;
    },
    [storefrontState.id, storefrontState.slug],
  );

  const deleteProduct = useCallback(
    async (productId: string) => {
      await deleteStorefrontProductAction(
        storefrontState.id,
        storefrontState.slug,
        productId,
      );
      setProductState((prev) => prev.filter((item) => item.id !== productId));
    },
    [storefrontState.id, storefrontState.slug],
  );

  const duplicateProduct = useCallback(
    async (productId: string) => {
      const original = productState.find((item) => item.id === productId);
      if (!original) {
        throw new Error('Produk tidak ditemukan untuk duplikasi');
      }

      const randomId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      let newName = `${original.name} (Copy)`;
      let counter = 2;
      const existingNames = new Set(productState.map((item) => item.name));
      while (existingNames.has(newName)) {
        newName = `${original.name} (Copy ${counter})`;
        counter += 1;
      }

      const duplicate: NewProductInput = {
        storeId: storefrontState.id,
        name: newName,
        shortDescription: original.shortDescription,
        longDescription: original.longDescription,
        category: original.category,
        status: ProductStatus.DRAFT,
        images: original.images.map((image) => ({
          ...image,
          id: `img-${randomId()}`,
        })),
        coverImageId: undefined,
        badges: [...original.badges],
        priceType: original.priceType,
        price: original.price,
        strikethroughPrice: original.strikethroughPrice,
        variants: {
          groups: original.variants.groups.map((group) => ({
            ...group,
            id: `vg-${randomId()}`,
          })),
          combinations: original.variants.combinations.map((combination) => ({
            ...combination,
            id: `combo-${randomId()}`,
          })),
        },
        specs: original.specs.map((spec) => ({
          ...spec,
          id: `spec-${randomId()}`,
        })),
        faq: original.faq.map((faq) => ({
          ...faq,
          id: `faq-${randomId()}`,
        })),
        preOrderEstimate: original.preOrderEstimate,
      };

      if (duplicate.images.length > 0) {
        const originalCover = original.images.find(
          (image) => image.id === original.coverImageId,
        );
        if (originalCover) {
          const newCover = duplicate.images.find(
            (image) => image.url === originalCover.url,
          );
          duplicate.coverImageId = newCover?.id ?? duplicate.images[0].id;
        } else {
          duplicate.coverImageId = duplicate.images[0].id;
        }
      }

      const created = await createStorefrontProductAction(
        storefrontState.id,
        storefrontState.slug,
        duplicate,
      );
      setProductState((prev) => [created, ...prev]);
      return created;
    },
    [productState, storefrontState.id, storefrontState.slug],
  );

  const updateStorefrontSettings = useCallback(
    async (updates: StorefrontSettingsUpdate) => {
      const updated = await updateStorefrontSettingsAction(
        storefrontState.id,
        updates,
      );
      setStorefrontState(updated);
      return updated;
    },
    [storefrontState.id],
  );

  const value = useMemo(
    () => ({
      storefront: storefrontState,
      products: productState,
      quoteItems,
      addToQuote,
      updateQuoteItem,
      removeFromQuote,
      clearQuote,
      addProduct,
      updateProduct,
      deleteProduct,
      duplicateProduct,
      updateStorefrontSettings,
    }),
    [
      storefrontState,
      productState,
      quoteItems,
      addToQuote,
      updateQuoteItem,
      removeFromQuote,
      clearQuote,
      addProduct,
      updateProduct,
      deleteProduct,
      duplicateProduct,
      updateStorefrontSettings,
    ],
  );

  return (
    <StorefrontContext.Provider value={value}>
      {children}
    </StorefrontContext.Provider>
  );
};

export const useStorefront = () => {
  const context = useContext(StorefrontContext);
  if (!context) {
    throw new Error('useStorefront must be used within a StorefrontProvider');
  }
  return context;
};
