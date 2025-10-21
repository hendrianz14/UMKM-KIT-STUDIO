import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase-route";
import {
  persistSupabaseAuthCookies,
  DEFAULT_REMEMBER_ME_MAX_AGE_SECONDS,
} from "@/lib/supabase-auth-cookies";

export async function GET(req: Request) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const redirectParam = requestUrl.searchParams.get("redirect") || "/dashboard";
  const remember =
    requestUrl.searchParams.get("remember") === "1";
  const redirectPath = redirectParam.startsWith("/") ? redirectParam : "/dashboard";
  const origin = requestUrl.origin;

  const successResponse = NextResponse.redirect(new URL(redirectPath, origin));

  if (!code) {
    return successResponse;
  }

  const supabase = await supabaseRoute(successResponse);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const errorUrl = new URL("/sign-in", origin);
    errorUrl.searchParams.set("error", "Kredensial tidak valid");
    errorUrl.searchParams.set("redirect", redirectPath);
    return NextResponse.redirect(errorUrl);
  }

  if (remember) {
    persistSupabaseAuthCookies(DEFAULT_REMEMBER_ME_MAX_AGE_SECONDS);
  }

  return successResponse;
}
