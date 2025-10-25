import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import { createSupabaseServerClientReadOnly } from "./supabase-server";
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
  image_storage_path?: string | null;
  caption?: string | null;
  aspect_ratio?: string | null;
  prompt_details?: string | null;
  prompt_full?: string | null;
  user_id: string;
  created_at?: string;
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

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClientReadOnly>>;

async function getSupabaseWithUser(): Promise<{
  supabase: SupabaseServerClient;
  user: SupabaseAuthUser | null;
}> {
  const supabase = await createSupabaseServerClientReadOnly();
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

  // projects
  const { data: projectsRaw } = await supabase
    .from("projects")
    .select("id, title, type, image_url, image_storage_path, caption, aspect_ratio, prompt_details, prompt_full, user_id, created_at")
    .eq("user_id", uid)
    .order("created_at", { ascending: false })
    .limit(12);

  const projects: Project[] = (projectsRaw ?? []).map((p: ProjectRow) => ({
    id: Number(p.id),
    title: p.title,
    type:
      p.type === "image"
        ? "Gambar AI"
        : p.type === "caption"
        ? "Caption AI"
        : p.type === "video"
        ? "Video AI"
        : String(p.type ?? ""),
    imageUrl: p.image_url ?? null,
    imageStoragePath: p.image_storage_path ?? null,
    caption: p.caption ?? null,
    aspectRatio: p.aspect_ratio ?? null,
    promptDetails: p.prompt_details ?? null,
    promptFull: p.prompt_full ?? null,
    user_id: p.user_id,
    created_at: p.created_at ?? null,
  }));

  // credit history (limit 20)
  const { data: ledger } = await supabase
    .from("credits_ledger")
    .select("id, user_id, reason, amount, transaction_no, created_at")
    .eq("user_id", uid)
    .order("created_at", { ascending: false })
    .limit(20);

  const creditHistory: CreditHistoryItem[] = (ledger ?? []).map((l: LedgerRow) => {
    const reason = (l.reason || "").toLowerCase();
    let typeLabel: string;

    if (["seed", "bonus", "welcome_bonus", "onboarding_bonus"].includes(reason)) {
      typeLabel = "Bonus";
    } else if (["top_up", "topup"].includes(reason)) {
      typeLabel = "Top Up";
    } else if (["refund", "reversal"].includes(reason)) {
      typeLabel = "Refund";
    } else if (["image_generation", "image", "generate_image"].includes(reason)) {
      typeLabel = "Generate Gambar";
    } else if (["caption_generation", "caption", "generate_caption"].includes(reason)) {
      typeLabel = "Generate Caption";
    } else if (Number(l.amount) < 0) {
      typeLabel = "Penggunaan Kredit";
    } else {
      typeLabel = "Kredit";
    }

    return {
      id: l.id,
      user_id: l.user_id,
      type: typeLabel,
      date: new Date(l.created_at).toISOString(),
      amount: Number(l.amount),
      transactionId: Number(l.transaction_no ?? l.id),
    } as CreditHistoryItem;
  });

  // stats: weeklyWork & totalCreditsUsed
  // weeklyWork dihitung dari berapa kali kredit berkurang (amount < 0) minggu ini
  const weekISO = startOfThisWeekISO();
  const { count: weeklyCount } = await supabase
    .from("credits_ledger")
    .select("id", { count: "exact", head: true })
    .eq("user_id", uid)
    .lt("amount", 0)
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
  };
}
