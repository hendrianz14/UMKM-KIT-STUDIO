import { createSupabaseServerClientReadOnly } from '@/utils/supabase/server';
import {
  PriceType,
  Product,
  ProductStatus,
  StockStatus,
  StorefrontPayload,
  StorefrontSettings,
  StorefrontStatus,
  VariantCombination,
  VariantGroup,
} from './types';

export type Nullable<T> = T | null | undefined;

export interface StorefrontRow {
  id: string;
  name: string;
  slug: string;
  whatsapp_number: string;
  status: string | null;
  is_catalog_enabled: boolean | null;
  location_text?: string | null;
  hours_text?: string | null;
  owner_user_id?: string | null;
  theme?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ProductRow {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  short_description?: string | null;
  long_description?: string | null;
  category?: string | null;
  status?: string | null;
  badges?: Nullable<string[]>;
  images?: Nullable<Product['images']>;
  cover_image_id?: Nullable<string>;
  price_type?: string | null;
  price?: Nullable<number>;
  strikethrough_price?: Nullable<number>;
  variants?: Nullable<Product['variants']>;
  specs?: Nullable<Product['specs']>;
  faq?: Nullable<Product['faq']>;
  pre_order_estimate?: Nullable<string>;
  updated_at?: Nullable<string>;
  created_at?: Nullable<string>;
}

const resolveProductStatus = (value: string): ProductStatus => {
  if (Object.values(ProductStatus).includes(value as ProductStatus)) {
    return value as ProductStatus;
  }
  return ProductStatus.DRAFT;
};

const resolvePriceType = (value: string | null | undefined): PriceType => {
  if (value && Object.values(PriceType).includes(value as PriceType)) {
    return value as PriceType;
  }
  return PriceType.SINGLE;
};

const resolveStorefrontStatus = (value: string | null | undefined): StorefrontStatus => {
  if (value && Object.values(StorefrontStatus).includes(value as StorefrontStatus)) {
    return value as StorefrontStatus;
  }
  return StorefrontStatus.OFF;
};

const resolveStockStatus = (value: string | null | undefined): StockStatus => {
  if (value && Object.values(StockStatus).includes(value as StockStatus)) {
    return value as StockStatus;
  }
  return StockStatus.AVAILABLE;
};

export const normalizeVariantGroups = (
  groups: Nullable<VariantGroup[]>,
): VariantGroup[] => {
  if (!groups) return [];
  return groups.map((group) => ({
    id: group.id,
    name: group.name,
    options: [...group.options],
  }));
};

export const normalizeVariantCombinations = (
  combinations: Nullable<VariantCombination[]>,
): VariantCombination[] => {
  if (!combinations) return [];
  return combinations.map((combination) => ({
    ...combination,
    stockStatus: resolveStockStatus(combination.stockStatus),
  }));
};

export const mapStorefrontRow = (row: StorefrontRow): StorefrontSettings => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  whatsappNumber: row.whatsapp_number,
  status: resolveStorefrontStatus(row.status ?? undefined),
  isCatalogEnabled: row.is_catalog_enabled ?? true,
  locationText: row.location_text ?? undefined,
  hoursText: row.hours_text ?? undefined,
  ownerUserId: row.owner_user_id ?? null,
  theme: row.theme ?? null,
  createdAt: row.created_at ?? undefined,
  updatedAt: row.updated_at ?? undefined,
});

export const mapProductRow = (row: ProductRow): Product => ({
  id: row.id,
  storeId: row.store_id,
  name: row.name,
  slug: row.slug,
  shortDescription: row.short_description ?? '',
  longDescription: row.long_description ?? '',
  category: row.category ?? '',
  status: resolveProductStatus(row.status ?? ProductStatus.DRAFT),
  badges: Array.isArray(row.badges) ? row.badges : [],
  images: Array.isArray(row.images) ? row.images : [],
  coverImageId: row.cover_image_id ?? undefined,
  priceType: resolvePriceType(row.price_type),
  price: typeof row.price === 'number' ? row.price : undefined,
  strikethroughPrice:
    typeof row.strikethrough_price === 'number'
      ? row.strikethrough_price
      : undefined,
  variants: {
    groups: normalizeVariantGroups(row.variants?.groups ?? []),
    combinations: normalizeVariantCombinations(row.variants?.combinations ?? []),
  },
  specs: Array.isArray(row.specs) ? row.specs : [],
  faq: Array.isArray(row.faq) ? row.faq : [],
  updatedAt: row.updated_at ?? new Date().toISOString(),
  preOrderEstimate: row.pre_order_estimate ?? undefined,
  createdAt: row.created_at ?? undefined,
});

export async function fetchStorefrontBySlug(
  slug: string,
): Promise<StorefrontPayload | null> {
  const supabase = await createSupabaseServerClientReadOnly();

  const { data: storefrontRow, error: storefrontError } = await supabase
    .from('storefront_settings')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (storefrontError) {
    if ('code' in storefrontError && storefrontError.code === 'PGRST116') {
      return null;
    }
    throw storefrontError;
  }

  if (!storefrontRow) {
    return null;
  }

  const typedStorefrontRow = storefrontRow as StorefrontRow;

  const { data: productRows, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', typedStorefrontRow.id)
    .order('updated_at', { ascending: false });

  if (productsError) {
    throw productsError;
  }

  const storefront = mapStorefrontRow(typedStorefrontRow);
  const products = (productRows ?? []).map((row) => mapProductRow(row as ProductRow));

  return { storefront, products };
}

export async function fetchStorefrontProductBySlug(
  storeSlug: string,
  productSlug: string,
): Promise<{ payload: StorefrontPayload; product: Product } | null> {
  const payload = await fetchStorefrontBySlug(storeSlug);
  if (!payload) {
    return null;
  }

  const product = payload.products.find((item) => item.slug === productSlug);

  if (!product) {
    return null;
  }

  return { payload, product };
}
