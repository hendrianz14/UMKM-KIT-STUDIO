import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase-route";
import { applyRememberPreferenceCookie } from "@/utils/supabase/server";

export async function GET(req: Request) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const redirectParam = requestUrl.searchParams.get("redirect") || "/dashboard";
  const redirectPath = redirectParam.startsWith("/") ? redirectParam : "/dashboard";
  const rememberParam = requestUrl.searchParams.get("remember");
  const rememberPreference =
    rememberParam === "1" ? true : rememberParam === "0" ? false : null;
  const origin = requestUrl.origin;

  const successResponse = NextResponse.redirect(new URL(redirectPath, origin));

  if (!code) {
    if (rememberPreference !== null) {
      applyRememberPreferenceCookie(successResponse, rememberPreference);
    }
    return successResponse;
  }

  const supabase = await supabaseRoute(
    successResponse,
    rememberPreference === null
      ? undefined
      : {
          persistence: rememberPreference ? "persistent" : "session",
        },
  );
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (rememberPreference !== null) {
    applyRememberPreferenceCookie(successResponse, rememberPreference);
  }

  if (error) {
    const errorUrl = new URL("/sign-in", origin);
    errorUrl.searchParams.set("error", "Kredensial tidak valid");
    errorUrl.searchParams.set("redirect", redirectPath);
    return NextResponse.redirect(errorUrl);
  }

  return successResponse;
}
