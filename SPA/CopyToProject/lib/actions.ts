'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from './supabaseClient';
import { Product, StorefrontSettings } from '@/types';
import { slugify } from './utils';

const STORE_ID = 'store-id-placeholder'; // Ganti dengan ID toko yang aktif

// Helper function untuk menangani error
const handleError = (error: any, context: string) => {
    console.error(`Error in ${context}:`, error);
    return { success: false, error: error.message };
}

// Aksi untuk Produk
export async function createProductAction(productData: Omit<Product, 'id' | 'slug' | 'updatedAt'>) {
    try {
        const newProduct: Omit<Product, 'id'> = {
            ...productData,
            slug: slugify(productData.name),
            updatedAt: new Date().toISOString(),
            // store_id: STORE_ID, // Uncomment dan sesuaikan field ini
        };

        const { error } = await supabase.from('products').insert([newProduct]);
        if (error) throw error;
        
        revalidatePath('/admin/products');
        return { success: true };
    } catch (error) {
        return handleError(error, 'createProductAction');
    }
}

export async function updateProductAction(product: Product) {
    try {
        const updatedProduct = {
            ...product,
            slug: slugify(product.name),
            updatedAt: new Date().toISOString(),
        };

        const { error } = await supabase.from('products').update(updatedProduct).eq('id', product.id);
        if (error) throw error;

        revalidatePath('/admin/products');
        revalidatePath(`/admin/products/edit/${product.id}`);
        // Juga revalidasi halaman publik jika produknya published
        revalidatePath(`/products/${product.slug}`);
        return { success: true };
    } catch (error) {
        return handleError(error, 'updateProductAction');
    }
}

export async function deleteProductAction(productId: string) {
    try {
        const { error } = await supabase.from('products').delete().eq('id', productId);
        if (error) throw error;

        revalidatePath('/admin/products');
        return { success: true };
    } catch (error) {
        return handleError(error, 'deleteProductAction');
    }
}

// Aksi untuk Pengaturan Toko
export async function updateSettingsAction(settings: StorefrontSettings) {
    try {
        const { error } = await supabase.from('storefront_settings').update(settings).eq('slug', settings.slug);
        if (error) throw error;

        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error) {
        return handleError(error, 'updateSettingsAction');
    }
}