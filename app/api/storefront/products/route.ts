import { NextResponse } from "next/server";

import { supabaseRoute } from "@/lib/supabase-route";
import { getStorefrontDashboardData, persistProduct } from "@/lib/storefront-data";
import type { SessionUser } from "@/lib/types";
import type { StorefrontProductInput } from "@/types/storefront.types";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

function mapSupabaseUser(user: SupabaseAuthUser): SessionUser {
  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    (user.user_metadata?.user_name as string | undefined);

  const fallbackName = user.email?.split("@")[0] ?? user.id;

  return {
    id: user.id,
    name: displayName?.trim() || fallbackName,
    email: user.email ?? "",
  };
}

export async function GET() {
  const supabase = await supabaseRoute();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sessionUser = mapSupabaseUser(user);
    const data = await getStorefrontDashboardData(sessionUser);
    return NextResponse.json(data.products);
  } catch (error) {
    console.error("Failed to load storefront products", error);
    return NextResponse.json({ error: "Tidak dapat memuat produk." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await supabaseRoute();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: StorefrontProductInput;
  try {
    payload = (await request.json()) as StorefrontProductInput;
  } catch {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  if (!payload?.name || typeof payload.price !== "number") {
    return NextResponse.json({ error: "Nama dan harga produk wajib diisi." }, { status: 400 });
  }

  try {
    const sessionUser = mapSupabaseUser(user);
    const product = await persistProduct(sessionUser, payload);
    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to create storefront product", error);
    return NextResponse.json({ error: "Gagal menyimpan produk." }, { status: 500 });
  }
}

