import { NextResponse } from 'next/server';
import { createSupabaseServerClientReadOnly, createSupabaseServerClientWritable } from '@/utils/supabase/server';
import { slugify, isReservedSlug } from '@/lib/storefront/utils';

type OnboardingPayload = {
  businessName: string;
  mainPurpose: string;
  businessType: string;
  source: string;
};

export async function GET() {
  try {
    const supabase = await createSupabaseServerClientReadOnly();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr) {
      return NextResponse.json({ error: userErr.message }, { status: 500 });
    }
    if (!user) {
      return NextResponse.json({ authenticated: false, completed: false }, { status: 200 });
    }

    const { data, error } = await supabase
      .from('onboarding')
      .select('user_id, business_name, main_purpose, business_type, source, completed_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      // If table missing or other server error, surface but keep integration tolerable
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ authenticated: true, completed: false });
    }

    return NextResponse.json({
      authenticated: true,
      completed: Boolean(data.completed_at),
      data: {
        businessName: data.business_name,
        mainPurpose: data.main_purpose,
        businessType: data.business_type,
        source: data.source,
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<OnboardingPayload> | null;
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const payload: OnboardingPayload = {
      businessName: String(body.businessName ?? ''),
      mainPurpose: String(body.mainPurpose ?? ''),
      businessType: String(body.businessType ?? ''),
      source: String(body.source ?? ''),
    };

    if (!payload.businessName || !payload.mainPurpose || !payload.businessType || !payload.source) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClientWritable();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr) {
      return NextResponse.json({ error: userErr.message }, { status: 500 });
    }
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase.from('onboarding').upsert(
      {
        user_id: user.id,
        business_name: payload.businessName,
        main_purpose: payload.mainPurpose,
        business_type: payload.businessType,
        source: payload.source,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Pastikan user memiliki 1 storefront. Jika belum ada, buat default storefront
    // dan seed 4 produk contoh.
    try {
      const { data: existingStore, error: storeFetchErr } = await supabase
        .from('storefront_settings')
        .select('id, slug, name')
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (storeFetchErr) {
        // Jika tabel belum ada atau error lain, lewati pembuatan store agar onboarding tetap sukses
        throw storeFetchErr;
      }

      let storeId: string | null = existingStore?.id ?? null;
      let isNewStore = false;

      if (!storeId) {
        // Hitung slug unik dari nama bisnis
        const base = slugify(payload.businessName);
        let candidate = base || `store-${user.id.slice(0, 8)}`;
        if (isReservedSlug(candidate)) {
          candidate = `store-${user.id.slice(0, 8)}`;
        }
        let counter = 2;
        // pastikan unik di seluruh storefront_settings
        // berhenti saat tidak ada konflik
        while (true) {
          const { data: conflict, error: conflictErr } = await supabase
            .from('storefront_settings')
            .select('id')
            .eq('slug', candidate)
            .maybeSingle();
          if (conflictErr) break; // best-effort
          if (!conflict) break;
          candidate = `${base || `store-${user.id.slice(0, 8)}`}-${counter}`;
          counter += 1;
        }

        // Buat storefront default
        const { data: createdStore, error: insertErr } = await supabase
          .from('storefront_settings')
          .insert({
            name: payload.businessName,
            slug: candidate,
            whatsapp_number: '6281234567890',
            status: 'Off',
            is_catalog_enabled: true,
            location_text: null,
            hours_text: null,
            owner_user_id: user.id,
            theme: null,
          })
          .select('id, slug')
          .single();

        if (!insertErr && createdStore?.id) {
          storeId = createdStore.id as string;
          isNewStore = true;
        }
      } else {
        // Jika sudah ada store: senkronkan nama + slug ke businessName (best-effort)
        const baseSlug = slugify(payload.businessName);
        let uniqueSlug = baseSlug || (existingStore.slug || `store-${user.id.slice(0, 8)}`);
        if (isReservedSlug(uniqueSlug)) {
          uniqueSlug = `store-${user.id.slice(0, 8)}`;
        }
        let counter = 2;
        while (true) {
          const { data: conflict, error: conflictErr } = await supabase
            .from('storefront_settings')
            .select('id')
            .eq('slug', uniqueSlug)
            .maybeSingle();
          if (conflictErr) break;
          if (!conflict || conflict.id === existingStore.id) break;
          uniqueSlug = `${baseSlug || `store-${user.id.slice(0, 8)}`}-${counter}`;
          counter += 1;
        }
        await supabase
          .from('storefront_settings')
          .update({ name: payload.businessName, slug: uniqueSlug })
          .eq('id', existingStore.id)
          .eq('owner_user_id', user.id);
      }

      // Seed produk contoh hanya ketika toko baru dibuat
      if (storeId && isNewStore) {
        const timestamp = new Date().toISOString();
        const prodTemplates = [
          {
            name: 'Contoh: Jasa Desain Logo',
            slug: slugify('Contoh: Jasa Desain Logo') || 'contoh-jasa-desain-logo',
            short_description:
              'Ini adalah contoh produk jasa di mana harga perlu didiskusikan. Gunakan opsi "Tanya di WA".',
            long_description:
              'Jelaskan layanan yang Anda tawarkan. Apa saja yang akan didapatkan oleh klien? Bagaimana proses kerjanya?',
            category: 'Jasa',
            status: 'Draft',
            badges: [],
            images: [
              {
                id: 'img-tpl-3-1',
                url:
                  'https://images.unsplash.com/photo-1543487945-139a97f387d5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=680',
                altText: 'Contoh portfolio desain logo',
              },
            ],
            cover_image_id: 'img-tpl-3-1',
            price_type: 'single',
            price: 0,
            strikethrough_price: null,
            variants: { groups: [], combinations: [] },
            specs: [
              {
                id: 'spec-tpl-3-1',
                items: ['3 Opsi Konsep Logo', 'File Master (AI, EPS)', 'Revisi 2x'],
                title: 'Yang Anda Dapatkan',
              },
            ],
            faq: [
              {
                id: 'faq-tpl-3-1',
                answer:
                  'Proses pengerjaan biasanya memakan waktu 3-5 hari kerja setelah brief kami terima.',
                question: 'Berapa lama proses pengerjaannya?',
              },
            ],
            pre_order_estimate: null,
          },
          {
            name: 'Contoh: Baju Kaos Keren',
            slug: slugify('Contoh: Baju Kaos Keren') || 'contoh-baju-kaos-keren',
            short_description:
              'Ini adalah contoh produk fashion. Ganti deskripsi ini dengan penjelasan singkat tentang produk Anda.',
            long_description:
              'Jelaskan produk Anda secara detail di sini. Anda bisa menceritakan tentang bahan, kualitas, atau keunikan dari produk Anda.\n\nSetiap baris baru akan menjadi paragraf baru.',
            category: 'Fashion',
            status: 'Draft',
            badges: ['Baru'],
            images: [
              {
                id: 'img-tpl-1-1',
                url:
                  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                altText: 'Contoh kaos putih polos',
              },
              {
                id: 'img-tpl-1-2',
                url:
                  'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                altText: 'Contoh kaos hitam polos',
              },
            ],
            cover_image_id: 'img-tpl-1-1',
            price_type: 'variant',
            price: null,
            strikethrough_price: null,
            variants: {
              groups: [
                { id: 'vg-tpl-1', name: 'Ukuran', options: ['S', 'M', 'L', 'XL'] },
                { id: 'vg-tpl-2', name: 'Warna', options: ['Putih', 'Hitam'] },
              ],
              combinations: [
                { id: 'combo-1', price: 50000, askOnWA: false, options: { Warna: 'Putih', Ukuran: 'S' }, stockStatus: 'available' },
                { id: 'combo-2', price: 50000, askOnWA: false, options: { Warna: 'Hitam', Ukuran: 'S' }, stockStatus: 'available' },
                { id: 'combo-3', price: 100000, askOnWA: false, options: { Warna: 'Putih', Ukuran: 'M' }, stockStatus: 'available' },
                { id: 'combo-4', price: 100000, askOnWA: false, options: { Warna: 'Hitam', Ukuran: 'M' }, stockStatus: 'available' },
                { id: 'combo-5', price: 150000, askOnWA: false, options: { Warna: 'Putih', Ukuran: 'L' }, stockStatus: 'available' },
                { id: 'combo-6', price: 150000, askOnWA: false, options: { Warna: 'Hitam', Ukuran: 'L' }, stockStatus: 'available' },
                { id: 'combo-7', price: 200000, askOnWA: false, options: { Warna: 'Putih', Ukuran: 'XL' }, stockStatus: 'available' },
                { id: 'combo-8', price: 200000, askOnWA: false, options: { Warna: 'Hitam', Ukuran: 'XL' }, stockStatus: 'available' },
              ],
            },
            specs: [
              { id: 'spec-tpl-1-1', items: ['Katun Combed 30s', 'Sablon Plastisol'], title: 'Material' },
            ],
            faq: [
              { id: 'faq-tpl-1-1', answer: 'Ya, kami menggunakan katun combed 30s berkualitas yang lembut dan sejuk saat dipakai.', question: 'Apakah bahan kaosnya adem?' },
            ],
            pre_order_estimate: null,
          },
          {
            name: 'Contoh: Produk Pre-Order',
            slug: slugify('Contoh: Produk Pre-Order') || 'contoh-produk-pre-order',
            short_description: 'Ini adalah contoh produk yang dijual dengan sistem Pre-Order (PO).',
            long_description:
              'Jelaskan detail produk PO Anda di sini. Berikan informasi mengenai estimasi waktu pengerjaan, bahan, dan pilihan kustomisasi jika ada.',
            category: 'Kustom',
            status: 'Draft',
            badges: [],
            images: [
              {
                id: 'img-tpl-4-1',
                url:
                  'https://images.unsplash.com/photo-1716369786631-b8b9c7ac1dc4?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687',
                altText: 'Contoh produk kustom atau pre-order',
              },
            ],
            cover_image_id: 'img-tpl-4-1',
            price_type: 'single',
            price: 250000,
            strikethrough_price: null,
            variants: { groups: [], combinations: [] },
            specs: [
              { id: 'spec-tpl-4-1', items: ['Dibuat sesuai pesanan', 'Bahan berkualitas tinggi'], title: 'Detail' },
            ],
            faq: [],
            pre_order_estimate: '14 hari kerja',
          },
          {
            name: 'Contoh: Kue Kering Lebaran',
            slug: slugify('Contoh: Kue Kering Lebaran') || 'contoh-kue-kering-lebaran',
            short_description:
              'Ini adalah contoh produk makanan dengan harga satuan. Anda bisa menambahkan harga coret untuk menunjukkan diskon.',
            long_description:
              'Ganti deskripsi ini dengan cerita tentang kue Anda. Apa yang membuatnya spesial? Bahan apa yang Anda gunakan?',
            category: 'Makanan & Minuman',
            status: 'Draft',
            badges: ['Best Seller'],
            images: [
              {
                id: 'img-tpl-2-1',
                url:
                  'https://images.unsplash.com/photo-1740631599955-a9c1f5643ba5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
                altText: 'Contoh kue kering dalam toples',
              },
            ],
            cover_image_id: 'img-tpl-2-1',
            price_type: 'single',
            price: 75000,
            strikethrough_price: 85000,
            variants: { groups: [], combinations: [] },
            specs: [
              { id: 'spec-tpl-2-1', items: ['Mengandung gluten', 'Mengandung produk susu', 'Mengandung kacang'], title: 'Informasi Allergen' },
            ],
            faq: [],
            pre_order_estimate: null,
          },
        ];

        // Pastikan slug produk unik dalam toko
        const slugsSet = new Set<string>();
        const rows = prodTemplates.map((p) => {
          let s = p.slug;
          let c = 2;
          while (slugsSet.has(s)) {
            s = `${p.slug}-${c}`; c += 1;
          }
          slugsSet.add(s);
          return {
            store_id: storeId!,
            name: p.name,
            slug: s,
            short_description: p.short_description,
            long_description: p.long_description,
            category: p.category,
            status: p.status,
            badges: p.badges,
            images: p.images,
            cover_image_id: p.cover_image_id,
            price_type: p.price_type,
            price: p.price,
            strikethrough_price: p.strikethrough_price,
            variants: p.variants,
            specs: p.specs,
            faq: p.faq,
            pre_order_estimate: p.pre_order_estimate,
            updated_at: timestamp,
          };
        });

        await supabase.from('products').insert(rows);
      }
    } catch {
      // Best-effort; abaikan error supaya onboarding tetap berhasil
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
