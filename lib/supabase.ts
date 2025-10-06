import { cookies } from "next/headers";
import {
  createClientComponentClient,
  createRouteHandlerClient,
} from "@supabase/auth-helpers-nextjs";

export const supabaseClient = () => createClientComponentClient();
export const supabaseRoute = () => createRouteHandlerClient({ cookies });
