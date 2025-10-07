import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "./supabase-server";
import type {
  AppData,
  User,
  DashboardStatsData,
  Project,
  CreditHistoryItem,
  Plan,
  SessionUser,
} from "./types";

type ProjectRow = {
  id: number | string;
  title: string;
  type: string | null;
  image_url: string | null;
  user_id: string;
};

type LedgerRow = {
  id: number;
  user_id: string;
  reason: string | null;
  amount: number;
  transaction_no: number | string | null;
  created_at: string;
};

function startOfThisWeekISO() {
  const now = new Date();
  // Minggu dimulai Senin (Asia/Jakarta); hitung relatif local time
  const day = (now.getDay() + 6) % 7; // Sen=0
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() - day);
  return start.toISOString();
}

const planMap: Record<string, Plan> = {
  Free: "Gratis",
  Basic: "Basic",
  Pro: "Pro",
  Business: "Enterprise",
};

type SessionData = {
  user: SessionUser;
};

function buildSessionUser(authUser: SupabaseAuthUser): SessionUser {
  const metadataName =
    (authUser.user_metadata?.full_name as string | undefined) ??
    (authUser.user_metadata?.name as string | undefined) ??
    (authUser.user_metadata?.user_name as string | undefined);

  const fallbackName =
    authUser.email?.split("@")[0] ?? (authUser.phone ?? authUser.id);

  return {
    id: authUser.id,
    name: metadataName?.trim() || fallbackName,
    email: authUser.email ?? "",
  };
}

async function getSupabaseWithUser(): Promise<{
  supabase: ReturnType<typeof createSupabaseServerClient>;
  user: SupabaseAuthUser | null;
}> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null };
  }

  return { supabase, user };
}

export async function getAppData(): Promise<SessionData | null> {
  const { user } = await getSupabaseWithUser();

  if (!user) {
    return null;
  }

  return {
    user: buildSessionUser(user),
  };
}

export async function getDashboardData(): Promise<AppData | null> {
  const { supabase, user: authUser } = await getSupabaseWithUser();

  if (!authUser) {
    return null;
  }

  const uid = authUser.id;

  // profiles + wallet
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, plan, plan_expires_at")
    .eq("user_id", uid)
    .single();

  const { data: wallet } = await supabase
    .from("credits_wallet")
    .select("balance")
    .eq("user_id", uid)
    .single();

  const { data: userApiKeyRow } = await supabase
    .from("user_api_keys")
    .select("updated_at")
    .eq("user_id", uid)
    .maybeSingle();

  // projects
  const { data: projectsRaw } = await supabase
    .from("projects")
    .select("id, title, type, image_url, user_id")
    .eq("user_id", uid)
    .order("created_at", { ascending: false })
    .limit(5);

  const projects: Project[] = (projectsRaw ?? []).map((p: ProjectRow) => ({
    id: Number(p.id),
    title: p.title,
    type: p.type as 'image' | 'caption' | 'video',
    imageUrl: p.image_url ?? "",
    user_id: p.user_id,
    caption: "",
    aspectRatio: "1:1",
  }));

  // credit history (limit 20)
  const { data: ledger } = await supabase
    .from("credits_ledger")
    .select("id, user_id, reason, amount, transaction_no, created_at")
    .eq("user_id", uid)
    .order("created_at", { ascending: false })
    .limit(5);

  const creditHistory: CreditHistoryItem[] = (ledger ?? []).map((l: LedgerRow) => ({
    id: l.id,
    user_id: l.user_id,
    type:
      l.reason === "seed"
        ? "seed"
        : l.reason === "top_up"
        ? "Top Up"
        : l.reason === "refund"
        ? "Refund"
        : l.amount < 0
        ? "Credit Usage"
        : "Credit",
    date: new Date(l.created_at).toISOString(),
    amount: Number(l.amount),
    transactionId: Number(l.transaction_no ?? l.id),
  }));

  // stats: weeklyWork & totalCreditsUsed
  const weekISO = startOfThisWeekISO();
  const { count: weeklyCount } = await supabase
    .from("generations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", uid)
    .eq("status", "succeeded")
    .gte("created_at", weekISO);

  const totalCreditsUsed = creditHistory
    .filter((h) => h.amount < 0)
    .reduce((a, b) => a + Math.abs(b.amount), 0);

  const userData: User = {
    id: uid,
    name: profile?.name || authUser.user_metadata?.name || "User",
    email: authUser.email || "",
    plan: planMap[profile?.plan as string] ?? "Free",
    credits: Number(wallet?.balance ?? 0),
    expiryDate: profile?.plan_expires_at ? new Date(profile.plan_expires_at).toISOString() : "",
  };

  const stats: DashboardStatsData = {
    weeklyWork: weeklyCount || 0,
    totalCreditsUsed,
  };

  return {
    user: userData,
    dashboardStats: stats,
    projects,
    creditHistory,
    userApiKeyStatus: { isSet: Boolean(userApiKeyRow) },
  };
}
