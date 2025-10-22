
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
                return NextResponse.json({ error: 'Kunci API sistem tidak dikonfigurasi.' }, { status: 500 });
            }
            apiKey = systemApiKey;

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
                const analysisText = analysisResponse.text ?? '';
                analysisResult = JSON.parse(analysisText);
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
            const interactionText = interactionResponse.text?.trim() ?? '';
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
        const firstCandidate = imageEditResponse.candidates?.[0];
        if (firstCandidate?.content?.parts) {
            for (const part of firstCandidate.content.parts) {
                if (part.inlineData) {
                    imagePart = part;
                    break;
                }
            }
        }

        if (imagePart?.inlineData) {
            const generatedImgSrc = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
            return NextResponse.json({ imageUrl: generatedImgSrc, finalPrompt, generationId });
        }
        
        let errorText = 'Tidak ada gambar yang dihasilkan oleh AI.';
        if (firstCandidate?.content?.parts) {
            for (const part of firstCandidate.content.parts) {
                if (part.text) {
                    errorText = part.text;
                    break;
                }
            }
        }
        throw new Error(errorText);

    } catch (error) {
        console.error('Image Generation API Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: `Gagal membuat gambar. ${errorMessage}` }, { status: 500 });
    }
}
