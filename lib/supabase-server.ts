import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export const REMEMBER_ME_COOKIE = "umkm_remember";
export const DEFAULT_PERSISTENT_MAX_AGE = 60 * 60 * 24 * 30; // 30 hari

export type SessionPersistence = "session" | "persistent";

export interface SupabaseCookieConfig {
  persistence?: SessionPersistence;
  persistentMaxAgeSeconds?: number;
}

interface CookieOptionOverrides extends SupabaseCookieConfig {
  action?: "set" | "remove";
}

export function applyDefaultCookieOptions(
  options?: CookieOptions,
  overrides?: CookieOptionOverrides,
): CookieOptions {
  const isProd = process.env.NODE_ENV === "production";
  const base: CookieOptions = {
    path: options?.path ?? "/",
    sameSite: options?.sameSite ?? "lax",
    secure: options?.secure ?? isProd,
    httpOnly: options?.httpOnly ?? true,
    domain: options?.domain,
    maxAge: options?.maxAge,
    expires: options?.expires,
  };

  if (overrides?.action === "remove") {
    return {
      ...base,
      maxAge: 0,
      expires: new Date(0),
    };
  }

  if (overrides?.persistence === "session") {
    const sessionCookie = { ...base };
    delete sessionCookie.maxAge;
    delete sessionCookie.expires;
    return sessionCookie;
  }

  if (overrides?.persistence === "persistent") {
    const maxAge = overrides.persistentMaxAgeSeconds ?? DEFAULT_PERSISTENT_MAX_AGE;
    return {
      ...base,
      maxAge,
      expires: new Date(Date.now() + maxAge * 1000),
    };
  }

  return base;
}

async function createSupabaseServerClientInternal(
  allowCookieWrite: boolean,
  config?: SupabaseCookieConfig,
) {
  const cookieStore = await cookies();
  const rememberFromCookie = cookieStore.get(REMEMBER_ME_COOKIE)?.value === "1";
  const resolvedPersistence: SessionPersistence =
    config?.persistence ?? (rememberFromCookie ? "persistent" : "session");
  const maxAgeSeconds =
    config?.persistentMaxAgeSeconds ?? DEFAULT_PERSISTENT_MAX_AGE;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return cookieStore.get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          if (!allowCookieWrite) {
            return;
          }

          const cookieOptions = applyDefaultCookieOptions(options, {
            action: "set",
            persistence: resolvedPersistence,
            persistentMaxAgeSeconds: maxAgeSeconds,
          });

          try {
            cookieStore.set({ name, value, ...cookieOptions });
          } catch {
            // Setting cookies inside a Server Component may throw; safe to ignore.
          }
        },
        async remove(name: string, options: CookieOptions) {
          if (!allowCookieWrite) {
            return;
          }

          const cookieOptions = applyDefaultCookieOptions(
            { ...options, maxAge: 0 },
            { action: "remove" },
          );

          try {
            cookieStore.set({ name, value: "", ...cookieOptions });
          } catch {
            // Removing cookies inside a Server Component may throw; safe to ignore.
          }
        },
      },
    },
  );
}

export async function createSupabaseServerClientReadOnly() {
  return createSupabaseServerClientInternal(false);
}

export async function createSupabaseServerClientWritable(
  config?: SupabaseCookieConfig,
) {
  return createSupabaseServerClientInternal(true, config);
}

export function applyRememberPreferenceCookie(
  response: NextResponse,
  remember: boolean,
  options?: { maxAgeSeconds?: number },
) {
  const isProd = process.env.NODE_ENV === "production";
  if (remember) {
    const maxAge = options?.maxAgeSeconds ?? DEFAULT_PERSISTENT_MAX_AGE;
    response.cookies.set({
      name: REMEMBER_ME_COOKIE,
      value: "1",
      maxAge,
      sameSite: "lax",
      secure: isProd,
      httpOnly: true,
      path: "/",
    });
    return;
  }

  response.cookies.set({
    name: REMEMBER_ME_COOKIE,
    value: "",
    maxAge: 0,
    sameSite: "lax",
    secure: isProd,
    httpOnly: true,
    path: "/",
  });
}
