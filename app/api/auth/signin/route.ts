import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: Request) {
  const f = await req.formData();
  const email = String(f.get("email")||"").trim();
  const password = String(f.get("password")||"");
  const remember = f.get("remember") === "on";
  const redirect = String(f.get("redirect")||"/dashboard");
  if (!email || !password) return new Response("Email/Password required", { status: 400 });

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

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const u = new URL("/login", process.env.NEXT_PUBLIC_SITE_URL); u.searchParams.set("error","Kredensial tidak valid");
    return Response.redirect(u);
  }
  return Response.redirect(new URL(redirect, process.env.NEXT_PUBLIC_SITE_URL));
}
