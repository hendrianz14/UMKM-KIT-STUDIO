import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const redirect = url.searchParams.get("redirect") || "/dashboard";
  const remember = url.searchParams.get("remember") === "1";

  const store = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {
        get: (n) => store.get(n)?.value,
        set: (n,v,o) => store.set({ name:n, value:v, ...o, ...(remember ? { maxAge: 60*60*24*30 } : {}) }),
        remove: (n,o) => store.set({ name:n, value:"", ...o, maxAge:0 }),
      }
    }
  );

  if (code) await supabase.auth.exchangeCodeForSession(code);
  return Response.redirect(new URL(redirect, url.origin));
}
