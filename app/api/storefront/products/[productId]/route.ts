import { NextRequest, NextResponse } from "next/server";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

import { supabaseRoute } from "@/lib/supabase-route";
import { deleteProduct, persistProduct } from "@/lib/storefront-data";
import type { SessionUser } from "@/lib/types";
import type { StorefrontProductInput } from "@/types/storefront.types";

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

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ productId: string }>;
  },
) {
  const { productId } = await params;

  if (!productId) {
    return NextResponse.json({ error: "ID produk tidak ditemukan." }, { status: 400 });
  }

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

  try {
    const sessionUser = mapSupabaseUser(user);
    const product = await persistProduct(sessionUser, payload, productId);
    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to update storefront product", error);
    return NextResponse.json({ error: "Gagal memperbarui produk." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ productId: string }>;
  },
) {
  const { productId } = await params;
  if (!productId) {
    return NextResponse.json({ error: "ID produk tidak ditemukan." }, { status: 400 });
  }

  const supabase = await supabaseRoute();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sessionUser = mapSupabaseUser(user);
    await deleteProduct(sessionUser, productId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete storefront product", error);
    return NextResponse.json({ error: "Gagal menghapus produk." }, { status: 500 });
  }
}
