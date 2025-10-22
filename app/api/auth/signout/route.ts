import { NextResponse } from "next/server";
import {
  createSupabaseServerClientWritable,
  applyRememberPreferenceCookie,
} from "@/utils/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClientWritable();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message || "Gagal keluar dari sesi." },
      { status: 500 },
    );
  }

  const response = NextResponse.json({ ok: true });
  applyRememberPreferenceCookie(response, false);
  return response;
}
