import { NextResponse } from "next/server";
import { createQuoteRequest } from "@/lib/storefront-data";

type QuotePayload = {
  storefrontId: string;
  productId?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
};

export async function POST(request: Request) {
  let payload: QuotePayload;
  try {
    payload = (await request.json()) as QuotePayload;
  } catch {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  if (!payload?.storefrontId || !payload?.name) {
    return NextResponse.json(
      { error: "Nama dan informasi storefront wajib diisi." },
      { status: 400 },
    );
  }

  try {
    const quote = await createQuoteRequest(payload);
    return NextResponse.json(quote);
  } catch (error) {
    console.error("Failed to create storefront quote", error);
    return NextResponse.json({ error: "Gagal mengirim permintaan penawaran." }, { status: 500 });
  }
}

