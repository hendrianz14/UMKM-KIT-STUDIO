import { NextResponse } from "next/server";
import { createSupabaseServerClientWritable } from "@/utils/supabase/server";
import { persistSupabaseAuthCookies, DEFAULT_REMEMBER_ME_MAX_AGE_SECONDS } from "@/lib/supabase-auth-cookies";

const normalizeRedirect = (redirect: string) => {
  if (!redirect) return "/dashboard";
  return redirect.startsWith("/") ? redirect : "/dashboard";
};


export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  const rememberRaw = form.get("remember");
  const remember =
    rememberRaw === "on" ||
    rememberRaw === "true" ||
    rememberRaw === "1";
  const requestedRedirect = String(form.get("redirect") || "/dashboard");
  const redirectPath = normalizeRedirect(requestedRedirect);

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: "Email dan kata sandi wajib diisi." },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClientWritable();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message || "Kredensial tidak valid." },
      { status: 400 },
    );
  const redirectPath = requestedRedirect.startsWith("/") ? requestedRedirect : "/dashboard";
  const requestUrl = new URL(req.url);

  if (!email || !password) {
    return redirectWithError(requestUrl, redirectPath, INVALID_RESPONSE.error);
  }

  const redirectUrl = new URL(redirectPath, requestUrl.origin);
  const successResponse = NextResponse.redirect(redirectUrl, 303);
  const supabase = await supabaseRoute(successResponse);
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const message = error.message?.trim() || INVALID_RESPONSE.error;
    return redirectWithError(requestUrl, redirectPath, message);
  }

  if (remember) {
    persistSupabaseAuthCookies(DEFAULT_REMEMBER_ME_MAX_AGE_SECONDS);
  }

  return NextResponse.json({ ok: true, redirect: redirectPath });
}

function redirectWithError(requestUrl: URL, redirectPath: string, message: string) {
  const errorUrl = new URL("/sign-in", requestUrl.origin);
  errorUrl.searchParams.set("error", message);
  errorUrl.searchParams.set("redirect", redirectPath);
  return NextResponse.redirect(errorUrl, 303);
}
