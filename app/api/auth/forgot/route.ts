import { supabaseRoute } from "@/lib/supabase";

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") || "").trim();
  if (!email) {
    return new Response("Email required", { status: 400 });
  }

  const supabase = supabaseRoute();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  });
  if (error) {
    return new Response(error.message, { status: 400 });
  }
  return new Response(null, { status: 204 });
}
