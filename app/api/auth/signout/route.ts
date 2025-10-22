import { NextResponse } from "next/server";
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

  return NextResponse.json({ ok: true });
}
