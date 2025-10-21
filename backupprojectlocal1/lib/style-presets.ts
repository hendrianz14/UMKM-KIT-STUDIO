import type { StyleOption } from './types';

export type StylePresetKey = 'Default' | 'Food' | 'Drink' | 'Portrait' | 'Landscape' | 'Product';

const STYLE_PRESETS: Record<StylePresetKey, StyleOption[]> = {
  Default: [
    {
      category: 'style',
      name: 'Gaya Fotografi Umum',
      options: ['Cinematic', 'Minimalist', 'Vintage', 'Clean & Bright', 'Lifestyle', 'Hero Shot'],
    },
    {
      category: 'lighting',
      name: 'Pencahayaan',
      options: ['Soft Light', 'Golden Hour', 'Studio Light', 'Natural Window', 'Moody Contrast'],
    },
    {
      category: 'composition',
      name: 'Komposisi',
      options: ['Rule of Thirds', 'Centered', 'Leading Lines', 'Top Down', 'Human Element'],
    },
    {
      category: 'mood',
      name: 'Mood & Nuansa',
      options: ['Profesional', 'Elegan', 'Energetic', 'Cozy', 'Bold'],
    },
  ],
  Food: [
        { category: 'style', name: 'Gaya Fotografi Makanan', options: ['Dark & Moody', 'Minimalist', 'Rustic', 'Clean & Bright', 'Food Porn'] },
        { category: 'lighting', name: 'Pencahayaan', options: ['Natural Light', 'Soft Light', 'Backlit', 'Hard Shadow'] },
        { category: 'composition', name: 'Komposisi', options: ['Top-down', 'Close-up', '45-Degree Angle', 'Human Element'] },
        { category: 'mood', name: 'Suasana', options: ['Lezat', 'Segar', 'Hangat', 'Elegan', 'Rumahan'] },
    ],
    Drink: [
        { category: 'style', name: 'Gaya Fotografi Minuman', options: ['Splash', 'Minimalist', 'Lifestyle', 'Dark & Moody'] },
        { category: 'lighting', name: 'Pencahayaan', options: ['Backlit', 'Natural Light', 'Studio Light', 'Hard Shadow'] },
        { category: 'composition', name: 'Komposisi', options: ['Close-up', 'Garnishes', 'Human Element', 'Top-down'] },
        { category: 'mood', name: 'Suasana', options: ['Menyegarkan', 'Hangat', 'Elegan', 'Santai'] },
    ],
    Portrait: [
        { category: 'style', name: 'Gaya Fotografi Potret', options: ['Cinematic', 'Fashion', 'Fine Art', 'Candid', 'Headshot'] },
        { category: 'lighting', name: 'Pencahayaan', options: ['Rembrandt', 'Golden Hour', 'Studio Light', 'Dramatic', 'Neon'] },
        { category: 'composition', name: 'Komposisi', options: ['Close-up', 'Medium Shot', 'Full Body', 'Rule of Thirds'] },
        { category: 'mood', name: 'Suasana', options: ['Ceria', 'Misterius', 'Profesional', 'Elegan', 'Intim'] },
    ],
    Landscape: [
        { category: 'style', name: 'Gaya Fotografi Pemandangan', options: ['Epic', 'Long Exposure', 'Minimalist', 'Infrared', 'Aerial'] },
        { category: 'lighting', name: 'Pencahayaan', options: ['Golden Hour', 'Blue Hour', 'Misty', 'Dramatic Sky'] },
        { category: 'composition', name: 'Komposisi', options: ['Wide Shot', 'Leading Lines', 'Framing', 'Symmetry'] },
        { category: 'mood', name: 'Suasana', options: ['Tenang', 'Megah', 'Misterius', 'Damai', 'Dramatis'] },
    ],
    Product: [
        { category: 'style', name: 'Gaya Fotografi Produk', options: ['Clean Catalog', 'Lifestyle', 'Minimalist', 'Hero Shot'] },
        { category: 'lighting', name: 'Pencahayaan', options: ['Studio Light', 'Soft Light', 'Dramatic', 'Ring Light'] },
        { category: 'composition', name: 'Komposisi', options: ['Close-up', 'Isometric', 'Group Shot', 'Floating'] },
        { category: 'mood', name: 'Suasana', options: ['Elegan', 'Modern', 'Premium', 'Fun', 'Natural'] },
    ],
};

export const PRESET_DISPLAY_NAMES: Record<StylePresetKey, string> = {
  Default: 'Umum',
  Food: 'Makanan',
  Drink: 'Minuman',
  Portrait: 'Potret',
  Landscape: 'Pemandangan',
  Product: 'Produk',
};

const ANALYSIS_CATEGORY_TO_PRESET: Record<string, StylePresetKey> = {
  FOOD: 'Food',
  MAKANAN: 'Food',
  DRINK: 'Drink',
  MINUMAN: 'Drink',
  BEVERAGE: 'Drink',
  PRODUCT: 'Product',
  PRODUK: 'Product',
  FASHION: 'Product',
  PEOPLE: 'Portrait',
  PERSON: 'Portrait',
  PORTRAIT: 'Portrait',
  POTRET: 'Portrait',
  LANDSCAPE: 'Landscape',
  PEMANDANGAN: 'Landscape',
  SCENERY: 'Landscape',
  OTHER: 'Default',
  DEFAULT: 'Default',
  UMUM: 'Default',
};

export const DEFAULT_STYLE_PRESETS = clonePresets(STYLE_PRESETS.Default);

export function getDefaultStylePresets(): StyleOption[] {
  return clonePresets(STYLE_PRESETS.Default);
}

type RecommendationMap = Partial<Record<'style' | 'lighting' | 'composition' | 'mood', string[]>>;

export function resolvePresetFromCategory(category: string | null | undefined) {
  const key = category
    ? ANALYSIS_CATEGORY_TO_PRESET[category.toUpperCase()] ?? 'Default'
    : 'Default';

  return {
    key,
    displayName: PRESET_DISPLAY_NAMES[key],
    presets: clonePresets(STYLE_PRESETS[key]),
  };
}

export function mergePresetsWithRecommendations(
  basePresets: StyleOption[],
  recommendations: RecommendationMap,
): StyleOption[] {
  const safeRecommendations: RecommendationMap = {
    style: sanitiseList(recommendations.style),
    lighting: sanitiseList(recommendations.lighting),
    composition: sanitiseList(recommendations.composition),
    mood: sanitiseList(recommendations.mood),
  };

  return basePresets.map((preset) => ({
    category: preset.category,
    name: preset.name,
    options: mergeUnique(safeRecommendations[preset.category as keyof RecommendationMap] ?? [], preset.options),
  }));
}

function mergeUnique(primary: string[], secondary: string[]): string[] {
  const merged: string[] = [];
  const seen = new Set<string>();

  const addItems = (items: string[]) => {
    for (const item of items) {
      const trimmed = item.trim();
      if (!trimmed) continue;
      const fingerprint = trimmed.toLowerCase();
      if (seen.has(fingerprint)) continue;
      seen.add(fingerprint);
      merged.push(trimmed);
    }
  };

  addItems(primary);
  addItems(secondary);

  return merged;
}

function sanitiseList(list: string[] | undefined): string[] {
  if (!Array.isArray(list)) {
    return [];
  }
  return list
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => !!item);
}

function clonePresets(presets: StyleOption[]): StyleOption[] {
  return presets.map((preset) => ({
    category: preset.category,
    name: preset.name,
    options: [...preset.options],
  }));
}
