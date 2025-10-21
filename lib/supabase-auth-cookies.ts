import { cookies } from "next/headers";

export const DEFAULT_REMEMBER_ME_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;


const isProd = process.env.NODE_ENV === "production";

/**
 * Extend Supabase auth cookies with a persistent max-age.
 * Applies to every cookie that starts with the "sb-" prefix.
 */
export function persistSupabaseAuthCookies(maxAgeSeconds: number) {
  if (!maxAgeSeconds || maxAgeSeconds <= 0) {
    return;
  }

  const cookieStore = cookies();
  const expires = new Date(Date.now() + maxAgeSeconds * 1000);

  cookieStore
    .getAll()
    .filter((cookie) => cookie.name.startsWith("sb-"))
    .forEach((cookie) => {
      cookieStore.set({
        name: cookie.name,
        value: cookie.value,
        httpOnly: true,
        sameSite: "lax",
        secure: isProd,
        path: "/",
        maxAge: maxAgeSeconds,
        expires,
      });
    });
}

export function clearSupabaseAuthCookies() {
  const cookieStore = cookies();
  cookieStore
    .getAll()
    .filter((cookie) => cookie.name.startsWith("sb-"))
    .forEach((cookie) => {
      cookieStore.set({
        name: cookie.name,
        value: "",
        httpOnly: true,
        sameSite: "lax",
        secure: isProd,
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
    });
}
