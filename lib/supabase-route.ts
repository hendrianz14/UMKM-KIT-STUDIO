import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { NextResponse } from "next/server";
import {
  DEFAULT_PERSISTENT_MAX_AGE,
  REMEMBER_ME_COOKIE,
  applyDefaultCookieOptions,
  type SupabaseCookieConfig,
} from "./supabase-server";

export async function supabaseRoute(
  response?: NextResponse,
  config?: SupabaseCookieConfig,
) {
  const store = await cookies();
  const rememberFromCookie = store.get(REMEMBER_ME_COOKIE)?.value === "1";
  const persistence =
    config?.persistence ?? (rememberFromCookie ? "persistent" : "session");
  const maxAgeSeconds =
    config?.persistentMaxAgeSeconds ?? DEFAULT_PERSISTENT_MAX_AGE;

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
          const cookieOptions = applyDefaultCookieOptions(options, {
            action: "set",
            persistence,
            persistentMaxAgeSeconds: maxAgeSeconds,
          });

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
          const cookieOptions = applyDefaultCookieOptions(
            { ...options, maxAge: 0 },
            { action: "remove" },
          );

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
    },
  );
}
