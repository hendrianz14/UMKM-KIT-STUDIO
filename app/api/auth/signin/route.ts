import { NextResponse } from "next/server";
import {
  createSupabaseServerClientWritable,
  applyRememberPreferenceCookie,
} from "@/utils/supabase/server";

const normalizeRedirect = (redirect: string) => {
  if (!redirect) return "/dashboard";
  return redirect.startsWith("/") ? redirect : "/dashboard";
};

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  const rememberRaw = form.get("remember");
  const remember = ["1", "on", "true"].includes(String(rememberRaw));
  const requestedRedirect = String(form.get("redirect") || "/dashboard");
  const redirectPath = normalizeRedirect(requestedRedirect);

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: "Email dan kata sandi wajib diisi." },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClientWritable({
    persistence: remember ? "persistent" : "session",
  });
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const response = NextResponse.json(
      { ok: false, error: error.message || "Kredensial tidak valid." },
      { status: 400 },
    );
    if (!remember) {
      applyRememberPreferenceCookie(response, false);
    }
    return response;
  }

  const response = NextResponse.json({ ok: true, redirect: redirectPath });
  applyRememberPreferenceCookie(response, remember);
  return response;
}
