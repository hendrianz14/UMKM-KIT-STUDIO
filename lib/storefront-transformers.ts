import {
  Storefront,
  StorefrontCartItem,
  StorefrontProduct,
  StorefrontProductImage,
  StorefrontQuoteRequest,
  StorefrontStatus,
  StorefrontProductStatus,
  StorefrontProductType,
  StorefrontThemeConfig,
} from "@/types/storefront.types";

type StorefrontSettingsRow = {
  id: string;
  owner_user_id?: string | null;
  name: string;
  slug: string;
  whatsapp_number: string;
  status?: StorefrontStatus | null;
  is_catalog_enabled?: boolean | null;
  location_text?: string | null;
  hours_text?: string | null;
  theme?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ProductRow = {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  short_description?: string | null;
  long_description?: string | null;
  category?: string | null;
  status?: StorefrontProductStatus | null;
  badges?: string[] | null;
  images?: unknown;
  cover_image_id?: string | null;
  price_type?: StorefrontProductType | null;
  price?: number | null;
  strikethrough_price?: number | null;
  variants?: Record<string, unknown> | null;
  specs?: Record<string, unknown> | null;
  faq?: Record<string, unknown> | null;
  pre_order_estimate?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type QuoteRow = {
  id: string;
  storefront_id: string;
  product_id?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  status?: string | null;
  created_at?: string | null;
};

const DEFAULT_THEME: StorefrontThemeConfig = {
  primaryColor: "#0D47A1",
  accentColor: "#FFC107",
  backgroundColor: "#F5F5F5",
  heroHeadline: "Tingkatkan penjualan produk Anda",
  heroSubheadline: "Buat katalog profesional dengan integrasi AI dalam hitungan menit.",
  heroCtaLabel: "Minta Penawaran",
  heroCtaLink: "#quote",
};

function parseObject<T extends Record<string, unknown>>(value: unknown, fallback: T): T {
  if (!value) {
    return { ...fallback };
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    return { ...fallback, ...(value as T) };
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return { ...fallback, ...(parsed as T) };
      }
    } catch {
      // ignore
    }
  }
  return { ...fallback };
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string");
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function parseImages(value: unknown, coverImageId?: string | null): StorefrontProductImage[] {
  if (!value) {
    return [];
  }

  const rawArray = Array.isArray(value) ? value : [];

  return rawArray.reduce<StorefrontProductImage[]>((acc, entry, index) => {
    if (!entry || typeof entry !== "object") {
      return acc;
    }

    const id =
      typeof (entry as { id?: string }).id === "string"
        ? (entry as { id: string }).id
        : coverImageId || `img-${index}`;

    const url =
      typeof (entry as { url?: string }).url === "string"
        ? (entry as { url: string }).url
        : null;

    if (!url) {
      return acc;
    }

    const alt =
      typeof (entry as { alt?: string | null }).alt === "string"
        ? (entry as { alt: string }).alt
        : null;
    const sortOrder =
      typeof (entry as { sortOrder?: number }).sortOrder === "number"
        ? (entry as { sortOrder: number }).sortOrder
        : index;

    acc.push({
      id,
      url,
      alt,
      sortOrder,
    });
    return acc;
  }, []);
}

export function slugify(value: string, fallback = "storefront"): string {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();

  return normalized || fallback;
}

export function mapStorefrontRow(row: StorefrontSettingsRow): Storefront {
  return {
    id: row.id,
    ownerId: row.owner_user_id ?? null,
    name: row.name,
    slug: row.slug,
    whatsappNumber: row.whatsapp_number,
    status: row.status ?? "Draft",
    isCatalogEnabled: Boolean(row.is_catalog_enabled ?? true),
    locationText: row.location_text ?? null,
    hoursText: row.hours_text ?? null,
    theme: parseObject<StorefrontThemeConfig>(row.theme, DEFAULT_THEME),
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

export function mapProductRow(row: ProductRow): StorefrontProduct {
  const images = parseImages(row.images, row.cover_image_id);

  return {
    id: row.id,
    storefrontId: row.store_id,
    type: (row.price_type ?? "fixed") as StorefrontProductType,
    status: (row.status ?? "Draft") as StorefrontProductStatus,
    slug: row.slug,
    name: row.name,
    sku: null,
    price: row.price ?? null,
    strikethroughPrice: row.strikethrough_price ?? null,
    shortDescription: row.short_description ?? null,
    longDescription: row.long_description ?? null,
    category: row.category ?? null,
    badges: parseStringArray(row.badges),
    images,
    variants: row.variants ?? null,
    specs: row.specs ?? null,
    faq: row.faq ?? null,
    preOrderEstimate: row.pre_order_estimate ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

export function mapQuoteRow(row: QuoteRow): StorefrontQuoteRequest {
  return {
    id: row.id,
    storefrontId: row.storefront_id,
    productId: row.product_id ?? null,
    name: row.name,
    email: row.email ?? null,
    phone: row.phone ?? null,
    message: row.message ?? null,
    status: (row.status ?? "new") as StorefrontQuoteRequest["status"],
    createdAt: row.created_at ?? null,
  };
}

export function serializeCartItems(items: StorefrontCartItem[]): string {
  return JSON.stringify(items);
}
