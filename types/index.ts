// types/index.ts

// Enum for product status. Matches the 'status' column in the 'products' table.
export enum ProductStatus {
    DRAFT = 'Draft',
    PUBLISHED = 'Published',
    UNAVAILABLE = 'Unavailable',
    PRE_ORDER = 'Pre-Order',
}
  
// Enum for product price type. Matches the 'price_type' column.
export enum PriceType {
    SINGLE = 'single',
    VARIANT = 'variant',
}
  
// Enum for stock status within the 'variants' JSON.
export enum StockStatus {
    AVAILABLE = 'available',
    SOLDOUT = 'soldout',
}
  
// Interface for a single image object within the 'images' JSON array.
export interface ProductImage {
    id: string;
    url: string;
    altText: string;
}
  
// Interface for a variant group within the 'variants' JSON.
export interface VariantGroup {
    id: string;
    name: string;
    options: string[];
}
  
// Interface for a single variant combination within the 'variants' JSON.
export interface VariantCombination {
    id: string;
    options: Record<string, string>; // e.g., { "Ukuran": "L", "Warna": "Biru" }
    price: number;
    strikethroughPrice?: number;
    askOnWA: boolean;
    stockStatus: StockStatus;
}
  
// Interface for a specification group within the 'specs' JSON.
export interface ProductSpec {
    id: string;
    title: string; // e.g., "Material", "Ukuran & Berat"
    items: string[]; // e.g., ["Katun Combed 30s", "Sablon Plastisol"]
}
  
// Interface for an FAQ item within the 'faq' JSON.
export interface ProductFAQ {
    id: string;
    question: string;
    answer: string;
}
  
// Main interface for a Product, matching the 'products' table schema.
export interface Product {
    id: string; // text
    store_id: string; // uuid
    name: string; // text
    slug: string; // text
    short_description: string; // text
    long_description: string; // text
    category: string; // text
    status: ProductStatus; // text
    badges: string[]; // text[]
    images: ProductImage[]; // jsonb
    cover_image_id?: string; // text
    price_type: PriceType; // text
    price?: number; // numeric
    strikethrough_price?: number; // numeric
    variants: { // jsonb
        groups: VariantGroup[];
        combinations: VariantCombination[];
    };
    specs: ProductSpec[]; // jsonb
    faq: ProductFAQ[]; // jsonb
    pre_order_estimate?: string; // text
    updated_at: string; // timestamptz
    created_at: string; // timestamptz
}
  
// Main interface for Storefront Settings, matching the 'storefront_settings' table schema.
export interface StorefrontSettings {
    id: string; // uuid
    name: string; // text
    slug: string; // text
    whatsapp_number: string; // text
    status: string; // text, e.g., 'Published'
    is_catalog_enabled: boolean; // boolean
    location_text?: string; // text
    hours_text?: string; // text
    created_at: string; // timestamptz
}
  
// Interface for items in the quote/cart context.
export interface QuoteItem {
    productId: string;
    variantId?: string;
    quantity: number;
    notes: string;
}