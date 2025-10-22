export type StorefrontStatus = "Draft" | "Published" | "Archived" | string;

export type StorefrontProductStatus = "Draft" | "Published" | "Archived" | string;

export type StorefrontProductType = "fixed" | "variable" | "custom" | string;

export interface StorefrontThemeConfig extends Record<string, unknown> {
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  heroImageUrl?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  heroCtaLabel?: string;
  heroCtaLink?: string;
}

export interface Storefront {
  id: string;
  ownerId: string | null;
  name: string;
  slug: string;
  whatsappNumber: string;
  status: StorefrontStatus | null;
  isCatalogEnabled: boolean;
  locationText?: string | null;
  hoursText?: string | null;
  theme: StorefrontThemeConfig | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface StorefrontProductImage {
  id: string;
  url: string;
  alt?: string | null;
  sortOrder: number;
}

export interface StorefrontProduct {
  id: string;
  storefrontId: string;
  type: StorefrontProductType;
  status: StorefrontProductStatus;
  slug: string;
  name: string;
  sku?: string | null;
  price?: number | null;
  strikethroughPrice?: number | null;
  shortDescription?: string | null;
  longDescription?: string | null;
  category?: string | null;
  badges: string[];
  images: StorefrontProductImage[];
  variants?: Record<string, unknown> | null;
  specs?: Record<string, unknown> | null;
  faq?: Record<string, unknown> | null;
  preOrderEstimate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface StorefrontQuoteRequest {
  id: string;
  storefrontId: string;
  productId?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  status: "new" | "contacted" | "closed";
  createdAt?: string | null;
}

export interface StorefrontCartItem {
  productId: string;
  quantity: number;
  note?: string | null;
}

export type StorefrontProductInput = {
  name: string;
  slug?: string;
  sku?: string | null;
  type?: StorefrontProductType;
  status?: StorefrontProductStatus;
  price?: number | null;
  strikethroughPrice?: number | null;
  category?: string | null;
  shortDescription?: string | null;
  longDescription?: string | null;
  highlights?: string[] | null;
  images?: Array<{
    url: string;
    altText?: string | null;
    sortOrder?: number;
  }>;
  variants?: Record<string, unknown> | null;
  specs?: Record<string, unknown> | null;
  faq?: Record<string, unknown> | null;
  preOrderEstimate?: string | null;
};

export interface StorefrontUpdatePayload {
  name?: string;
  slug?: string;
  whatsappNumber?: string;
  status?: StorefrontStatus | null;
  isCatalogEnabled?: boolean;
  locationText?: string | null;
  hoursText?: string | null;
  theme?: Partial<StorefrontThemeConfig>;
}

export interface StorefrontHydrationPayload {
  storefront: Storefront | null;
  products: StorefrontProduct[];
  quotes: StorefrontQuoteRequest[];
}

