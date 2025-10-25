import { PriceType, Product, StockStatus } from './types';

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// Beberapa slug yang tidak boleh dipakai untuk toko agar tidak bentrok
// dengan rute aplikasi atau istilah umum.
const reservedSlugs = new Set<string>([
  // Sistem/Aplikasi umum
  'admin', 'superadmin', 'panel', 'dashboard', 'setting', 'settings', 'konfigurasi',
  'config', 'status', 'health', 'ping', 'version', 'v1', 'v2', 'docs', 'doc', 'api-docs',
  'debug', 'test', 'error', '404', '500', 'maintenance',

  // Autentikasi & akun
  'auth', 'login', 'masuk', 'logout', 'keluar', 'register', 'registrasi', 'signup', 'daftar',
  'akun', 'account', 'profil', 'profile', 'user', 'users', 'pengguna', 'verifikasi', 'verify',
  'reset', 'password', 'lupa-password', 'forgot',

  // Rute inti aplikasi/teknis
  'api', 'graphql', 'webhook', 'webhooks', 'callback', 'oauth', 'oauth2',
  'sitemap', 'robots', 'manifest', 'favicon',

  // Statis/asset/file
  'static', 'public', 'assets', 'asset', 'cdn', 'img', 'image', 'images', 'media', 'file',
  'files', 'upload', 'uploads', 'download', 'downloads', 'css', 'js', 'fonts',

  // Navigasi/halaman umum
  'home', 'beranda', 'index', 'root', 'tentang', 'about', 'kontak', 'contact', 'hubungi',
  'bantuan', 'support', 'pusat-bantuan', 'cs', 'faq', 'kebijakan', 'kebijakan-privasi', 'privasi',
  'syarat', 'ketentuan', 'syarat-ketentuan', 'tos', 'privacy', 'terms',

  // Perdagangan/toko umum
  'storefront', 'store', 'toko', 'shop', 'katalog', 'catalog', 'kategori', 'categories',
  'produk', 'product', 'products', 'koleksi', 'collection', 'collections', 'merek', 'brand',
  'keranjang', 'cart', 'checkout', 'bayar', 'pembayaran', 'payment', 'pay', 'tagihan', 'invoice',
  'kuitansi', 'resi', 'pesanan', 'order', 'orders', 'riwayat', 'history', 'riwayat-pesanan',
  'pengiriman', 'kirim', 'antar', 'kurir', 'ongkir', 'retur', 'refund', 'komplain', 'klaim',
  'promo', 'promosi', 'diskon', 'voucher', 'kupon', 'event', 'flashsale', 'wishlist', 'favorit',
  'ulasan', 'review', 'rating', 'pencarian', 'cari', 'search',

  // Konten/marketing
  'blog', 'artikel', 'berita', 'news', 'galeri', 'gallery',

  // Lain-lain umum yang sering dipakai
  'app', 'apps', 'official', 'resmi', 'my', 'me', 'admin-panel', 'panel-admin',
]);

export const isReservedSlug = (slug: string): boolean => {
  return reservedSlugs.has(slug);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getProductPriceRange = (product: Product) => {
  if (product.priceType === PriceType.SINGLE) {
    return {
      displayPrice:
        product.price && product.price > 0
          ? formatCurrency(product.price)
          : 'Tanya di WA',
      isAskOnWA: !(product.price && product.price > 0),
    };
  }

  if (!product.variants || product.variants.combinations.length === 0) {
    return { displayPrice: 'Varian belum diatur', isAskOnWA: true };
  }

  const availableCombinations = product.variants.combinations.filter(
    (combination) =>
      combination.stockStatus === StockStatus.AVAILABLE &&
      !combination.askOnWA &&
      combination.price > 0,
  );

  if (availableCombinations.length === 0) {
    const hasAskOnWA = product.variants.combinations.some(
      (combination) =>
        combination.stockStatus === StockStatus.AVAILABLE &&
        combination.askOnWA,
    );
    return {
      displayPrice: hasAskOnWA ? 'Tanya di WA' : 'Stok habis',
      isAskOnWA: hasAskOnWA,
    };
  }

  const prices = availableCombinations.map((combination) => combination.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  if (minPrice === maxPrice) {
    return { displayPrice: formatCurrency(minPrice), isAskOnWA: false };
  }

  return { displayPrice: `Mulai dari ${formatCurrency(minPrice)}`, isAskOnWA: false };
};

export const convertNewlinesToParagraphs = (text: string): string => {
  if (!text) return '';
  return text
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => `<p>${line.trim()}</p>`)
    .join('');
};

export const getSortPrice = (product: Product): number => {
  if (product.priceType === PriceType.SINGLE) {
    return product.price && product.price > 0 ? product.price : Infinity;
  }

  if (!product.variants || product.variants.combinations.length === 0) {
    return Infinity;
  }

  const availablePrices = product.variants.combinations
    .filter(
      (combination) =>
        combination.stockStatus === StockStatus.AVAILABLE &&
        !combination.askOnWA &&
        combination.price > 0,
    )
    .map((combination) => combination.price);

  if (availablePrices.length === 0) {
    return Infinity;
  }

  return Math.min(...availablePrices);
};

const profanityList = [
  'anjing',
  'babi',
  'bangsat',
  'bajingan',
  'brengsek',
  'kontol',
  'memek',
  'jembut',
  'ngentot',
  'asu',
  'jancok',
  'goblok',
  'tolol',
  'setan',
  'iblis',
  'cuki',
  'perek',
  'lonte',
  'tempik',
  'ngewe',
  'fuck',
  'shit',
  'bitch',
  'asshole',
  'cunt',
  'dick',
  'pussy',
  'bastard',
  'damn',
  'hell',
  'sex',
  'sexy',
  'nazi',
  'hitler',
  'isis',
  'teroris',
];

export const containsProfanity = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return profanityList.some((word) => lowerText.includes(word));
};
