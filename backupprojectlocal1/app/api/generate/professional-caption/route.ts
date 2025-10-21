// This is a placeholder for a more advanced caption generation.
// You can expand this with more complex logic, similar to the image generation route.
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { dataUrlToBlob, validateApiKey } from '@/lib/utils';
import { supabaseRoute } from '@/lib/supabase-route';
import { extractTextFromResponse } from '@/lib/gemini-response';
import { fetchUserApiKey } from '@/lib/user-api-key.server';

export const runtime = 'nodejs';

const generateProfessionalCaption = async (apiKey: string, image: string, subject: string) => {
    const ai = new GoogleGenAI({ apiKey });
    const { base64Data, mimeType } = dataUrlToBlob(image);

    const systemPrompt = `You are an expert social media copywriter for small businesses. Your goal is to write a compelling, concise, and engaging caption in Indonesian. 
    - Analyze the image and the subject: "${subject}".
    - The tone should be positive and professional.
    - Include 3-5 relevant and popular hashtags.
    - The caption should be no more than 2 sentences.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            { inlineData: { mimeType, data: base64Data } },
            { text: "Gunakan instruksi sistem untuk membuat caption profesional singkat." }
        ],
        systemInstruction: {
            parts: [{ text: systemPrompt }],
        },
    });

    const caption = extractTextFromResponse(response).trim();

    if (!caption) {
        throw new Error('Model tidak menghasilkan caption.');
    }

    return caption;
};

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

        const { image, subject, useOwnApiKey } = await request.json();

        if (!image || !subject) {
            return NextResponse.json({ error: 'Image and subject are required' }, { status: 400 });
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
                return NextResponse.json({ error: "System API key not configured." }, { status: 500 });
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
        
        const caption = await generateProfessionalCaption(apiKey, image, subject);

        return NextResponse.json({ caption });

    } catch (error) {
        console.error('Professional Caption API Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: `Failed to generate professional caption. ${errorMessage}` }, { status: 500 });
    }
}
