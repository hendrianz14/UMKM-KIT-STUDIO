import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { dataUrlToBlob, validateApiKey } from '@/lib/utils';
import { supabaseRoute } from '@/lib/supabase-route';
import { fetchUserApiKey } from '@/lib/user-api-key.server';

export const runtime = 'nodejs';

const SYSTEM_PROMPT_TEXT = `Kamu adalah manajer media sosial profesional berbahasa Indonesia untuk UMKM.
- Tulis caption yang singkat, menarik, dan persuasif (maksimal 2-3 kalimat).
- Sertakan 3 sampai 5 hashtag relevan di akhir, dipisahkan spasi.
- Gunakan nada yang ramah dan profesional.
- Jika sesuai, tambahkan ajakan bertindak (call-to-action) yang halus.
- Jawab HANYA dengan format JSON yang diminta.`;

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
            return NextResponse.json({ error: 'Data gambar diperlukan' }, { status: 400 });
        }

        let apiKey: string;

        if (useOwnApiKey) {
            const keyInfo = await fetchUserApiKey(supabase, user.id);
            const rawKey = keyInfo.rawKey;
            if (!rawKey) {
                return NextResponse.json({ error: 'Kunci API Anda belum tersimpan.' }, { status: 400 });
            }
            apiKey = rawKey;
            const validation = await validateApiKey(apiKey);
            if (!validation.valid) {
                return NextResponse.json({ error: validation.error }, { status: 400 });
            }
        } else {
            const systemApiKey = process.env.GEMINI_API_KEY;
            if (!systemApiKey) {
                return NextResponse.json({ error: "Kunci API sistem tidak dikonfigurasi." }, { status: 500 });
            }
            apiKey = systemApiKey;
        }

        const ai = new GoogleGenAI({ apiKey });
        const { base64Data, mimeType } = dataUrlToBlob(image);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            // PERBAIKAN 1: Menggunakan format `contents: { parts: [...] }`
            contents: {
                parts: [
                    { inlineData: { mimeType, data: base64Data } },
                    { text: "Tulis caption sosial media dalam Bahasa Indonesia yang kreatif dan profesional untuk gambar ini." }
                ]
            },
            // PERBAIKAN 2: Menggabungkan semua konfigurasi ke dalam objek `config`
            config: {
                systemInstruction: SYSTEM_PROMPT_TEXT,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        caption: { type: Type.STRING }
                    },
                    required: ["caption"]
                }
            }
        });

        // PERBAIKAN 3: Menggunakan `response.text` dan parsing yang aman
        const jsonText = response.text ?? '';
        let result: { caption: string };

        try {
            result = JSON.parse(jsonText);
        } catch (e) {
            console.error("Gagal mem-parsing JSON dari respons AI:", jsonText);
            throw new Error("AI mengembalikan format yang tidak valid.");
        }

        if (!result.caption) {
             throw new Error("AI tidak menghasilkan caption.");
        }

        return NextResponse.json({ caption: result.caption });

    } catch (error) {
        console.error('Caption Generation API Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: `Gagal membuat caption. ${errorMessage}` }, { status: 500 });
    }
}
