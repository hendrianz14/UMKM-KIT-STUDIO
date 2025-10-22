import type { SupabaseClient, User } from "@supabase/supabase-js";
import { supabaseRoute } from "@/lib/supabase-route";
import { HttpError } from "./http-error";

type AnySupabaseClient = SupabaseClient<unknown, unknown, unknown>;

export async function getRouteSupabaseClient(): Promise<AnySupabaseClient> {
  return supabaseRoute();
}

export async function getAuthenticatedUser() {
  const supabase = await getRouteSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new HttpError(401, "Unauthorized", "auth/unauthorized");
  }

  return { supabase, user: user as User };
}