import 'server-only';

import {
  mapProductRowToProduct,
  mapStorefrontRowToSettings,
  type ProductRow,
  type StorefrontRow,
} from '@/lib/storefront-transformers';
import type { Product, StorefrontSettings } from '@/types/storefront.types';
import { StorefrontStatus } from '@/types/storefront.types';
import { createSupabaseServerClientReadOnly, createSupabaseServerClientWritable } from './supabase-server';
import { slugify } from './utils.client';

export async function getStorefrontForUser(
  userId: string,
): Promise<{ settings: StorefrontSettings; products: Product[] } | null> {
  const supabase = await createSupabaseServerClientReadOnly();

  const { data: storefront, error } = await supabase
    .from('storefront_settings')
    .select('*')
    .eq('owner_user_id', userId)
    .maybeSingle<StorefrontRow>();

  if (error) {
    console.error('Failed to load storefront for user', error);
    return null;
  }

  if (!storefront) {
    return null;
  }

  const { data: productRows, error: productsError } = await supabase
    .from<ProductRow>('products')
    .select('*')
    .eq('store_id', storefront.id)
    .order('updated_at', { ascending: false });

  if (productsError) {
    console.error('Failed to load products for storefront', productsError);
    return null;
  }

  return {
    settings: mapStorefrontRowToSettings(storefront),
    products: (productRows ?? []).map(mapProductRowToProduct),
  };
}

export async function getStorefrontBySlug(
  slug: string,
): Promise<{ settings: StorefrontSettings; products: Product[] } | null> {
  const supabase = await createSupabaseServerClientReadOnly();

  const { data: storefront, error } = await supabase
    .from('storefront_settings')
    .select('*')
    .eq('slug', slug)
    .eq('status', StorefrontStatus.PUBLISHED)
    .eq('is_catalog_enabled', true)
    .maybeSingle<StorefrontRow>();

  if (error || !storefront) {
    return null;
  }

  const { data: productRows, error: productsError } = await supabase
    .from<ProductRow>('products')
    .select('*')
    .eq('store_id', storefront.id)
    .order('updated_at', { ascending: false });

  if (productsError) {
    console.error('Failed to load public products', productsError);
    return null;
  }

  return {
    settings: mapStorefrontRowToSettings(storefront),
    products: (productRows ?? []).map(mapProductRowToProduct),
  };
}

export async function getProductBySlug(
  storeId: string,
  productSlug: string,
): Promise<Product | null> {
  const supabase = await createSupabaseServerClientReadOnly();

  const { data, error } = await supabase
    .from<ProductRow>('products')
    .select('*')
    .eq('store_id', storeId)
    .eq('slug', productSlug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapProductRowToProduct(data);
}

export async function getAllProductsForStore(storeId: string): Promise<Product[]> {
  const supabase = await createSupabaseServerClientReadOnly();

  const { data, error } = await supabase
    .from<ProductRow>('products')
    .select('*')
    .eq('store_id', storeId)
    .order('updated_at', { ascending: false });

  if (error || !data) {
    console.error('Failed to load products for store', error);
    return [];
  }

  return data.map(mapProductRowToProduct);
}

export async function ensureStorefrontForUser(user: {
  id: string;
  name: string;
  email?: string | null;
}): Promise<{ settings: StorefrontSettings; products: Product[] } | null> {
  const existing = await getStorefrontForUser(user.id);
  if (existing) {
    return existing;
  }

  const writable = await createSupabaseServerClientWritable();
  const baseSlug =
    slugify(user.name) ||
    (user.email ? slugify(user.email.split('@')[0]!) : `store-${user.id.slice(0, 6)}`);

  let slugCandidate = baseSlug;
  let attempt = 1;
  let hasConflict = true;

  while (hasConflict) {
    const { data: conflict } = await writable
      .from('storefront_settings')
      .select('id')
      .eq('slug', slugCandidate)
      .maybeSingle();

    if (!conflict) {
      hasConflict = false;
      continue;
    }
    attempt += 1;
    slugCandidate = `${baseSlug}-${attempt}`;
  }

  const now = new Date().toISOString();

  const { error } = await writable.from('storefront_settings').insert({
    owner_user_id: user.id,
    name: user.name || 'Toko Saya',
    slug: slugCandidate,
    whatsapp_number: '',
    status: StorefrontStatus.UNLISTED,
    is_catalog_enabled: false,
    location_text: null,
    hours_text: null,
    theme: null,
    created_at: now,
    updated_at: now,
  });

  if (error) {
    console.error('Failed to seed storefront for user', error);
    return null;
  }

  return getStorefrontForUser(user.id);
}
