## Prasyarat

- Node.js 18 atau lebih baru
- Akun Supabase dengan proyek aktif
- API key dari [Google AI Studio](https://aistudio.google.com/apikey) (Gemini)
- Command-line Git & paket manajer (npm/pnpm)

Setelah clone repo jalankan instalasi dependensi:

```bash
npm install
```

## Konfigurasi Lingkungan

Buat file `.env.local` (bisa menyalin dari `.env.local.example` bila tersedia) dan isi variabel berikut:

```
NEXT_PUBLIC_SUPABASE_URL=<url supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key supabase>
GEMINI_API_KEY=<opsional, api key default aplikasi>
USER_API_KEY_SECRET=<string acak minimal 32 karakter untuk enkripsi kunci pengguna>
FIREBASE_PROJECT_ID=<id proyek firebase>
FIREBASE_CLIENT_EMAIL=<email service account firebase>
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=<nama bucket storage, biasanya <project-id>.appspot.com>
```

> `GEMINI_API_KEY` dipakai sebagai kunci bawaan ketika pengguna belum menyimpan kunci miliknya. Jika tidak diisi maka pengguna wajib menyimpan kunci sendiri pada halaman **Settings** sebelum memakai fitur AI.
> `FIREBASE_PRIVATE_KEY` harus mempertahankan karakter `\n` seperti contoh di atas; Next.js akan mengubahnya menjadi baris baru secara otomatis saat runtime.

## Integrasi Firebase Storage

Fitur penyimpanan proyek kini mengunggah gambar hasil generate ke Firebase Storage agar dapat diunduh ulang di masa depan.

1. Buat project Firebase (atau gunakan yang sudah ada) dan aktifkan **Cloud Storage** dengan lokasi nearline yang diinginkan.
2. Buat service account baru dengan role `Storage Admin`, lalu unduh kredensial JSON‑nya. Ambil nilai `project_id`, `client_email`, dan `private_key` untuk dimasukkan ke `.env.local` sesuai tabel di atas.
3. Pastikan bucket Storage memperbolehkan akses baca publik (akses dilakukan via `file.makePublic()` secara otomatis). Jika Anda ingin akses privat, ubah logika di `lib/firebase-storage.ts` agar menghasilkan signed URL sesuai kebijakan keamanan Anda.
4. Setelah variabel lingkungan diset, restart server Next.js (`npm run dev`) agar konfigurasi baru termuat.

## Skema Supabase

Pastikan tabel / fungsi berikut ada di basis data Supabase Anda:

### 1. `profiles`

Kolom minimal: `user_id (uuid)`, `name (text)`, `plan (text)`, `plan_expires_at (timestamptz)`.

### 2. `credits_wallet`

```
user_id uuid primary key references auth.users(id)
balance numeric not null default 0
```

### 3. `credits_ledger`

Digunakan untuk riwayat kredit (dipakai di dashboard). Minimal kolom: `id`, `user_id`, `reason`, `amount`, `transaction_no`, `created_at`.

### 4. `projects`

Tambahkan kolom berikut bila belum ada:

```
caption text
aspect_ratio text
prompt_details text
prompt_full text
image_storage_path text
```

Kolom lain yang sudah ada: `id`, `title`, `type`, `image_url`, `user_id`, `created_at`.

### 5. `generations`

Dipakai untuk menghitung pekerjaan mingguan. Minimal kolom: `id`, `user_id`, `status`, `created_at`.

### 6. `user_api_keys`

```
create table user_api_keys (
  user_id uuid primary key references auth.users(id) on delete cascade,
  api_key text not null,
  updated_at timestamptz default timezone('utc', now())
);
```

### 7. Fungsi `deduct_credits`

Fungsi RPC yang menurunkan saldo kredit. Contoh implementasi:

```sql
create or replace function public.deduct_credits(
  p_user_id uuid,
  p_amount integer,
  p_type text
) returns void
language plpgsql
as $$
begin
  update credits_wallet
    set balance = balance - p_amount
  where user_id = p_user_id;

  insert into credits_ledger (user_id, reason, amount)
  values (p_user_id, p_type, -p_amount);
end;
$$;
```

> Penamaan kolom / tabel boleh disesuaikan selama dipetakan ke nama yang sama seperti di atas.

### 8. `storefront_settings`

Menyimpan konfigurasi storefront publik sesuai skema yang kamu lampirkan:

```
id uuid primary key default gen_random_uuid()
name text not null
slug text not null unique
whatsapp_number text not null
status text default 'Published'
is_catalog_enabled boolean default true
location_text text
hours_text text
created_at timestamptz default now()
updated_at timestamptz default now()
owner_user_id uuid references auth.users(id)
theme jsonb
```

### 9. `products`

Relasi banyak-ke-satu dengan `storefront_settings.id` melalui kolom `store_id`:

```
id uuid primary key default gen_random_uuid()
store_id uuid not null references storefront_settings(id) on delete cascade
name text not null
slug text not null
short_description text
long_description text
category text
status text
badges text[]
images jsonb
cover_image_id text
price_type text
price numeric
strikethrough_price numeric
variants jsonb
specs jsonb
faq jsonb
pre_order_estimate text
updated_at timestamptz
created_at timestamptz default now()
```

Format JSON yang digunakan oleh aplikasi mengikuti struktur pada `lib/storefront/types.ts`. Kolom `images`, `variants`, `specs`, dan `faq` dapat disesuaikan selama bentuknya kompatibel dengan tipe tersebut.

### 10. `onboarding`

Digunakan untuk menyimpan jawaban onboarding per pengguna serta menandai penyelesaian onboarding. Tambahkan tabel berikut:

```sql
create table if not exists public.onboarding (
  user_id uuid primary key references auth.users(id) on delete cascade,
  business_name text not null,
  main_purpose text not null,
  business_type text not null,
  source text not null,
  completed_at timestamptz default now()
);

-- Opsional: izinkan pengguna hanya mengakses catatan miliknya
alter table public.onboarding enable row level security;
create policy "Users can view own onboarding" on public.onboarding
  for select using (auth.uid() = user_id);
create policy "Users can upsert own onboarding" on public.onboarding
  for insert with check (auth.uid() = user_id);
create policy "Users can update own onboarding" on public.onboarding
  for update using (auth.uid() = user_id);
```

Setelah tabel dibuat, dialog onboarding otomatis muncul untuk pengguna yang belum memiliki baris di tabel ini.

## Fitur Utama

- **Generate Image**: mengedit gambar produk menggunakan Gemini. Kredit sistem akan berkurang 5 poin tiap generasi bila pengguna memakai kunci bawaan.
- **Generate Caption**: membuat caption media sosial berdasarkan topik teks maupun hasil gambar.
- **Settings**: menyimpan kunci API Gemini milik pengguna yang disimpan di Supabase.
- **Storefront Admin**: kelola katalog, detail produk, dan pengaturan toko melalui halaman `/storefront` (khusus setelah login).
- **Analisa gaya otomatis**: setiap kali gambar diunggah, sistem langsung menganalisis kategori, subjek, dan rekomendasi gaya untuk mengisi opsi lanjutan.
- **Progress bertahap**: proses generate menampilkan tahapan status (analisis gaya, penyesuaian pencahayaan, render akhir) agar pengguna mengetahui progress saat loading.
- **Penyimpanan proyek ke Firebase**: hasil gambar disalin ke Firebase Storage dan URL publiknya disimpan ke tabel `projects`, sehingga bisa diunduh ulang kapan saja.

## Menjalankan Proyek

```bash
npm run dev
```

Aplikasi akan tersedia di `http://localhost:3000`.

## Catatan Penggunaan

- Pengguna harus login terlebih dahulu (Supabase Auth aktif melalui middleware).
- Setiap pengguna dapat menyimpan kunci Gemini pribadi melalui halaman **Settings**. Kunci tersebut disimpan di tabel `user_api_keys` dan otomatis tersimpan ke `localStorage`.
- Bila kunci pribadi tersedia, seluruh request AI akan memakai kunci tersebut sehingga kredit sistem tidak berkurang.
- Pastikan quota API Gemini dan saldo kredit mencukupi agar proses generate tidak gagal.
