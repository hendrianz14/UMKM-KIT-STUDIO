import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { dataUrlToBlob, validateApiKey } from '@/lib/utils';
import { supabaseRoute } from '@/lib/supabase-route';
import { extractTextFromResponse } from '@/lib/gemini-response';
import { fetchUserApiKey } from '@/lib/user-api-key.server';

export const runtime = 'nodejs';

const SYSTEM_PROMPT_TEXT = `Kamu adalah manajer media sosial profesional berbahasa Indonesia. 
- Tulis caption singkat maksimal 2 kalimat.
- Sertakan 3 sampai 5 hashtag relevan di akhir.
- Gunakan nada yang ramah namun persuasif dan sebutkan ajakan bertindak jika sesuai.
- Jangan gunakan emoji kecuali memang relevan dengan topik.`;

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

        const { image, topic, useOwnApiKey } = await request.json();

        if (!image && !topic) {
            return NextResponse.json({ error: 'Image or topic is required' }, { status: 400 });
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
                return NextResponse.json({ error: "Kunci API sistem tidak dikonfigurasi." }, { status: 500 });
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

        const ai = new GoogleGenAI({ apiKey });

        if (image) {
            const { base64Data, mimeType } = dataUrlToBlob(image);
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                    { inlineData: { mimeType, data: base64Data } },
                    { text: "Tulis caption sosial media Indonesia yang kreatif untuk gambar di atas." }
                ],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            caption: { type: "STRING" }
                        },
                        required: ["caption"]
                    }
                },
                systemInstruction: {
                    parts: [{ text: SYSTEM_PROMPT_TEXT }]
                }
            });

            const jsonText = extractTextFromResponse(response) || '{"caption": ""}';
            const result = JSON.parse(jsonText);
            return NextResponse.json({ caption: result.caption });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [`Topik utama: "${topic}"`],
            systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT_TEXT }]
            }
        });

        const caption = extractTextFromResponse(response).trim();
        if (!caption) {
            throw new Error('Model tidak menghasilkan caption.');
        }

        return NextResponse.json({ caption });

    } catch (error) {
        console.error('Caption Generation API Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: `Failed to generate caption. ${errorMessage}` }, { status: 500 });
    }
}
