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
