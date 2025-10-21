export enum ProductStatus {
    DRAFT = 'Draft',
    PUBLISHED = 'Published',
    UNLISTED = 'Unlisted',
    UNAVAILABLE = 'Unavailable',
    PRE_ORDER = 'Pre-Order',
}
  
export enum PriceType {
    SINGLE = 'single',
    VARIANT = 'variant',
}
  
export enum StockStatus {
    AVAILABLE = 'available',
    SOLDOUT = 'soldout',
}
  
export enum StorefrontStatus {
    PUBLISHED = 'Published',
    UNLISTED = 'Unlisted',
    OFF = 'Off',
}
  
export interface ProductImage {
    id: string;
    url: string;
    altText: string;
}
  
export interface VariantGroup {
    id: string;
    name: string;
    options: string[];
}
  
export interface VariantCombination {
    id: string;
    options: Record<string, string>;
    price: number;
    strikethroughPrice?: number;
    askOnWA: boolean;
    stockStatus: StockStatus;
}
  
export interface ProductSpec {
    id: string;
    title: string;
    items: string[];
}
  
export interface ProductFAQ {
    id: string;
    question: string;
    answer: string;
}
  
export interface Product {
    id: string;
    name: string;
    slug: string;
    shortDescription: string;
    longDescription: string;
    category: string;
    status: ProductStatus;
    badges: string[];
    images: ProductImage[];
    coverImageId?: string;
    priceType: PriceType;
    price?: number;
    strikethroughPrice?: number;
    variants: {
        groups: VariantGroup[];
        combinations: VariantCombination[];
    };
    specs: ProductSpec[];
    faq: ProductFAQ[];
    updatedAt: string;
    preOrderEstimate?: string;
}
  
export interface StorefrontSettings {
    name: string;
    slug: string;
    whatsappNumber: string;
    status: StorefrontStatus;
    isCatalogEnabled: boolean;
    locationText?: string;
    hoursText?: string;
}
  
export interface QuoteItem {
    productId: string;
    variantId?: string;
    quantity: number;
    notes: string;
}