import { NextResponse } from 'next/server';
import { getProductBySlug } from '@/lib/data';

// Contoh API route untuk mengambil data produk tunggal.
// Anda bisa menggunakan ini untuk fetching data di sisi klien jika diperlukan.
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    
    // Ganti 'your-store-id' dengan cara mendapatkan ID toko Anda (misalnya dari sesi user)
    const product = await getProductBySlug(slug, 'your-store-id');

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('API Error fetching product:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}