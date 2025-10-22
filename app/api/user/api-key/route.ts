import { NextResponse } from 'next/server';
import { supabaseRoute } from '@/lib/supabase-route';
import {
    encryptUserApiKey,
    fetchUserApiKey,
    maskApiKey,
} from '@/lib/user-api-key.server';

export const runtime = 'nodejs';

async function getAuthenticatedSupabase() {
    const supabase = await supabaseRoute();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error('Unauthorized');
    }

    return { supabase, user };
}

export async function GET() {
    try {
        const { supabase, user } = await getAuthenticatedSupabase();

        const info = await fetchUserApiKey(supabase, user.id);

        return NextResponse.json({
            hasKey: info.hasKey,
            masked: info.masked,
            updated_at: info.updatedAt,
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('API Key Fetch Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: `Failed to fetch API key. ${errorMessage}` }, { status: 500 });
    }
}

// Save or update user's API key
export async function POST(request: Request) {
    try {
        const { supabase, user } = await getAuthenticatedSupabase();
        const { apiKey } = await request.json();
        if (!apiKey) {
            return NextResponse.json({ error: 'API key is required' }, { status: 400 });
        }

        const encryptedKey = encryptUserApiKey(apiKey);
        const now = new Date().toISOString();

        const { error } = await supabase
            .from('user_api_keys')
            .upsert(
                { user_id: user.id, api_key: encryptedKey, updated_at: now },
                { onConflict: 'user_id' },
            );

        if (error) throw new Error(error.message);

        return NextResponse.json({
            hasKey: true,
            masked: maskApiKey(apiKey),
            updated_at: now,
        });

    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('API Key Save Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: `Failed to save API key. ${errorMessage}` }, { status: 500 });
    }
}

// Delete user's API key
export async function DELETE() {
    try {
        const { supabase, user } = await getAuthenticatedSupabase();
        const { error } = await supabase
            .from('user_api_keys')
            .delete()
            .eq('user_id', user.id);

        if (error) throw new Error(error.message);

        return NextResponse.json({
            hasKey: false,
            masked: null,
            updated_at: null,
        });

    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('API Key Delete Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: `Failed to delete API key. ${errorMessage}` }, { status: 500 });
    }
}
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { rateLimit } from "@/lib/server/rate-limit";
import { HttpError } from "@/lib/server/http-error";
import {
  censorApiKey,
  fetchStoredApiKey,
  removeUserApiKey,
  upsertUserApiKey,
} from "@/lib/server/user-api-key";

const RATE_LIMIT_WINDOW_MS = 60_000;
const GET_LIMIT = 30;
const MUTATION_LIMIT = 10;

function extractClientIp(request: Request): string {
  const header = request.headers.get("x-forwarded-for");
  if (header) {
    return header.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}

async function guardRateLimit(
  request: Request,
  userId: string,
  action: "get" | "mutate"
) {
  const ip = extractClientIp(request);
  const limit = action === "get" ? GET_LIMIT : MUTATION_LIMIT;
  const key = `${userId}:${ip}:user-api-key:${action}`;
  const result = rateLimit(key, limit, RATE_LIMIT_WINDOW_MS);
  if (!result.ok) {
    throw new HttpError(429, "Terlalu banyak permintaan. Coba lagi nanti.", "rate-limit");
  }
}

export async function GET(request: Request) {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    await guardRateLimit(request, user.id, "get");

    const stored = await fetchStoredApiKey(supabase, user.id);

    return NextResponse.json({
      isSet: Boolean(stored),
      maskedKey: stored ? censorApiKey(stored.decrypted) : null,
      updatedAt: stored?.updatedAt ?? null,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ message: error.message, code: error.code }, { status: error.status });
    }
    console.error("API Key GET Error:", error);
    return NextResponse.json({ message: "Gagal memuat kunci API" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    await guardRateLimit(request, user.id, "mutate");

    const body = await request.json().catch(() => {
      throw new HttpError(400, "Body harus berupa JSON valid", "request/invalid-json");
    });

    const rawKey = String(body.apiKey ?? "").trim();
    if (!rawKey) {
      throw new HttpError(400, "apiKey wajib diisi", "request/missing-api-key");
    }

    if (rawKey.length < 20 || rawKey.length > 200) {
      throw new HttpError(400, "Format kunci API tidak valid", "request/invalid-api-key");
    }

    await upsertUserApiKey(supabase, user.id, rawKey);
    const stored = await fetchStoredApiKey(supabase, user.id);

    return NextResponse.json({
      isSet: true,
      maskedKey: censorApiKey(rawKey),
      updatedAt: stored?.updatedAt ?? new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ message: error.message, code: error.code }, { status: error.status });
    }
    console.error("API Key POST Error:", error);
    return NextResponse.json({ message: "Gagal menyimpan kunci API" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    await guardRateLimit(request, user.id, "mutate");

    await removeUserApiKey(supabase, user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ message: error.message, code: error.code }, { status: error.status });
    }
    console.error("API Key DELETE Error:", error);
    return NextResponse.json({ message: "Gagal menghapus kunci API" }, { status: 500 });
  }
}
