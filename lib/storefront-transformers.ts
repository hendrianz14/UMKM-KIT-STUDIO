import {
  PriceType,
  Product,
  ProductFAQ,
  ProductImage,
  ProductSpec,
  ProductStatus,
  StorefrontSettings,
  StorefrontStatus,
  VariantCombination,
  VariantGroup,
} from '@/types/storefront.types';

export type ProductRow = {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  short_description: string | null;
  long_description: string | null;
  category: string | null;
  status: ProductStatus;
  badges: string[] | null;
  images: ProductImage[] | null;
  cover_image_id: string | null;
  price_type: PriceType;
  price: number | null;
  strikethrough_price: number | null;
  variants: {
    groups: VariantGroup[];
    combinations: VariantCombination[];
  } | null;
  specs: ProductSpec[] | null;
  faq: ProductFAQ[] | null;
  pre_order_estimate: string | null;
  updated_at: string;
  created_at: string;
};

export type StorefrontRow = {
  id: string;
  owner_user_id: string;
  name: string;
  slug: string;
  whatsapp_number: string | null;
  status: StorefrontStatus;
  is_catalog_enabled: boolean;
  location_text: string | null;
  hours_text: string | null;
  theme: Record<string, unknown> | null;
  created_at: string;
  updated_at: string | null;
};

export function mapProductRowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    storeId: row.store_id,
    name: row.name,
    slug: row.slug,
    shortDescription: row.short_description ?? '',
    longDescription: row.long_description ?? '',
    category: row.category ?? '',
    status: row.status,
    badges: row.badges ?? [],
    images: row.images ?? [],
    coverImageId: row.cover_image_id ?? undefined,
    priceType: row.price_type,
    price: row.price ?? undefined,
    strikethroughPrice: row.strikethrough_price ?? undefined,
    variants:
      row.variants ??
      ({
        groups: [],
        combinations: [],
      } as Product['variants']),
    specs: row.specs ?? [],
    faq: row.faq ?? [],
    preOrderEstimate: row.pre_order_estimate ?? undefined,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
}

export function mapProductToRow(
  product: Partial<Product> & { name: string },
  storeId: string,
  slug: string,
): Partial<ProductRow> {
  return {
    store_id: storeId,
    name: product.name,
    slug,
    short_description: product.shortDescription ?? '',
    long_description: product.longDescription ?? '',
    category: product.category ?? '',
    status: product.status ?? ProductStatus.DRAFT,
    badges: product.badges ?? [],
    images: product.images ?? [],
    cover_image_id: product.coverImageId ?? null,
    price_type: product.priceType ?? PriceType.SINGLE,
    price: product.price ?? null,
    strikethrough_price: product.strikethroughPrice ?? null,
    variants: product.variants ?? { groups: [], combinations: [] },
    specs: product.specs ?? [],
    faq: product.faq ?? [],
    pre_order_estimate: product.preOrderEstimate ?? null,
  };
}

export function mapStorefrontRowToSettings(row: StorefrontRow): StorefrontSettings {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    name: row.name,
    slug: row.slug,
    whatsappNumber: row.whatsapp_number ?? '',
    status: row.status,
    isCatalogEnabled: row.is_catalog_enabled,
    locationText: row.location_text,
    hoursText: row.hours_text,
    theme: row.theme,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapSettingsToRow(
  settings: Partial<StorefrontSettings> & { name: string },
): Partial<StorefrontRow> {
  return {
    name: settings.name,
    slug: settings.slug ?? '',
    whatsapp_number: settings.whatsappNumber ?? null,
    status: settings.status ?? StorefrontStatus.UNLISTED,
    is_catalog_enabled: settings.isCatalogEnabled ?? false,
    location_text: settings.locationText ?? null,
    hours_text: settings.hoursText ?? null,
    theme: settings.theme ?? null,
  };
}
