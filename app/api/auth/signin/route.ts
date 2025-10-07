import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase-route";

const INVALID_RESPONSE = {
  ok: false,
  error: "Kredensial tidak valid",
} as const;

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  const requestedRedirect = String(form.get("redirect") || "/dashboard");
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

  return successResponse;
}

function redirectWithError(requestUrl: URL, redirectPath: string, message: string) {
  const errorUrl = new URL("/sign-in", requestUrl.origin);
  errorUrl.searchParams.set("error", message);
  errorUrl.searchParams.set("redirect", redirectPath);
  return NextResponse.redirect(errorUrl, 303);
}
