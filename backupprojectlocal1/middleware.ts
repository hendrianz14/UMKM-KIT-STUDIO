import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const parseCookieHeader = (cookieHeader: string | null) => {
  const store = new Map<string, string>();
  if (!cookieHeader) return store;

  cookieHeader.split(";").forEach((pair) => {
    const [rawName, ...rawValue] = pair.split("=");
    if (!rawName || rawValue.length === 0) return;
    const name = decodeURIComponent(rawName.trim());
    const value = decodeURIComponent(rawValue.join("=").trim());
    store.set(name, value);
  });

  return store;
};

export async function middleware(request: Request) {
  const response = NextResponse.next();
  const cookieStore = parseCookieHeader(request.headers.get("cookie"));
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name),
        set: (name, value, options) => {
          cookieStore.set(name, value);
          response.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          cookieStore.delete(name);
          response.cookies.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentUrl = new URL(request.url);

  const protectedPrefixes = ["/dashboard", "/generate-image", "/generate-caption", "/settings"];

  if (!user && protectedPrefixes.some((prefix) => currentUrl.pathname.startsWith(prefix))) {
    const url = new URL(request.url);
    url.pathname = "/sign-in";
    const redirectTarget = `${currentUrl.pathname}${currentUrl.search}`;
    url.searchParams.set("redirect", redirectTarget || "/dashboard");
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/generate-image/:path*", "/generate-caption/:path*", "/settings/:path*"],
};
