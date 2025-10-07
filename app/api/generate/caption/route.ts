import { NextResponse } from "next/server";
import { authenticatedApiCall } from "@/lib/gemini";
import { dataUrlToBlob } from "@/lib/utils";
import { GenerateContentResponse, Type } from "@google/genai";
import { v4 as uuidv4 } from "uuid";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { ensureSufficientCredits, runJobTransaction } from "@/lib/server/credits";
import { rateLimit } from "@/lib/server/rate-limit";
import { fetchStoredApiKey } from "@/lib/server/user-api-key";
import { HttpError } from "@/lib/server/http-error";
import { detectBannedKeyword } from "@/lib/server/prompt";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const CREDIT_COST = 1;
const RATE_LIMIT_MAX_REQUESTS = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;

function extractClientIp(request: Request): string {
  const header = request.headers.get("x-forwarded-for");
  if (header) {
    return header.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  const jobId = uuidv4();
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const ip = extractClientIp(request);

    const body = await request.json().catch(() => {
      throw new HttpError(400, "Body harus berupa JSON valid", "request/invalid-json");
    });

    const { imageDataUrl } = body;
    if (!imageDataUrl) {
      throw new HttpError(400, "imageDataUrl wajib diisi", "request/missing-image");
    }

    const rateKey = `${user.id}:${ip}:caption`;
    const rateResult = rateLimit(rateKey, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS);
    if (!rateResult.ok) {
      const retryAfter = Math.ceil((rateResult.retryAfterMs ?? RATE_LIMIT_WINDOW_MS) / 1000);
      return NextResponse.json(
        {
          message: "Terlalu banyak permintaan. Coba lagi beberapa saat.",
          code: "rate-limit",
          retryAfter,
        },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    const { base64Data, mimeType, sizeBytes } = (() => {
      try {
        return dataUrlToBlob(imageDataUrl, { maxSizeBytes: MAX_IMAGE_BYTES });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Data URL tidak valid";
        throw new HttpError(400, message, "request/invalid-image");
      }
    })();

    const guardSource = body.detectedSubject ?? "";
    const bannedKeyword = detectBannedKeyword(String(guardSource));
    if (bannedKeyword) {
      throw new HttpError(
        400,
        `Prompt mengandung kata terlarang: ${bannedKeyword}`,
        "prompt/banned-keyword"
      );
    }

    const useOwnApiKey = Boolean(body.useOwnApiKey);
    let userApiKey: string | null = null;

    if (useOwnApiKey) {
      const storedKey = await fetchStoredApiKey(supabase, user.id);
      if (!storedKey) {
        throw new HttpError(400, "Kunci API pengguna belum disimpan", "api-key/not-set");
      }
      userApiKey = storedKey.decrypted;
    }

    const cost = useOwnApiKey ? 0 : CREDIT_COST;
    await ensureSufficientCredits(supabase, user.id, cost);

    const bodyPayload = {
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          {
            text: "Write a short, engaging, creative social media caption in Indonesian with hashtags.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { caption: { type: Type.STRING } },
          required: ["caption"],
        },
        systemInstruction: "You are a professional social media manager.",
      },
    };

    const response: GenerateContentResponse = await authenticatedApiCall(
      "gemini-2.5-flash",
      bodyPayload,
      {
        useOwnApiKey,
        userApiKey,
      }
    );

    if (!response.text) {
      throw new HttpError(500, "AI tidak mengembalikan caption", "ai/no-text");
    }

    let captionResult: { caption: string };
    try {
      captionResult = JSON.parse(response.text.trim());
    } catch {
      throw new HttpError(500, "Format respons AI tidak valid", "ai/invalid-json");
    }

    await runJobTransaction(supabase, {
      jobId,
      userId: user.id,
      cost,
      status: "completed",
      prompt: "generate-caption",
      jobType: "caption",
      outputUrl: null,
      metadata: {
        caption: captionResult.caption,
        mimeType,
        sizeBytes,
        usedOwnKey: useOwnApiKey,
      },
    });

    return NextResponse.json({ success: true, caption: captionResult.caption, jobId });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { message: error.message, code: error.code, jobId, status: "failed" },
        { status: error.status }
      );
    }

    console.error("API Caption Generation Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { message: `Failed to generate caption: ${errorMessage}`, jobId, status: "failed" },
      { status: 500 }
    );
  }
}