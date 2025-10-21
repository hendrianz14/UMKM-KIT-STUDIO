import { NextResponse } from "next/server";
import { clearSupabaseAuthCookies } from "@/lib/supabase-auth-cookies";
import { createSupabaseServerClientWritable } from "@/utils/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClientWritable();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message || "Gagal keluar dari sesi." },
      { status: 500 }
    );
  }

  clearSupabaseAuthCookies();

  return NextResponse.json({ ok: true });
}
