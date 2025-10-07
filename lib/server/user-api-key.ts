import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "./http-error";

type AnySupabaseClient = SupabaseClient<unknown, unknown, unknown>;

type ApiKeyRow = {
  encrypted_key: string;
  updated_at?: string | null;
  created_at?: string | null;
};

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey(): Buffer {
  const secret = process.env.USER_API_KEY_SECRET;
  if (!secret) {
    throw new HttpError(500, "USER_API_KEY_SECRET belum dikonfigurasi", "config/missing_secret");
  }
  return createHash("sha256").update(secret, "utf8").digest();
}

function encryptPlaintext(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted.toString("base64")}`;
}

function decryptCiphertext(payload: string): string {
  const key = getEncryptionKey();
  const [ivB64, tagB64, dataB64] = payload.split(":");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new HttpError(500, "Format kunci terenkripsi tidak valid", "api-key/invalid_format");
  }
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export function censorApiKey(key: string): string {
  if (!key) {
    return "";
  }
  if (key.length <= 7) {
    return `${key.substring(0, 3)}****`;
  }
  return `${key.substring(0, 3)}********************${key.substring(key.length - 4)}`;
}

export async function fetchStoredApiKey(
  supabase: AnySupabaseClient,
  userId: string
): Promise<{ decrypted: string; updatedAt: string | null } | null> {
  const { data, error } = await supabase
    .from("user_api_keys")
    .select("encrypted_key, updated_at, created_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new HttpError(500, `Gagal mengambil kunci API: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const row = data as ApiKeyRow;
  const decrypted = decryptCiphertext(row.encrypted_key);
  return {
    decrypted,
    updatedAt: row.updated_at ?? row.created_at ?? null,
  };
}

export async function upsertUserApiKey(
  supabase: AnySupabaseClient,
  userId: string,
  apiKey: string
) {
  const encrypted = encryptPlaintext(apiKey);
  const { error } = await supabase
    .from("user_api_keys")
    .upsert({
      user_id: userId,
      encrypted_key: encrypted,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    throw new HttpError(500, `Gagal menyimpan kunci API: ${error.message}`);
  }
}

export async function removeUserApiKey(
  supabase: AnySupabaseClient,
  userId: string
) {
  const { error } = await supabase
    .from("user_api_keys")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw new HttpError(500, `Gagal menghapus kunci API: ${error.message}`);
  }
}