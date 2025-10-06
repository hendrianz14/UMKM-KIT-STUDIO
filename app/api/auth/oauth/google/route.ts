import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const redirect = url.searchParams.get("redirect") || "/dashboard";
  const remember = url.searchParams.get("remember") === "1" ? "1" : "0";

  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?redirect=${encodeURIComponent(redirect)}&remember=${remember}`,
    },
  });
  if (error) return new Response(error.message, { status: 400 });
  return Response.redirect(data.url);
}
