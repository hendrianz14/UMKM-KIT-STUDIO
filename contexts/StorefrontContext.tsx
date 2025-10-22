'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import type {
  Storefront,
  StorefrontCartItem,
  StorefrontHydrationPayload,
  StorefrontProduct,
  StorefrontProductInput,
  StorefrontQuoteRequest,
  StorefrontUpdatePayload,
} from '@/types/storefront.types';

interface StorefrontContextValue {
  storefront: Storefront | null;
  products: StorefrontProduct[];
  quotes: StorefrontQuoteRequest[];
  cartItems: StorefrontCartItem[];
  activeProductId: string | null;
  isMutating: boolean;
  setActiveProductId: (productId: string | null) => void;
  refresh: () => Promise<void>;
  createProduct: (input: StorefrontProductInput) => Promise<StorefrontProduct>;
  updateProduct: (productId: string, input: StorefrontProductInput) => Promise<StorefrontProduct>;
  deleteProduct: (productId: string) => Promise<void>;
  duplicateProduct: (productId: string) => Promise<StorefrontProduct>;
  updateStorefront: (payload: StorefrontUpdatePayload) => Promise<Storefront>;
  submitQuote: (payload: {
    name: string;
    email?: string | null;
    phone?: string | null;
    message?: string | null;
    productId?: string | null;
  }) => Promise<StorefrontQuoteRequest>;
  addCartItem: (productId: string, quantity?: number) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  removeCartItem: (productId: string) => void;
  resetCart: () => void;
}

interface StorefrontProviderProps {
  children: ReactNode;
  initialStorefront?: Storefront | null;
  initialProducts?: StorefrontProduct[];
  initialQuotes?: StorefrontQuoteRequest[];
  initialActiveProductId?: string | null;
}

type ApiError = {
  error?: string;
  message?: string;
};

const StorefrontContext = createContext<StorefrontContextValue | undefined>(undefined);

async function fetchJson<TResponse>(input: RequestInfo, init?: RequestInit): Promise<TResponse> {
  const response = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json().catch(() => null)) as TResponse | ApiError | null;

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && ('error' in payload || 'message' in payload)
        ? (payload.error ?? payload.message)
        : null) ?? 'Terjadi kesalahan pada permintaan storefront.';
    throw new Error(message);
  }

  return payload as TResponse;
}

export function StorefrontContextProvider({
  children,
  initialStorefront = null,
  initialProducts = [],
  initialQuotes = [],
  initialActiveProductId = null,
}: StorefrontProviderProps) {
  const [storefront, setStorefront] = useState<Storefront | null>(initialStorefront);
  const [products, setProducts] = useState<StorefrontProduct[]>(initialProducts);
  const [quotes, setQuotes] = useState<StorefrontQuoteRequest[]>(initialQuotes);
  const [cartItems, setCartItems] = useState<StorefrontCartItem[]>([]);
  const [activeProductId, setActiveProductIdState] = useState<string | null>(initialActiveProductId);
  const [isMutating, setIsMutating] = useState(false);

  const refresh = useCallback(async () => {
    const data = await fetchJson<StorefrontHydrationPayload>('/api/storefront');
    setStorefront(data.storefront);
    setProducts(data.products);
    setQuotes(data.quotes);
  }, []);

  const setActiveProductId = useCallback((productId: string | null) => {
    setActiveProductIdState(productId);
  }, []);

  const createProduct = useCallback(
    async (input: StorefrontProductInput) => {
      setIsMutating(true);
      try {
        const product = await fetchJson<StorefrontProduct>('/api/storefront/products', {
          method: 'POST',
          body: JSON.stringify(input),
        });
        setProducts((prev) => [product, ...prev]);
        setActiveProductIdState(product.id);
        return product;
      } finally {
        setIsMutating(false);
      }
    },
    [],
  );

  const updateProduct = useCallback(
    async (productId: string, input: StorefrontProductInput) => {
      setIsMutating(true);
      try {
        const product = await fetchJson<StorefrontProduct>(`/api/storefront/products/${productId}`, {
          method: 'PATCH',
          body: JSON.stringify(input),
        });
        setProducts((prev) => prev.map((item) => (item.id === product.id ? product : item)));
        return product;
      } finally {
        setIsMutating(false);
      }
    },
    [],
  );

  const deleteProduct = useCallback(async (productId: string) => {
    setIsMutating(true);
    try {
      await fetchJson<void>(`/api/storefront/products/${productId}`, {
        method: 'DELETE',
      });
      setProducts((prev) => prev.filter((product) => product.id !== productId));
      setCartItems((prev) => prev.filter((item) => item.productId !== productId));
      if (activeProductId === productId) {
        setActiveProductIdState(null);
      }
    } finally {
      setIsMutating(false);
    }
  }, [activeProductId]);

  const duplicateProduct = useCallback(async (productId: string) => {
    setIsMutating(true);
    try {
      const product = await fetchJson<StorefrontProduct>(
        `/api/storefront/products/${productId}/duplicate`,
        {
          method: 'POST',
        },
      );
      setProducts((prev) => [product, ...prev]);
      setActiveProductIdState(product.id);
      return product;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const updateStorefront = useCallback(
    async (payload: StorefrontUpdatePayload) => {
      if (!storefront) {
        throw new Error('Storefront belum siap.');
      }
      setIsMutating(true);
      try {
        const updated = await fetchJson<Storefront>('/api/storefront', {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        setStorefront(updated);
        return updated;
      } finally {
        setIsMutating(false);
      }
    },
    [storefront],
  );

  const submitQuote = useCallback(
    async (payload: {
      name: string;
      email?: string | null;
      phone?: string | null;
      message?: string | null;
      productId?: string | null;
    }) => {
      if (!storefront) {
        throw new Error('Storefront belum siap.');
      }
      const quote = await fetchJson<StorefrontQuoteRequest>('/api/storefront/quotes', {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          storefrontId: storefront.id,
        }),
      });
      setQuotes((prev) => [quote, ...prev]);
      return quote;
    },
    [storefront],
  );

  const addCartItem = useCallback((productId: string, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(1, item.quantity + quantity) }
            : item,
        );
      }
      return [...prev, { productId, quantity: Math.max(1, quantity) }];
    });
  }, []);

  const updateCartItemQuantity = useCallback((productId: string, quantity: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeCartItem = useCallback((productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const resetCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const value = useMemo<StorefrontContextValue>(
    () => ({
      storefront,
      products,
      quotes,
      cartItems,
      activeProductId,
      isMutating,
      setActiveProductId,
      refresh,
      createProduct,
      updateProduct,
      deleteProduct,
      duplicateProduct,
      updateStorefront,
      submitQuote,
      addCartItem,
      updateCartItemQuantity,
      removeCartItem,
      resetCart,
    }),
    [
      storefront,
      products,
      quotes,
      cartItems,
      activeProductId,
      isMutating,
      setActiveProductId,
      refresh,
      createProduct,
      updateProduct,
      deleteProduct,
      duplicateProduct,
      updateStorefront,
      submitQuote,
      addCartItem,
      updateCartItemQuantity,
      removeCartItem,
      resetCart,
    ],
  );

  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>;
}

export function useStorefrontContext(): StorefrontContextValue {
  const context = useContext(StorefrontContext);

  if (!context) {
    throw new Error('useStorefrontContext harus digunakan di dalam StorefrontContextProvider.');
  }

  return context;
}

