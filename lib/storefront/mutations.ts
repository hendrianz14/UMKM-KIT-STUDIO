import {
  mapProductRow,
  type ProductRow,
  type StorefrontRow,
} from './queries';
import {
  NewProductInput,
  Product,
  StorefrontSettings,
  StorefrontSettingsUpdate,
} from './types';
import { slugify } from './utils';

type StorefrontUpdateRow = Omit<
  StorefrontRow,
  'created_at' | 'updated_at'
> & {
  status?: string;
};

export const mapStorefrontToUpdateRow = (
  settings: StorefrontSettings,
  updates: StorefrontSettingsUpdate,
): StorefrontUpdateRow => {
  const next: StorefrontSettings = {
    ...settings,
    ...updates,
  };

  return {
    id: settings.id,
    slug: next.slug,
    name: next.name,
    whatsapp_number: next.whatsappNumber,
    status: next.status,
    is_catalog_enabled: next.isCatalogEnabled,
    location_text: next.locationText ?? null,
    hours_text: next.hoursText ?? null,
    owner_user_id: next.ownerUserId ?? null,
    theme: next.theme ?? null,
  };
};

export const mapProductToInsertRow = (
  storefrontId: string,
  product: NewProductInput,
  existingSlugs: Set<string>,
): Omit<ProductRow, 'id'> => {
  const timestamp = new Date().toISOString();
  const baseSlug = slugify(product.name);
  let uniqueSlug = baseSlug;
  let counter = 2;

  while (existingSlugs.has(uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return {
    store_id: storefrontId,
    name: product.name,
    slug: uniqueSlug,
    short_description: product.shortDescription,
    long_description: product.longDescription,
    category: product.category,
    status: product.status,
    badges: product.badges,
    images: product.images,
    cover_image_id: product.coverImageId ?? null,
    price_type: product.priceType,
    price: product.price ?? null,
    strikethrough_price: product.strikethroughPrice ?? null,
    variants: product.variants,
    specs: product.specs,
    faq: product.faq,
    pre_order_estimate: product.preOrderEstimate ?? null,
    updated_at: timestamp,
  };
};

export const mapProductToUpdateRow = (product: Product): Partial<ProductRow> => ({
  id: product.id,
  store_id: product.storeId,
  name: product.name,
  slug: product.slug,
  short_description: product.shortDescription,
  long_description: product.longDescription,
  category: product.category,
  status: product.status,
  badges: product.badges,
  images: product.images,
  cover_image_id: product.coverImageId ?? null,
  price_type: product.priceType,
  price: product.price ?? null,
  strikethrough_price: product.strikethroughPrice ?? null,
  variants: product.variants,
  specs: product.specs,
  faq: product.faq,
  pre_order_estimate: product.preOrderEstimate ?? null,
  updated_at: new Date().toISOString(),
});

export const mapProductInsertResult = (row: ProductRow): Product =>
  mapProductRow(row);

export const mapProductUpdateResult = (row: ProductRow): Product =>
  mapProductRow(row);
