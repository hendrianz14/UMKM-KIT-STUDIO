import 'server-only'; // Memastikan kode ini hanya berjalan di server
import { supabase } from './supabaseClient';
import { Product, StorefrontSettings, ProductStatus } from '@/types';
import { mockProducts, mockStorefrontSettings } from '@/data/mockData'; // Placeholder, hapus jika sudah pakai DB

// NOTE: Ganti nama tabel (e.g., 'storefront_settings', 'products') dengan nama tabel Anda di Supabase.

export async function getStoreSettingsBySlug(slug: string): Promise<StorefrontSettings | null> {
  // return mockStorefrontSettings; // Hapus ini jika sudah pakai DB
  const { data, error } = await supabase
    .from('storefront_settings')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching storefront settings:', error);
    return null;
  }
  return data as StorefrontSettings;
}

export async function getPublicProductsByStoreId(storeId: string): Promise<Product[]> {
  // return mockProducts.filter(p => p.status !== ProductStatus.DRAFT && p.status !== ProductStatus.UNLISTED); // Hapus ini jika sudah pakai DB
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', storeId)
    .in('status', [ProductStatus.PUBLISHED, ProductStatus.UNAVAILABLE, ProductStatus.PRE_ORDER]); 

  if (error) {
    console.error('Error fetching public products:', error);
    return [];
  }
  return data as Product[];
}

export async function getProductBySlug(productSlug: string, storeId: string): Promise<Product | null> {
  // return mockProducts.find(p => p.slug === productSlug) || null; // Hapus ini jika sudah pakai DB
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', productSlug)
    .eq('store_id', storeId)
    .single();

  if (error) {
    console.error(`Error fetching product by slug "${productSlug}":`, error);
    return null;
  }
  return data as Product;
}

// Contoh fungsi untuk mendapatkan semua produk (termasuk draft) untuk admin
export async function getAllProductsByStoreId(storeId: string): Promise<Product[]> {
    // return mockProducts; // Hapus ini jika sudah pakai DB
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId);

    if (error) {
        console.error('Error fetching all admin products:', error);
        return [];
    }
    return data as Product[];
}