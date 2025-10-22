
import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { supabaseRoute } from '@/lib/supabase-route';
import { professionalPromptLibrary, styleEnhancements } from '@/lib/gemini';
import { dataUrlToBlob, processImageWithCanvas, validateApiKey } from '@/lib/utils';
import { AspectRatio, SelectedStyles } from '@/lib/types';
import { fetchUserApiKey } from '@/lib/user-api-key.server';

export const runtime = 'nodejs';

type ProfessionalCategory = keyof typeof professionalPromptLibrary;

function getProfessionalDetail(
    category: ProfessionalCategory,
    key: string | null | undefined
): string | null {
    if (!key) {
        return null;
    }
    const library = professionalPromptLibrary[category] as Record<string, string>;
    return library[key] ?? key;
}

export async function POST(request: Request) {
    try {
        const supabase = await supabaseRoute();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Anda harus login untuk menggunakan fitur ini.' }, { status: 401 });
        }

        const payload: {
            image: string;
            aspectRatio: AspectRatio;
            selectedStyles: SelectedStyles;
            detectedCategory: string | null;
            detectedSubject: string | null;
            isolateProduct: boolean;
            useOwnApiKey: boolean;
        } = await request.json();

        const {
            image,
            aspectRatio,
            selectedStyles,
            detectedCategory,
            detectedSubject,
            isolateProduct,
            useOwnApiKey,
        } = payload;

        if (!image) {
            return NextResponse.json({ error: 'Image is required' }, { status: 400 });
        }

        let apiKey: string;

        if (useOwnApiKey) {
            const keyInfo = await fetchUserApiKey(supabase, user.id);
            if (!keyInfo.rawKey) {
                return NextResponse.json({ error: 'Kunci API Anda belum tersimpan.' }, { status: 400 });
            }
            apiKey = keyInfo.rawKey;
            const validation = await validateApiKey(apiKey);
            if (!validation.valid) {
                return NextResponse.json({ error: validation.error }, { status: 400 });
            }
        } else {
            apiKey = process.env.GEMINI_API_KEY!;
            if (!apiKey) {
                return NextResponse.json({ error: 'Kunci API sistem tidak dikonfigurasi.' }, { status: 500 });
            }

            const { data: wallet, error: walletError } = await supabase
                .from('credits_wallet')
                .select('balance')
                .eq('user_id', user.id)
                .single();

            if (walletError) {
                console.error('Credit wallet fetch error:', walletError);
                return NextResponse.json({ error: 'Gagal memeriksa saldo kredit.' }, { status: 500 });
            }

            if (Number(wallet?.balance ?? 0) < 5) {
                return NextResponse.json({ error: 'Kredit Anda tidak mencukupi untuk membuat gambar.' }, { status: 402 });
            }
        }

        const generationId = randomUUID();
        const ai = new GoogleGenAI({ apiKey });

        const canvasImage = await processImageWithCanvas(image, aspectRatio);
        const { base64Data, mimeType } = dataUrlToBlob(canvasImage);

        let analyzedStyle: string | null = null;
        let backgroundPrompt = '';

        try {
            const analysisResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [{ inlineData: { mimeType, data: base64Data } }] },
                config: {
                    systemInstruction: 'You are a professional photoshoot director. Analyze the image. First, determine the most fitting professional photography style. Second, suggest a NEW, creative, and professional background that would elevate the subject. Respond ONLY with a JSON object.',
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            style: { type: Type.STRING },
                            background_prompt: { type: Type.STRING },
                        },
                        required: ['style', 'background_prompt'],
                    },
                },
            });
            
            let analysisResult: { style?: string; background_prompt?: string } = {};
            try {
                analysisResult = JSON.parse(analysisResponse.text);
            } catch (jsonError) {
                console.warn('Failed to parse analysis JSON:', analysisResponse.text, jsonError);
            }

            analyzedStyle = analysisResult.style ?? null;
            backgroundPrompt = analysisResult.background_prompt ?? '';
        } catch (analysisError) {
            console.warn('Failed to analyse image style, proceeding with defaults:', analysisError);
        }

        const selectedStyleKey = selectedStyles.style ?? analyzedStyle ?? null;
        const styleDetail = getProfessionalDetail('style', selectedStyleKey);
        const lightingDetail = getProfessionalDetail('lighting', selectedStyles.lighting);
        const compositionDetail = getProfessionalDetail('composition', selectedStyles.composition);
        const moodDetail = getProfessionalDetail('mood', selectedStyles.mood);

        let compositionInstruction = compositionDetail;
        if (selectedStyles.composition === 'Human Element' && detectedSubject) {
            const deepResearchSystemInstruction = `You are an expert in product photography and cultural anthropology. Your task is to describe a natural, context-aware, and culturally appropriate human interaction with a given subject. The output must be a concise phrase suitable for an image generation prompt.

Follow these rules:
1. Analyse the subject and its primary use.
2. Provide a culturally appropriate human interaction in one phrase.
3. The phrase must be short and descriptive without additional explanation.
`;
            const interactionResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [{ text: `Describe a natural, culturally appropriate human interaction with "${detectedSubject}" in a concise phrase.` }] },
                config: { systemInstruction: deepResearchSystemInstruction },
            });
            const interactionText = interactionResponse.text.trim();
            if (interactionText) {
                compositionInstruction = interactionText;
            }
        }

        const finalBackgroundPrompt = selectedStyles.style === 'Clean Catalog'
            ? 'a clean, professional studio shot with a plain, solid light grey or white background and even, soft lighting.'
            : backgroundPrompt || 'a professional studio environment with tasteful, brand-aligned styling.';

        const promptClauses = [
            styleDetail,
            lightingDetail,
            compositionInstruction,
            moodDetail,
        ].filter(Boolean) as string[];

        let finalPrompt: string;
        if (detectedCategory === 'Produk' && isolateProduct) {
            const isClothing =
                detectedSubject &&
                ['baju', 'kemeja', 'gaun', 'jaket', 'celana', 'rok', 'pakaian'].some((keyword) =>
                    detectedSubject.toLowerCase().includes(keyword),
                );
            const clothingInstruction = isClothing ? `SPECIAL INSTRUCTION: ${styleEnhancements['Ghost Mannequin']}` : '';
            finalPrompt = `CRITICAL TASK: Perfectly isolate the main subject, a '${detectedSubject}', from everything else. Reconstruct any obscured parts. Place it onto a new background: '${finalBackgroundPrompt}'. ${clothingInstruction} Apply these professional aesthetic principles:\n${promptClauses.map((clause) => `- ${clause}`).join('\n')}\nMust be hyper-realistic.\n\nABSOLUTE RULE: Do not generate any new text, words, letters, logos, or watermarks. Preserve any text that is part of the original subject, but do not add any extra text elements to the image.`;
        } else {
            finalPrompt = `Task: Transform this image into a professional, hyper-realistic photograph. The main subject must be perfectly integrated into a new background described as: '${finalBackgroundPrompt}'.\n\nApply the following professional photographic principles:\n${promptClauses.map((clause) => `- ${clause}`).join('\n')}\n\nABSOLUTE RULE: Do not generate any new text, words, letters, logos, or watermarks. Preserve any text that is part of the original subject, but do not add any extra text elements to the image.`;
        }

        const imageEditResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [
                { inlineData: { mimeType, data: base64Data } },
                { text: finalPrompt },
            ]},
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        let imagePart;
        for (const part of imageEditResponse.candidates[0].content.parts) {
            if (part.inlineData) {
                imagePart = part;
                break;
            }
        }

        if (imagePart?.inlineData) {
            const generatedImgSrc = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
            return NextResponse.json({ imageUrl: generatedImgSrc, finalPrompt, generationId });
        }
        
        let errorText = 'Tidak ada gambar yang dihasilkan oleh AI.';
        for (const part of imageEditResponse.candidates[0].content.parts) {
            if (part.text) {
                errorText = part.text;
                break;
            }
        }
        throw new Error(errorText);

    } catch (error) {
        console.error('Image Generation API Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: `Gagal membuat gambar. ${errorMessage}` }, { status: 500 });
    }
}
import { NextResponse } from "next/server";
import { authenticatedApiCall, professionalPromptLibrary } from "@/lib/gemini";
import { dataUrlToBlob } from "@/lib/utils";
import { Type, Modality, GenerateContentResponse } from "@google/genai";
import { v4 as uuidv4 } from "uuid";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { ensureSufficientCredits, runJobTransaction } from "@/lib/server/credits";
import { rateLimit } from "@/lib/server/rate-limit";
import { detectBannedKeyword, enforceRequiredPhrase, getRequiredPhrase } from "@/lib/server/prompt";
import { fetchStoredApiKey } from "@/lib/server/user-api-key";
import { HttpError } from "@/lib/server/http-error";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 12;
const REQUIRED_PHRASE = getRequiredPhrase();

type ActionType = "analyze" | "generate";

const CREDIT_COSTS: Record<ActionType, number> = {
  analyze: 0,
  generate: 1,
};

function extractClientIp(request: Request): string {
  const header = request.headers.get("x-forwarded-for");
  if (header) {
    return header.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}

function assertAction(action: unknown): asserts action is ActionType {
  if (action !== "analyze" && action !== "generate") {
    throw new HttpError(400, "Action tidak valid", "request/invalid-action");
  }
}

export async function POST(request: Request) {
  let jobId = uuidv4();
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const ip = extractClientIp(request);

    const body = await request.json().catch(() => {
      throw new HttpError(400, "Body harus berupa JSON valid", "request/invalid-json");
    });

    const { action, imageDataUrl } = body;
    assertAction(action);

    const rateLimitKey = `${user.id}:${ip}:${action}`;
    const rateResult = rateLimit(rateLimitKey, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS);
    if (!rateResult.ok) {
      const retryAfter = Math.ceil((rateResult.retryAfterMs ?? RATE_LIMIT_WINDOW_MS) / 1000);
      return NextResponse.json(
        {
          message: "Terlalu banyak permintaan. Coba lagi beberapa saat.",
          code: "rate-limit",
          retryAfter,
        },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter) },
        }
      );
    }

    if (!imageDataUrl) {
      throw new HttpError(400, "imageDataUrl wajib diisi", "request/missing-image");
    }

    const { base64Data, mimeType, sizeBytes } = (() => {
      try {
        return dataUrlToBlob(imageDataUrl, { maxSizeBytes: MAX_IMAGE_BYTES });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Data URL tidak valid";
        throw new HttpError(400, message, "request/invalid-image");
      }
    })();

    const imagePart = { inlineData: { mimeType, data: base64Data } };

    const useOwnApiKey = Boolean(body.useOwnApiKey);
    let userApiKey: string | null = null;

    if (useOwnApiKey) {
      const storedKey = await fetchStoredApiKey(supabase, user.id);
      if (!storedKey) {
        throw new HttpError(400, "Kunci API pengguna belum disimpan", "api-key/not-set");
      }
      userApiKey = storedKey.decrypted;
    }

    const cost = useOwnApiKey ? 0 : CREDIT_COSTS[action];
    await ensureSufficientCredits(supabase, user.id, cost);

    if (action === "analyze") {
      jobId = uuidv4();
      const analyzeBody = {
        model: "gemini-2.5-flash",
        contents: {
          parts: [
            imagePart,
            {
              text: "Analyze this image and identify the main subject and the most fitting photography category. Your answer must be a JSON object. The available categories are: Food, Drink, Portrait, Landscape, Product, or Default for anything else.",
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: {
                type: Type.STRING,
                description: "The main subject of the image, e.g., 'a cup of coffee' or 'a woman smiling'.",
              },
              category: {
                type: Type.STRING,
                description: "The most fitting photography category from the provided list.",
              },
            },
            required: ["subject", "category"],
          },
        },
      };

      const response: GenerateContentResponse = await authenticatedApiCall(
        "gemini-2.5-flash",
        analyzeBody,
        {
          useOwnApiKey,
          userApiKey,
        }
      );

      if (!response.text) {
        throw new HttpError(500, "AI tidak mengembalikan hasil analisis", "ai/no-text");
      }

      let result: { subject: string; category: string };
      try {
        result = JSON.parse(response.text.trim());
      } catch {
        throw new HttpError(500, "Format respons AI tidak valid", "ai/invalid-json");
      }

      await runJobTransaction(supabase, {
        jobId,
        userId: user.id,
        cost,
        status: "completed",
        prompt: "analyze-image",
        jobType: "analyze",
        outputUrl: null,
        metadata: {
          mimeType,
          sizeBytes,
          result,
          usedOwnKey: useOwnApiKey,
        },
      });

      return NextResponse.json(result);
    }

    // action === "generate"
    jobId = uuidv4();
    const { selectedStyles, detectedSubject, isolateProduct } = body as {
      selectedStyles?: Record<string, string>;
      detectedSubject?: string;
      isolateProduct?: boolean;
    };

    const guardSource = `${detectedSubject ?? ""} ${JSON.stringify(selectedStyles ?? {})}`;
    const bannedKeyword = detectBannedKeyword(guardSource);
    if (bannedKeyword) {
      throw new HttpError(
        400,
        `Prompt mengandung kata terlarang: ${bannedKeyword}`,
        "prompt/banned-keyword"
      );
    }

    let prompt = `A professional photograph of ${detectedSubject || "the subject"}.`;

    if (selectedStyles) {
      for (const [category, style] of Object.entries(selectedStyles)) {
        const promptPart = (professionalPromptLibrary as Record<string, Record<string, string>>)[
          category
        ]?.[style as string];
        if (promptPart) {
          prompt += ` ${promptPart}`;
        }
      }
    }

    if (isolateProduct) {
      prompt +=
        " The product should be isolated, remove any human hands or people from the image for a clean product shot.";
    }

    prompt +=
      " The final image must be a photorealistic, high-quality photograph, not an illustration or drawing. Maintain the original subject matter but apply the requested stylistic changes.";

    prompt = enforceRequiredPhrase(prompt);

    const generateBody = {
      model: "gemini-2.5-flash-image",
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    };

    const response: GenerateContentResponse = await authenticatedApiCall(
      "gemini-2.5-flash-image",
      generateBody,
      {
        useOwnApiKey,
        userApiKey,
      }
    );

    const imagePartResponse = response.candidates?.[0]?.content?.parts?.find(
      (part) => part.inlineData && part.inlineData.mimeType?.startsWith("image/")
    );

    if (!imagePartResponse || !imagePartResponse.inlineData) {
      const finishReason = response.candidates?.[0]?.finishReason;
      if (finishReason === "SAFETY") {
        throw new HttpError(
          400,
          "AI tidak mengembalikan gambar karena melanggar kebijakan safety. Coba ubah prompt atau gambar.",
          "ai/safety"
        );
      }
      throw new HttpError(500, "AI tidak mengembalikan gambar", "ai/no-image");
    }

    const editedBase64 = imagePartResponse.inlineData.data;
    const editedMimeType = imagePartResponse.inlineData.mimeType;
    const editedImageUrl = `data:${editedMimeType};base64,${editedBase64}`;

    await runJobTransaction(supabase, {
      jobId,
      userId: user.id,
      cost,
      status: "completed",
      prompt,
      jobType: "generate",
      outputUrl: editedImageUrl,
      metadata: {
        mimeType,
        sizeBytes,
        selectedStyles,
        detectedSubject,
        isolateProduct,
        usedOwnKey: useOwnApiKey,
        requiredPhrase: REQUIRED_PHRASE,
      },
    });

    return NextResponse.json({
      success: true,
      editedImageUrl,
      fullPrompt: prompt,
      jobId,
      status: "completed",
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { message: error.message, code: error.code, jobId, status: "failed" },
        { status: error.status }
      );
    }

    console.error("API Image Generation Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      {
        message: `Failed to process image: ${errorMessage}`,
        jobId,
        status: "failed",
      },
      { status: 500 }
    );
  }
}
