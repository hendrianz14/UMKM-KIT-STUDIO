import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { dataUrlToBlob, validateApiKey } from '@/lib/utils';
import { supabaseRoute } from '@/lib/supabase-route';
import { fetchUserApiKey } from '@/lib/user-api-key.server';
import { resolvePresetFromCategory } from '@/lib/style-presets';

export const runtime = 'nodejs';

type AnalysisResult = {
  category?: string;
  subject?: string;
  style?: string[];
  lighting?: string[];
  composition?: string[];
  mood?: string[];
};

const CLASSIFICATION_PROMPT = `Analyze the image, identify the main subject.
Classify the image into exactly one category from: Food, Drink, Portrait, Landscape, Product, Default.
Respond ONLY with a JSON object containing "category" and "subject".`;

<<<<<<< ours
=======
const STYLE_ANALYSIS_PROMPT = `You are a senior creative director specialising in commercial photography.
Analyse the image and respond ONLY with a JSON object containing arrays for "style", "lighting", "composition", and "mood".
Each array must have between 3 and 6 concise, professional terms.`;

const INLINE_CLASSIFICATION_PROMPT = `Identify the main subject of the provided image and classify it into exactly one category from: Food, Drink, Portrait, Landscape, Product, Default.
Respond ONLY with JSON matching this schema: { "category": "<one of the categories>", "subject": "<short noun phrase>" }.`;

const DESCRIPTION_CLASSIFICATION_PROMPT = `You are an expert photo art director.
You will receive a textual description of an image. Using only that description, classify the image into exactly one category from: Food, Drink, Portrait, Landscape, Product, Default.
Respond ONLY with JSON matching this schema: { "category": "<one of the categories>", "subject": "<short noun phrase>" }.`;

function extractJsonObject(rawText: string): string | null {
  if (!rawText) {
    return null;
  }
  const start = rawText.indexOf('{');
  const end = rawText.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }
  return rawText.slice(start, end + 1);
}

function decodeAnalysisResult(rawText: string): { result: AnalysisResult | null; warning?: string } {
  const trimmed = rawText.trim();
  const jsonPayload = extractJsonObject(trimmed);
  if (!jsonPayload) {
    return {
      result: null,
      warning: 'Model response did not include a valid JSON object.',
    };
  }

  try {
    const parsed = JSON.parse(jsonPayload) as AnalysisResult;
    return { result: parsed };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown parse error';
    return {
      result: null,
      warning: `Unable to parse analysis JSON: ${message}`,
    };
  }
}

function getResponseText(response: Awaited<ReturnType<GoogleGenAI['models']['generateContent']>>): string {
  if (typeof response.text === 'string' && response.text.trim()) {
    return response.text;
  }

  const candidate = response.candidates?.find((item) =>
    item.content?.parts?.some((part) => 'text' in part && typeof part.text === 'string'),
  );

  if (!candidate?.content?.parts) {
    return '';
  }

  const textPart = candidate.content.parts.find(
    (part): part is { text: string } => 'text' in part && typeof part.text === 'string',
  );

  return textPart?.text ?? '';
}

async function classifyImage(
  ai: GoogleGenAI,
  mimeType: string,
  data: string,
): Promise<{ result: AnalysisResult | null; rawText: string }> {
  const attempts: Array<{
    contents: Parameters<GoogleGenAI['models']['generateContent']>[0]['contents'];
    systemInstruction?: Parameters<GoogleGenAI['models']['generateContent']>[0]['systemInstruction'];
  }> = [
    {
      contents: [{ role: 'user', parts: [{ inlineData: { mimeType, data } }] }],
      systemInstruction: { parts: [{ text: CLASSIFICATION_PROMPT }] },
    },
    {
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType, data } },
            { text: INLINE_CLASSIFICATION_PROMPT },
          ],
        },
      ],
    },
  ];

  let lastRaw = '';
  for (const attempt of attempts) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: attempt.contents,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              category: { type: 'STRING' },
              subject: { type: 'STRING' },
            },
            required: ['category'],
          },
        },
        systemInstruction: attempt.systemInstruction,
      });

      const rawText = getResponseText(response);
      lastRaw = rawText;
      const { result, warning } = decodeAnalysisResult(rawText);
      if (warning) {
        console.warn('Classification parsing warning:', warning, rawText);
      }
      if (result?.category) {
        return { result, rawText };
      }
    } catch (error) {
      console.warn('Classification attempt failed:', error);
    }
  }

  if (lastRaw.trim()) {
    try {
      const descriptionResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: `${lastRaw}\n\n${DESCRIPTION_CLASSIFICATION_PROMPT}` }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              category: { type: 'STRING' },
              subject: { type: 'STRING' },
            },
            required: ['category'],
          },
        },
      });

      const rawText = getResponseText(descriptionResponse);
      const { result, warning } = decodeAnalysisResult(rawText);
      if (warning) {
        console.warn('Description classification parsing warning:', warning, rawText);
      }
      if (result?.category) {
        return { result, rawText };
      }
    } catch (error) {
      console.warn('Description-based classification failed:', error);
    }
  }

  return { result: null, rawText: lastRaw };
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

    const { image, useOwnApiKey } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    let apiKey: string | undefined;

    if (useOwnApiKey) {
      const keyInfo = await fetchUserApiKey(supabase, user.id);
      if (!keyInfo.rawKey) {
        return NextResponse.json(
          { error: 'Kunci API Anda belum tersimpan. Silakan simpan di halaman Settings terlebih dahulu.' },
          { status: 400 },
        );
      }
      apiKey = keyInfo.rawKey;
    } else {
      apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: 'Kunci API sistem tidak tersedia.' }, { status: 500 });
      }
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'Kunci API tidak tersedia.' }, { status: 500 });
    }

    if (useOwnApiKey) {
      const validation = await validateApiKey(apiKey);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    const { base64Data, mimeType } = dataUrlToBlob(image);
    const ai = new GoogleGenAI({ apiKey });

    const classificationResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ inlineData: { mimeType, data: base64Data } }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            category: { type: 'STRING' },
            subject: { type: 'STRING' },
          },
          required: ['category'],
        },
      },
      systemInstruction: {
        parts: [{ text: CLASSIFICATION_PROMPT }],
      },
    });

    const classificationText = getResponseText(classificationResponse);
    const { result: classificationResult, warning: classificationWarning } =
      decodeAnalysisResult(classificationText);
    if (classificationWarning) {
      console.warn('Classification parsing warning:', classificationWarning, classificationText);
    }

    const resolvedCategory = classificationResult?.category;
    const resolvedSubject =
      typeof classificationResult?.subject === 'string' ? classificationResult.subject : null;

    if (!resolvedCategory) {
      throw new Error('Failed to determine category from the image.');
    }

    const { displayName, presets } = resolvePresetFromCategory(resolvedCategory);

    const subject =
      typeof resolvedSubject === 'string' && resolvedSubject.trim().length > 0
        ? resolvedSubject.trim()
        : null;

    return NextResponse.json({
      stylePresets: presets,
      displayCategoryName: displayName,
      subject,
    });
  } catch (error) {
    console.error('Image analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to analyse image. ${errorMessage}` }, { status: 500 });
  }
}
