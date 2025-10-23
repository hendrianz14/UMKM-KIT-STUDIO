'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClientWritable } from '@/utils/supabase/server';
import {
  fetchStorefrontBySlug,
  mapProductRow,
  mapStorefrontRow,
  type ProductRow,
  type StorefrontRow,
} from '@/lib/storefront/queries';
import {
  mapProductInsertResult,
  mapProductToInsertRow,
  mapProductToUpdateRow,
  mapProductUpdateResult,
  mapStorefrontToUpdateRow,
} from '@/lib/storefront/mutations';
import type {
  NewProductInput,
  Product,
  StorefrontPayload,
  StorefrontSettingsUpdate,
} from '@/lib/storefront/types';

async function getStorefrontRowById(storefrontId: string) {
  const supabase = await createSupabaseServerClientWritable();
  const { data, error } = await supabase
    .from('storefront_settings')
    .select('*')
    .eq('id', storefrontId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Storefront tidak ditemukan');
  }

  return data as StorefrontRow;
}

export async function loadStorefrontForAdmin(
  slug?: string,
): Promise<StorefrontPayload | null> {
  if (slug) {
    return fetchStorefrontBySlug(slug);
  }

  const supabase = await createSupabaseServerClientWritable();
  const { data, error } = await supabase
    .from('storefront_settings')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const storefrontRow = data as StorefrontRow;
  const {
    data: productRows,
    error: productsError,
  } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', storefrontRow.id)
    .order('updated_at', { ascending: false, nullsLast: true });

  if (productsError) {
    throw productsError;
  }

  const storefront = mapStorefrontRow(storefrontRow);
  const products = (productRows ?? []).map((row) =>
    mapProductRow(row as ProductRow),
  );

  return { storefront, products };
}

export async function updateStorefrontSettingsAction(
  storeId: string,
  updates: StorefrontSettingsUpdate,
) {
  const supabase = await createSupabaseServerClientWritable();
  const currentRow = await getStorefrontRowById(storeId);
  const currentSettings = mapStorefrontRow(currentRow);
  const payload = mapStorefrontToUpdateRow(currentSettings, updates);

  const { data, error } = await supabase
    .from('storefront_settings')
    .update({
      slug: payload.slug,
      name: payload.name,
      whatsapp_number: payload.whatsapp_number,
      status: payload.status,
      is_catalog_enabled: payload.is_catalog_enabled,
      location_text: payload.location_text,
      hours_text: payload.hours_text,
      owner_user_id: payload.owner_user_id,
      theme: payload.theme,
    })
    .eq('id', storeId)
    .select('*')
    .maybeSingle();

  if (error) {
    // Tangani pelanggaran unik slug agar lebih ramah untuk UI
    // Postgres unique_violation code: 23505
    // PostgREST biasanya melampirkan code ini
    if (typeof (error as any).code === 'string' && (error as any).code === '23505') {
      throw new Error('SLUG_TAKEN');
    }
    throw error;
  }

  if (!data) {
    // 0 rows matched the filter (id not found)
    throw new Error('STORE_NOT_FOUND');
  }
  const updated = mapStorefrontRow(data as StorefrontRow);

  revalidatePath(`/shop/${currentSettings.slug}`);
  if (currentSettings.slug !== updated.slug) {
    revalidatePath(`/shop/${updated.slug}`);
  }

  return updated;
}

export async function createStorefrontProductAction(
  storeId: string,
  storeSlug: string,
  input: NewProductInput,
) {
  const supabase = await createSupabaseServerClientWritable();
  const { data: slugRows, error: slugsError } = await supabase
    .from('products')
    .select('slug')
    .eq('store_id', storeId);

  if (slugsError) {
    throw slugsError;
  }

  const existingSlugs = new Set((slugRows ?? []).map((row) => row.slug as string));
  const insertRow = mapProductToInsertRow(storeId, input, existingSlugs);

  const { data, error } = await supabase
    .from('products')
    .insert(insertRow)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  const created = mapProductInsertResult(data as ProductRow);
  revalidatePath(`/shop/${storeSlug}`);
  return created;
}

export async function updateStorefrontProductAction(
  storeId: string,
  storeSlug: string,
  product: Product,
) {
  const supabase = await createSupabaseServerClientWritable();
  const updateRow = mapProductToUpdateRow({
    ...product,
    storeId,
  });

  const { data, error } = await supabase
    .from('products')
    .update(updateRow)
    .eq('id', product.id)
    .eq('store_id', storeId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  const updated = mapProductUpdateResult(data as ProductRow);
  revalidatePath(`/shop/${storeSlug}`);
  return updated;
}

export async function deleteStorefrontProductAction(
  storeId: string,
  storeSlug: string,
  productId: string,
) {
  const supabase = await createSupabaseServerClientWritable();
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('store_id', storeId);

  if (error) {
    throw error;
  }

  revalidatePath(`/shop/${storeSlug}`);
}
