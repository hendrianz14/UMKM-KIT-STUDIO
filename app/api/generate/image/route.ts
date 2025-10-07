
import { NextResponse } from 'next/server';
import { authenticatedApiCall, professionalPromptLibrary } from '@/lib/gemini';
import { dataUrlToBlob } from '@/lib/utils';
import { Type, Modality, GenerateContentResponse } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, imageDataUrl, useOwnApiKey, userApiKey } = body;

        if (!action || !imageDataUrl) {
            return NextResponse.json({ message: 'action and imageDataUrl are required' }, { status: 400 });
        }

        const { base64Data, mimeType } = dataUrlToBlob(imageDataUrl);
        const imagePart = { inlineData: { mimeType, data: base64Data } };

        if (action === 'analyze') {
            const analyzeBody = {
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, { text: "Analyze this image and identify the main subject and the most fitting photography category. Your answer must be a JSON object. The available categories are: Food, Drink, Portrait, Landscape, Product, or Default for anything else." }] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            subject: { type: Type.STRING, description: "The main subject of the image, e.g., 'a cup of coffee' or 'a woman smiling'." },
                            category: { type: Type.STRING, description: "The most fitting photography category from the provided list." }
                        },
                        required: ['subject', 'category']
                    },
                }
            };

            const response: GenerateContentResponse = await authenticatedApiCall('gemini-2.5-flash', analyzeBody, { useOwnApiKey, userApiKey });
            if (!response.text) {
                throw new Error("AI response did not contain text.");
            }
            const resultText = response.text.trim();
            const result = JSON.parse(resultText);

            return NextResponse.json(result);

        } else if (action === 'generate') {
            const { selectedStyles, detectedSubject, isolateProduct } = body;

            // Build the professional prompt on the server
            let prompt = `A professional photograph of ${detectedSubject || 'the subject'}.`;

            if (selectedStyles) {
                for (const [category, style] of Object.entries(selectedStyles)) {
                    const promptPart = (professionalPromptLibrary as Record<string, Record<string, string>>)[category]?.[style as string];
                    if (promptPart) {
                        prompt += ` ${promptPart}`;
                    }
                }
            }

            if (isolateProduct) {
                prompt += " The product should be isolated, remove any human hands or people from the image for a clean product shot.";
            }

            prompt += " The final image must be a photorealistic, high-quality photograph, not an illustration or drawing. Maintain the original subject matter but apply the requested stylistic changes.";

            const generateBody = {
                model: 'gemini-2.5-flash-image',
                contents: { parts: [imagePart, { text: prompt }] },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            };
            
            const jobId = uuidv4();

            const response: GenerateContentResponse = await authenticatedApiCall('gemini-2.5-flash-image', generateBody, { useOwnApiKey, userApiKey });
            
            const imagePartResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('image/'));

            if (!imagePartResponse || !imagePartResponse.inlineData) {
                const safetyFeedback = response.candidates?.[0]?.safetyRatings;
                console.error("Image generation failed. Safety feedback:", safetyFeedback);
                const finishReason = response.candidates?.[0]?.finishReason;
                if (finishReason === 'SAFETY') {
                     throw new Error("AI did not return an image due to a safety policy violation. Try a different image or style.");
                }
                throw new Error("AI did not return an image. This could be due to a complex prompt or temporary issue.");
            }

            const editedBase64 = imagePartResponse.inlineData.data;
            const editedMimeType = imagePartResponse.inlineData.mimeType;
            const editedImageUrl = `data:${editedMimeType};base64,${editedBase64}`;
            
            return NextResponse.json({ 
                success: true, 
                editedImageUrl, 
                fullPrompt: prompt,
                jobId: jobId,
                status: 'completed' // For immediate processing
            });
        } else {
            return NextResponse.json({ message: 'Invalid action specified' }, { status: 400 });
        }
    } catch (error) {
        console.error('API Image Generation Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ 
            message: `Failed to process image: ${errorMessage}`,
            jobId: uuidv4(), // Still return a job ID for tracking
            status: 'failed'
        }, { status: 500 });
    }
}
