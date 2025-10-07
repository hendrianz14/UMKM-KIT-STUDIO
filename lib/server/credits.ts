import type { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "./http-error";

type AnySupabaseClient = SupabaseClient<unknown, unknown, unknown>;

export interface CreditCheck {
  balance: number;
}

export async function getWalletBalance(
  supabase: AnySupabaseClient,
  userId: string
): Promise<CreditCheck> {
  const { data, error } = await supabase
    .from("credits_wallet")
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new HttpError(500, `Gagal mengambil saldo kredit: ${error.message}`);
  }

  if (!data) {
    throw new HttpError(404, "Dompet kredit tidak ditemukan", "credits/wallet_missing");
  }

  return { balance: Number(data.balance ?? 0) };
}

export async function ensureSufficientCredits(
  supabase: AnySupabaseClient,
  userId: string,
  requiredCredits: number
): Promise<CreditCheck> {
  const wallet = await getWalletBalance(supabase, userId);

  if (requiredCredits > 0 && wallet.balance < requiredCredits) {
    throw new HttpError(402, "Kredit tidak cukup", "credits/insufficient");
  }

  return wallet;
}

export interface JobTransactionPayload {
  jobId: string;
  userId: string;
  cost: number;
  status: string;
  prompt: string;
  jobType: string;
  outputUrl?: string | null;
  metadata?: Record<string, unknown> | null;
}

const RPC_NAME = "spend_credits_and_log_job"; // See README for SQL definition

export async function runJobTransaction(
  supabase: AnySupabaseClient,
  payload: JobTransactionPayload
) {
  const { jobId, userId, cost, status, prompt, jobType, outputUrl, metadata } = payload;

  const { error } = await supabase.rpc(RPC_NAME, {
    p_job_id: jobId,
    p_user_id: userId,
    p_cost: cost,
    p_status: status,
    p_prompt: prompt,
    p_job_type: jobType,
    p_output_url: outputUrl ?? null,
    p_metadata: metadata ?? null,
  });

  if (error) {
    throw new HttpError(500, `Gagal menyimpan job dan debit kredit: ${error.message}`);
  }
}