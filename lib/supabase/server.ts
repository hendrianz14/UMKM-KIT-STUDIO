import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { useMemo } from 'react';

// Common cookie options for security
const getCookieOptions = () => ({
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
});

/**
 * Creates a Supabase client for Server Components (read-only).
 * This client is safe for use in layouts, pages, and other Server Components.
 * It will not attempt to write cookies, relying on middleware for session refreshing.
 */
export const createClient = () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookieStore = await cookies();
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
};

/**
 * Creates a Supabase client for Server Actions and Route Handlers (writable).
 * This is the client to use when you need to perform operations that
 * might result in setting or removing cookies (e.g., auth actions, session refresh).
 */
export const createActionClient = () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookieStore = await cookies();
          return cookieStore.get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            const cookieStore = await cookies();
            cookieStore.set({ name, value, ...options, ...getCookieOptions() });
          } catch (error) {
            // This can happen if the headers are already sent.
            // In a Server Action or Route Handler, this should be rare.
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            const cookieStore = await cookies();
            cookieStore.set({ name, value: '', ...options, ...getCookieOptions() });
          } catch (error) {
            // Same as above.
          }
        },
      },
    }
  );
};
