import { Product, StorefrontSettings, ProductStatus, PriceType, StockStatus, StorefrontStatus } from '../types';

export const mockProducts: Product[] = [
  {
    id: 'template-1',
    name: 'Contoh: Baju Kaos Keren',
    slug: 'contoh-baju-kaos',
    shortDescription: 'Ini adalah contoh produk fashion. Ganti deskripsi ini dengan penjelasan singkat tentang produk Anda.',
    longDescription: `Jelaskan produk Anda secara detail di sini. Anda bisa menceritakan tentang bahan, kualitas, atau keunikan dari produk Anda.
    
    Setiap baris baru akan menjadi paragraf baru.`,
    category: 'Fashion',
    status: ProductStatus.DRAFT,
    badges: ["Baru"],
    images: [
      { id: 'img-tpl-1-1', url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', altText: 'Contoh kaos putih polos' },
      { id: 'img-tpl-1-2', url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', altText: 'Contoh kaos hitam polos' },
    ],
    coverImageId: 'img-tpl-1-1',
    priceType: PriceType.VARIANT,
    variants: {
      groups: [
        { id: 'vg-tpl-1', name: 'Ukuran', options: ['S', 'M', 'L', 'XL'] },
        { id: 'vg-tpl-2', name: 'Warna', options: ['Putih', 'Hitam'] }
      ],
      combinations: [
        { id: 'combo-tpl-1-s-w', options: { 'Ukuran': 'S', 'Warna': 'Putih' }, price: 85000, stockStatus: StockStatus.AVAILABLE, askOnWA: false },
        { id: 'combo-tpl-1-m-w', options: { 'Ukuran': 'M', 'Warna': 'Putih' }, price: 85000, stockStatus: StockStatus.AVAILABLE, askOnWA: false },
        { id: 'combo-tpl-1-l-w', options: { 'Ukuran': 'L', 'Warna': 'Putih' }, price: 85000, stockStatus: StockStatus.SOLDOUT, askOnWA: false },
        { id: 'combo-tpl-1-xl-w', options: { 'Ukuran': 'XL', 'Warna': 'Putih' }, price: 90000, stockStatus: StockStatus.AVAILABLE, askOnWA: false },
        { id: 'combo-tpl-1-s-b', options: { 'Ukuran': 'S', 'Warna': 'Hitam' }, price: 85000, stockStatus: StockStatus.AVAILABLE, askOnWA: false },
        { id: 'combo-tpl-1-m-b', options: { 'Ukuran': 'M', 'Warna': 'Hitam' }, price: 85000, stockStatus: StockStatus.AVAILABLE, askOnWA: false },
        { id: 'combo-tpl-1-l-b', options: { 'Ukuran': 'L', 'Warna': 'Hitam' }, price: 85000, stockStatus: StockStatus.AVAILABLE, askOnWA: false },
        { id: 'combo-tpl-1-xl-b', options: { 'Ukuran': 'XL', 'Warna': 'Hitam' }, price: 90000, stockStatus: StockStatus.AVAILABLE, askOnWA: false },
      ]
    },
    specs: [
        { id: 'spec-tpl-1-1', title: 'Material', items: ['Katun Combed 30s', 'Sablon Plastisol'] }
    ],
    faq: [
      { id: 'faq-tpl-1-1', question: 'Apakah bahan kaosnya adem?', answer: 'Ya, kami menggunakan katun combed 30s berkualitas yang lembut dan sejuk saat dipakai.' },
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'template-2',
    name: 'Contoh: Kue Kering Lebaran',
    slug: 'contoh-kue-kering',
    shortDescription: 'Ini adalah contoh produk makanan dengan harga satuan. Anda bisa menambahkan harga coret untuk menunjukkan diskon.',
    longDescription: 'Ganti deskripsi ini dengan cerita tentang kue Anda. Apa yang membuatnya spesial? Bahan apa yang Anda gunakan?',
    category: 'Makanan & Minuman',
    status: ProductStatus.DRAFT,
    images: [
      { id: 'img-tpl-2-1', url: 'https://images.unsplash.com/photo-1591119499422-d042f862a84e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', altText: 'Contoh kue kering dalam toples' },
    ],
    coverImageId: 'img-tpl-2-1',
    badges: ["Best Seller"],
    priceType: PriceType.SINGLE,
    price: 75000,
    strikethroughPrice: 85000,
    variants: { groups: [], combinations: [] },
    specs: [
        { id: 'spec-tpl-2-1', title: 'Informasi Allergen', items: ['Mengandung gluten', 'Mengandung produk susu', 'Mengandung kacang']}
    ],
    faq: [],
    updatedAt: new Date().toISOString(),
  },
   {
    id: 'template-3',
    name: 'Contoh: Jasa Desain Logo',
    slug: 'contoh-jasa-desain',
    shortDescription: 'Ini adalah contoh produk jasa di mana harga perlu didiskusikan. Gunakan opsi "Tanya di WA".',
    longDescription: 'Jelaskan layanan yang Anda tawarkan. Apa saja yang akan didapatkan oleh klien? Bagaimana proses kerjanya?',
    category: 'Jasa',
    status: ProductStatus.DRAFT,
    images: [
        { id: 'img-tpl-3-1', url: 'https://images.unsplash.com/photo-1572044162444-5015310b71a6?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', altText: 'Contoh portfolio desain logo' }
    ],
    coverImageId: 'img-tpl-3-1',
    badges: [],
    priceType: PriceType.SINGLE,
    price: 0,
    variants: { groups: [], combinations: [] },
    specs: [
       { id: 'spec-tpl-3-1', title: 'Yang Anda Dapatkan', items: ['3 Opsi Konsep Logo', 'File Master (AI, EPS)', 'Revisi 2x'] }
    ],
    faq: [
      { id: 'faq-tpl-3-1', question: 'Berapa lama proses pengerjaannya?', answer: 'Proses pengerjaan biasanya memakan waktu 3-5 hari kerja setelah brief kami terima.' },
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'template-4',
    name: 'Contoh: Produk Pre-Order',
    slug: 'contoh-produk-pre-order',
    shortDescription: 'Ini adalah contoh produk yang dijual dengan sistem Pre-Order (PO).',
    longDescription: 'Jelaskan detail produk PO Anda di sini. Berikan informasi mengenai estimasi waktu pengerjaan, bahan, dan pilihan kustomisasi jika ada.',
    category: 'Kustom',
    status: ProductStatus.DRAFT,
    preOrderEstimate: '14 hari kerja',
    badges: [],
    images: [
        { id: 'img-tpl-4-1', url: 'https://images.unsplash.com/photo-1618886614403-c6d1a580a3e3?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', altText: 'Contoh produk kustom atau pre-order' }
    ],
    coverImageId: 'img-tpl-4-1',
    priceType: PriceType.SINGLE,
    price: 250000,
    variants: { groups: [], combinations: [] },
    specs: [
       { id: 'spec-tpl-4-1', title: 'Detail', items: ['Dibuat sesuai pesanan', 'Bahan berkualitas tinggi'] }
    ],
    faq: [],
    updatedAt: new Date().toISOString(),
  },
];

export const mockStorefrontSettings: StorefrontSettings = {
  name: 'Toko Saya',
  slug: 'toko-saya',
  whatsappNumber: '6281234567890',
  status: StorefrontStatus.PUBLISHED,
  isCatalogEnabled: true,
  locationText: 'Jl. Merdeka No. 17, Bandung',
  hoursText: 'Buka Setiap Hari, 09:00 - 20:00',
};