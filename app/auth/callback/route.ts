import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase-route";

export async function GET(req: Request) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const redirectParam = requestUrl.searchParams.get("redirect") || "/dashboard";
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

  return successResponse;
}
