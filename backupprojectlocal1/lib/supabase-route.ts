import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { NextResponse } from "next/server";
import { applyDefaultCookieOptions } from "./supabase-server";

export async function supabaseRoute(response?: NextResponse) {
  const store = await cookies();

  const syncResponseCookie = response
    ? (name: string, value: string, options: CookieOptions) => {
        response.cookies.set({ name, value, ...options });
      }
    : undefined;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return store.get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          const cookieOptions = applyDefaultCookieOptions(options);

          try {
            store.set({ name, value, ...cookieOptions });
          } catch {
            // Writing cookies can throw in some runtimes; safe to ignore.
          }

          if (syncResponseCookie) {
            syncResponseCookie(name, value, cookieOptions);
          }
        },
        async remove(name: string, options: CookieOptions) {
          const cookieOptions = applyDefaultCookieOptions({
            ...options,
            maxAge: 0,
          });

          try {
            store.set({ name, value: "", ...cookieOptions });
          } catch {
            // Removing cookies can throw in some runtimes; safe to ignore.
          }

          if (syncResponseCookie) {
            syncResponseCookie(name, "", cookieOptions);
          }
        },
      },
    }
  );
}
