import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  DEFAULT_PERSISTENT_MAX_AGE,
  REMEMBER_ME_COOKIE,
  applyDefaultCookieOptions,
} from '@/lib/supabase-server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const rememberFromCookie =
    request.cookies.get(REMEMBER_ME_COOKIE)?.value === '1'
  const persistence = rememberFromCookie ? 'persistent' : 'session'
  const maxAgeSeconds = DEFAULT_PERSISTENT_MAX_AGE

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          const cookieOptions = applyDefaultCookieOptions(options, {
            action: 'set',
            persistence,
            persistentMaxAgeSeconds: maxAgeSeconds,
          })
          request.cookies.set({
            name,
            value,
            ...cookieOptions,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...cookieOptions })
        },
        remove(name: string, options: CookieOptions) {
          const cookieOptions = applyDefaultCookieOptions(
            { ...options, maxAge: 0 },
            { action: 'remove' },
          )
          request.cookies.set({
            name,
            value: '',
            ...cookieOptions,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...cookieOptions })
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}
