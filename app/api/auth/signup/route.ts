import { supabaseRoute } from "@/lib/supabase";

export async function POST(req: Request) {
  const form = await req.formData();
  const name = String(form.get("name") || "").trim();
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  if (!email || !password) {
    return new Response("Email/Password required", { status: 400 });
  }

  const supabase = supabaseRoute();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });
  if (error) {
    const url = new URL("/register", process.env.NEXT_PUBLIC_SITE_URL);
    url.searchParams.set("error", error.message);
    return Response.redirect(url);
  }
  const url = new URL("/login", process.env.NEXT_PUBLIC_SITE_URL);
  url.searchParams.set("info", "Verifikasi email telah dikirim.");
  return Response.redirect(url);
}
