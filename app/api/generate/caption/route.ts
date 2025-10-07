
import { NextResponse } from 'next/server';
import { authenticatedApiCall } from '@/lib/gemini';
import { dataUrlToBlob } from '@/lib/utils';
import { GenerateContentResponse, Type } from '@google/genai';

export async function POST(request: Request) {
  try {
    const { imageDataUrl, useOwnApiKey, userApiKey } = await request.json();

    if (!imageDataUrl) {
      return NextResponse.json({ message: 'imageDataUrl is required' }, { status: 400 });
    }

    const { base64Data, mimeType } = dataUrlToBlob(imageDataUrl);

    // Correct body structure for generateContent
    const body = {
        model: 'gemini-2.5-flash',
        contents: { parts: [{ inlineData: { mimeType, data: base64Data } }, { text: "Write a short, engaging, creative social media caption in Indonesian with hashtags." }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: { type: Type.OBJECT, properties: { caption: { type: Type.STRING } }, required: ['caption'] },
            systemInstruction: "You are a professional social media manager."
        },
    };

    const response: GenerateContentResponse = await authenticatedApiCall('gemini-2.5-flash', body, { useOwnApiKey, userApiKey });
    
    // Correct way to get text from response
    const resultText = response.text;
    if (!resultText) {
      throw new Error("Failed to generate caption: No text content in response.");
    }
    const result = JSON.parse(resultText.trim());

    return NextResponse.json({ success: true, caption: result.caption });

  } catch (error) {
    console.error('API Caption Generation Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: `Failed to generate caption: ${errorMessage}` }, { status: 500 });
  }
}
