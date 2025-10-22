import { NextResponse } from "next/server";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

import { supabaseRoute } from "@/lib/supabase-route";
import { getStorefrontDashboardData, updateStorefront } from "@/lib/storefront-data";
import type { SessionUser } from "@/lib/types";
import type { StorefrontUpdatePayload } from "@/types/storefront.types";

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
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      {
        storefront: null,
        products: [],
        quotes: [],
      },
      { status: 200 },
    );
  }

  try {
    const sessionUser = mapSupabaseUser(user);
    const data = await getStorefrontDashboardData(sessionUser);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to load storefront data", err);
    return NextResponse.json(
      {
        error: "Gagal memuat data storefront.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const supabase = await supabaseRoute();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: StorefrontUpdatePayload;
  try {
    payload = (await request.json()) as StorefrontUpdatePayload;
  } catch {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  try {
    const sessionUser = mapSupabaseUser(user);
    const storefront = await updateStorefront(sessionUser, payload);
    return NextResponse.json(storefront);
  } catch (error) {
    console.error("Failed to update storefront", error);
    return NextResponse.json({ error: "Gagal memperbarui storefront." }, { status: 500 });
  }
}

