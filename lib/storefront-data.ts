import { createSupabaseServerClientReadOnly, createSupabaseServerClientWritable } from "@/lib/supabase-server";
import type { SessionUser } from "@/lib/types";
import {
  Storefront,
  StorefrontHydrationPayload,
  StorefrontProduct,
  StorefrontProductInput,
  StorefrontQuoteRequest,
  StorefrontUpdatePayload,
} from "@/types/storefront.types";
import { mapProductRow, mapQuoteRow, mapStorefrontRow, slugify } from "./storefront-transformers";

const STOREFRONTS_TABLE = "storefront_settings";
const PRODUCTS_TABLE = "products";
const QUOTES_TABLE = "storefront_quotes";

const EMPTY_STATE: StorefrontHydrationPayload = {
  storefront: null,
  products: [],
  quotes: [],
};

type SupabaseWritable = Awaited<ReturnType<typeof createSupabaseServerClientWritable>>;
type SupabaseReadonly = Awaited<ReturnType<typeof createSupabaseServerClientReadOnly>>;

type StorefrontSettingsRow = Parameters<typeof mapStorefrontRow>[0];
type ProductsRow = Parameters<typeof mapProductRow>[0];
type QuoteRow = Parameters<typeof mapQuoteRow>[0];

const DEFAULT_SAMPLE_PRODUCT: StorefrontProductInput = {
  name: "Produk Contoh KitStudio",
  slug: "produk-contoh-kitstudio",
  type: "fixed",
  status: "Draft",
  price: 125000,
  shortDescription: "Mulai buat katalog profesional dengan contoh produk bawaan.",
  longDescription: "Contoh produk untuk membantu Anda memvalidasi tampilan katalog KitStudio.",
  highlights: ["Konten otomatis oleh AI", "Foto siap promosi", "Simpan kutipan penawaran pelanggan"],
  images: [
    {
      url: "https://dummyimage.com/1200x800/0d47a1/ffffff&text=KitStudio+Produk",
      altText: "Contoh produk KitStudio",
      sortOrder: 0,
    },
  ],
};

function isMissingRelationError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = (error as { code?: string }).code;
  if (
    code &&
    ["42P01", "PGRST205"].includes(code.toUpperCase())
  ) {
    return true;
  }

  const message = (error as { message?: string }).message ?? "";
  if (typeof message !== "string") {
    return false;
  }

  const normalized = message.toLowerCase();
  return normalized.includes("does not exist") || normalized.includes("could not find the table");
}

async function fetchStorefrontById<T extends SupabaseWritable | SupabaseReadonly>(
  supabase: T,
  storefrontId: string,
): Promise<StorefrontHydrationPayload | null> {
  const { data: storefrontRow, error: storefrontError } = await supabase
    .from(STOREFRONTS_TABLE)
    .select("*")
    .eq("id", storefrontId)
    .maybeSingle<StorefrontSettingsRow>();

  if (storefrontError) {
    throw storefrontError;
  }

  if (!storefrontRow) {
    return null;
  }

  const { data: productRows, error: productsError } = await supabase
    .from(PRODUCTS_TABLE)
    .select("*")
    .eq("store_id", storefrontRow.id)
    .order("updated_at", { ascending: false })
    .returns<ProductsRow[]>();

  if (productsError) {
    throw productsError;
  }

  let quotes: StorefrontQuoteRequest[] = [];
  const { data: quoteRows, error: quoteError } = await supabase
    .from(QUOTES_TABLE)
    .select("*")
    .eq("storefront_id", storefrontRow.id)
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<QuoteRow[]>();

  if (!quoteError) {
    quotes = (quoteRows ?? []).map(mapQuoteRow);
  } else if (!isMissingRelationError(quoteError)) {
    throw quoteError;
  }

  const storefront = mapStorefrontRow(storefrontRow);
  const products = (productRows ?? []).map(mapProductRow);

  return {
    storefront,
    products,
    quotes,
  };
}

async function ensureStorefront(
  supabase: SupabaseWritable,
  user: SessionUser,
): Promise<StorefrontHydrationPayload> {
  const { data: existing, error } = await supabase
    .from(STOREFRONTS_TABLE)
    .select("*")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .returns<StorefrontSettingsRow[]>();

  if (error) {
    throw error;
  }

  const existingRow = existing?.[0];
  if (!existingRow) {
    const desiredSlug = slugify(user.name ?? user.email ?? user.id);
    const slug = await generateUniqueStoreSlug(supabase, desiredSlug);

    const { data: created, error: insertError } = await supabase
      .from(STOREFRONTS_TABLE)
      .insert({
        owner_user_id: user.id,
        name: user.name ?? "Storefront KitStudio",
        slug,
        whatsapp_number: "6200000000000",
        status: "Draft",
        is_catalog_enabled: true,
      })
      .select("*")
      .single<StorefrontSettingsRow>();

    if (insertError) {
      throw insertError;
    }

    await seedSampleProduct(supabase, created);

    return {
      storefront: mapStorefrontRow(created),
      products: [],
      quotes: [],
    };
  }

  const hydrated = await fetchStorefrontById(supabase, existingRow.id);
  return (
    hydrated ?? {
      storefront: mapStorefrontRow(existingRow),
      products: [],
      quotes: [],
    }
  );
}

async function generateUniqueStoreSlug(supabase: SupabaseWritable, baseSlug: string): Promise<string> {
  const base = slugify(baseSlug, "store");
  let candidate = base;
  let attempt = 1;

  while (attempt < 25) {
    const { data, error } = await supabase
      .from(STOREFRONTS_TABLE)
      .select("id")
      .eq("slug", candidate)
      .limit(1);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return candidate;
    }

    candidate = `${base}-${attempt}`;
    attempt += 1;
  }

  return `${base}-${Date.now()}`;
}

async function seedSampleProduct(
  supabase: SupabaseWritable,
  storefront: StorefrontSettingsRow,
): Promise<void> {
  const payload = buildProductInsertPayload(storefront.id, DEFAULT_SAMPLE_PRODUCT);
  const { error } = await supabase.from(PRODUCTS_TABLE).insert(payload);
  if (error) {
    throw error;
  }
}

function buildProductInsertPayload(storeId: string, payload: StorefrontProductInput) {
  const badges = payload.highlights ?? [];
  const images = (payload.images ?? []).map((image, index) => ({
    id: image.sortOrder?.toString() ?? `img-${index}`,
    url: image.url,
    alt: image.altText ?? null,
    sortOrder: image.sortOrder ?? index,
  }));

  return {
    store_id: storeId,
    name: payload.name,
    slug: payload.slug ?? slugify(payload.name),
    short_description: payload.shortDescription ?? null,
    long_description: payload.longDescription ?? null,
    category: payload.category ?? null,
    status: payload.status ?? "Draft",
    badges,
    images,
    price_type: payload.type ?? "fixed",
    price: payload.price ?? null,
    strikethrough_price: payload.strikethroughPrice ?? null,
    variants: payload.variants ?? null,
    specs: payload.specs ?? null,
    faq: payload.faq ?? null,
    pre_order_estimate: payload.preOrderEstimate ?? null,
    updated_at: new Date().toISOString(),
  };
}

export async function getStorefrontDashboardData(user: SessionUser | null): Promise<StorefrontHydrationPayload> {
  if (!user) {
    return EMPTY_STATE;
  }

  const supabase = await createSupabaseServerClientWritable();

  try {
    return await ensureStorefront(supabase, user);
  } catch (error) {
    if (isMissingRelationError(error)) {
      console.warn(
        "[Storefront] tabel storefront belum tersedia di Supabase. Mengembalikan state kosong sementara.",
        error,
      );
      return EMPTY_STATE;
    }

    throw error;
  }
}

export async function getStorefrontPublicData(storeSlug: string): Promise<StorefrontHydrationPayload | null> {
  const supabase = await createSupabaseServerClientReadOnly();

  const { data: row, error } = await supabase
    .from(STOREFRONTS_TABLE)
    .select("*")
    .eq("slug", slugify(storeSlug))
    .maybeSingle<StorefrontSettingsRow>();

  if (error) {
    throw error;
  }

  if (!row) {
    return null;
  }

  return fetchStorefrontById(supabase, row.id);
}

export async function getStorefrontProductBySlug(
  storeSlug: string,
  productSlug: string,
): Promise<{ storefront: Storefront; product: StorefrontProduct; products: StorefrontProduct[] } | null> {
  const hydrated = await getStorefrontPublicData(storeSlug);
  if (!hydrated?.storefront) {
    return null;
  }

  const product = hydrated.products.find((item) => item.slug === slugify(productSlug));
  if (!product) {
    return null;
  }

  return {
    storefront: hydrated.storefront,
    product,
    products: hydrated.products,
  };
}

export async function updateStorefront(user: SessionUser, payload: StorefrontUpdatePayload): Promise<Storefront> {
  const supabase = await createSupabaseServerClientWritable();
  const hydrated = await ensureStorefront(supabase, user);

  if (!hydrated.storefront) {
    throw new Error("Storefront belum tersedia.");
  }

  const current = hydrated.storefront;
  let nextSlug = current.slug;
  if (payload.slug && payload.slug !== current.slug) {
    nextSlug = await generateUniqueStoreSlug(supabase, payload.slug);
  }

  const { data, error } = await supabase
    .from(STOREFRONTS_TABLE)
    .update({
      name: payload.name ?? current.name,
      slug: nextSlug,
      whatsapp_number: payload.whatsappNumber ?? current.whatsappNumber,
      status: payload.status ?? current.status,
      is_catalog_enabled:
        typeof payload.isCatalogEnabled === "boolean" ? payload.isCatalogEnabled : current.isCatalogEnabled,
      location_text: payload.locationText ?? current.locationText,
      hours_text: payload.hoursText ?? current.hoursText,
      theme: payload.theme ? { ...(current.theme ?? {}), ...payload.theme } : current.theme,
      updated_at: new Date().toISOString(),
    })
    .eq("id", current.id)
    .select("*")
    .single<StorefrontSettingsRow>();

  if (error) {
    throw error;
  }

  return mapStorefrontRow(data);
}

export async function persistProduct(
  user: SessionUser,
  payload: StorefrontProductInput,
  productId?: string,
): Promise<StorefrontProduct> {
  const supabase = await createSupabaseServerClientWritable();
  const hydrated = await ensureStorefront(supabase, user);

  if (!hydrated.storefront) {
    throw new Error("Storefront belum tersedia.");
  }

  if (productId) {
    const updatePayload = buildProductInsertPayload(hydrated.storefront.id, payload);
    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .update(updatePayload)
      .eq("id", productId)
      .eq("store_id", hydrated.storefront.id)
      .select("*")
      .single<ProductsRow>();

    if (error) {
      throw error;
    }

    return mapProductRow(data);
  }

  const insertPayload = buildProductInsertPayload(hydrated.storefront.id, payload);
  const { data, error } = await supabase.from(PRODUCTS_TABLE).insert(insertPayload).select("*").single<ProductsRow>();

  if (error) {
    throw error;
  }

  return mapProductRow(data);
}

export async function deleteProduct(user: SessionUser, productId: string): Promise<void> {
  const supabase = await createSupabaseServerClientWritable();
  const hydrated = await ensureStorefront(supabase, user);

  if (!hydrated.storefront) {
    throw new Error("Storefront belum tersedia.");
  }

  const { error } = await supabase
    .from(PRODUCTS_TABLE)
    .delete()
    .eq("id", productId)
    .eq("store_id", hydrated.storefront.id);

  if (error) {
    throw error;
  }
}

export async function duplicateProduct(user: SessionUser, productId: string): Promise<StorefrontProduct> {
  const supabase = await createSupabaseServerClientWritable();
  const hydrated = await ensureStorefront(supabase, user);

  if (!hydrated.storefront) {
    throw new Error("Storefront belum tersedia.");
  }

  const { data: productRow, error } = await supabase
    .from(PRODUCTS_TABLE)
    .select("*")
    .eq("id", productId)
    .eq("store_id", hydrated.storefront.id)
    .single<ProductsRow>();

  if (error) {
    throw error;
  }

  const copySlug = await generateUniqueProductSlug(supabase, hydrated.storefront.id, `${productRow.slug}-copy`);
  const clonedPayload = {
    ...productRow,
    id: undefined,
    slug: copySlug,
    name: `${productRow.name} (Copy)`,
    status: "Draft",
    created_at: undefined,
    updated_at: new Date().toISOString(),
  } as const;

  const { data: inserted, error: insertError } = await supabase
    .from(PRODUCTS_TABLE)
    .insert({
      store_id: productRow.store_id,
      name: clonedPayload.name,
      slug: clonedPayload.slug,
      short_description: productRow.short_description ?? null,
      long_description: productRow.long_description ?? null,
      category: productRow.category ?? null,
      status: "Draft",
      badges: productRow.badges ?? [],
      images: productRow.images ?? [],
      price_type: productRow.price_type ?? "fixed",
      price: productRow.price ?? null,
      strikethrough_price: productRow.strikethrough_price ?? null,
      variants: productRow.variants ?? null,
      specs: productRow.specs ?? null,
      faq: productRow.faq ?? null,
      pre_order_estimate: productRow.pre_order_estimate ?? null,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single<ProductsRow>();

  if (insertError) {
    throw insertError;
  }

  return mapProductRow(inserted);
}

async function generateUniqueProductSlug(
  supabase: SupabaseWritable,
  storeId: string,
  desiredSlug: string,
): Promise<string> {
  const base = slugify(desiredSlug, "product");
  let candidate = base;
  let attempt = 1;

  while (attempt < 25) {
    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .select("id")
      .eq("store_id", storeId)
      .eq("slug", candidate)
      .limit(1);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return candidate;
    }

    candidate = `${base}-${attempt}`;
    attempt += 1;
  }

  return `${base}-${Date.now()}`;
}

export async function createQuoteRequest(payload: {
  storefrontId: string;
  productId?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
}): Promise<StorefrontQuoteRequest> {
  const supabase = await createSupabaseServerClientWritable();

  const { data: inserted, error } = await supabase
    .from(QUOTES_TABLE)
    .insert({
      storefront_id: payload.storefrontId,
      product_id: payload.productId ?? null,
      name: payload.name,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      message: payload.message ?? null,
      status: "new",
    })
    .select("*")
    .single<QuoteRow>();

  if (error) {
    if (isMissingRelationError(error)) {
      throw new Error("Tabel permintaan penawaran belum tersedia di Supabase Anda.");
    }
    throw error;
  }

  return mapQuoteRow(inserted);
}
