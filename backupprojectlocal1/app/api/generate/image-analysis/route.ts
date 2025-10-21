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
};

const CLASSIFICATION_PROMPT = `Analyze image, identify main subject. Classify into: Food, Drink, Portrait, Landscape, Product, Default. Respond ONLY with the JSON object.`;

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

    // --- PERBAIKAN UTAMA DI SINI ---
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      // PERUBAHAN 1: Menyederhanakan format `contents` untuk permintaan tunggal.
      contents: { parts: [{ inlineData: { mimeType, data: base64Data } }] },
      // PERUBAHAN 2: Semua konfigurasi digabung dalam satu objek `config`.
      config: {
        systemInstruction: CLASSIFICATION_PROMPT,
        responseMimeType: "application/json",
        responseSchema: { 
          type: "OBJECT", 
          properties: { 
            category: { type: "STRING" }, 
            subject: { type: "STRING" } 
          }, 
          required: ['category', 'subject'] 
        }
      },
    });

    // PERUBAHAN 3: Menggunakan `response.text` untuk mengambil hasil JSON secara andal.
    const classificationText = response.text;

    if (!classificationText) {
      console.error('Invalid response structure from AI. Text is empty.', { response });
      throw new Error('Gagal mendapatkan respons teks dari AI.');
    }
    
    let classificationResult: AnalysisResult;
    try {
        // PERUBAHAN 4: Membungkus JSON.parse dalam try-catch untuk keamanan.
        classificationResult = JSON.parse(classificationText);
    } catch(e) {
        console.error("Failed to parse JSON response from AI:", classificationText);
        throw new Error("Gagal mem-parsing respons JSON dari AI.");
    }
    
    if (!classificationResult?.category) {
      console.error('Final classification failed', { text: classificationText });
      throw new Error('Gagal menentukan kategori dari gambar.');
    }

    const resolvedCategory = classificationResult.category;
    const resolvedSubject =
      typeof classificationResult.subject === 'string' ? classificationResult.subject : null;

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
    // Memberikan pesan error yang lebih deskriptif ke client
    return NextResponse.json({ error: `Gagal menganalisis gambar: ${errorMessage}` }, { status: 500 });
  }
}