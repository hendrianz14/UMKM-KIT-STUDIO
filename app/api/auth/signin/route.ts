import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase-route";

const INVALID_RESPONSE = {
  ok: false,
  error: "Kredensial tidak valid",
} as const;

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  const requestedRedirect = String(form.get("redirect") || "/dashboard");
  const redirectPath = requestedRedirect.startsWith("/") ? requestedRedirect : "/dashboard";

  if (!email || !password) {
    return NextResponse.json(INVALID_RESPONSE, { status: 401 });
  }

  const successResponse = NextResponse.json({ ok: true, redirect: redirectPath });
  const supabase = await supabaseRoute(successResponse);
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json(INVALID_RESPONSE, { status: 401 });
  }

  return successResponse;
}
