import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function applyDefaultCookieOptions(options?: CookieOptions): CookieOptions {
  const isProd = process.env.NODE_ENV === "production";

  return {
    ...(options ?? {}),
    sameSite: options?.sameSite ?? "lax",
    secure: options?.secure ?? isProd,
  } as CookieOptions;
}

async function createSupabaseServerClientInternal(allowCookieWrite: boolean) {
  const cookieStore = await cookies();

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

          const cookieOptions = applyDefaultCookieOptions(options);

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

          const cookieOptions = applyDefaultCookieOptions({
            ...options,
            maxAge: 0,
          });

          try {
            cookieStore.set({ name, value: "", ...cookieOptions });
          } catch {
            // Removing cookies inside a Server Component may throw; safe to ignore.
          }
        },
      },
    }
  );
}

export async function createSupabaseServerClientReadOnly() {
  return createSupabaseServerClientInternal(false);
}

export async function createSupabaseServerClientWritable() {
  return createSupabaseServerClientInternal(true);
}
