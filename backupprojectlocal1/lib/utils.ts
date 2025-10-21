import { AspectRatio } from "./types";
import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';

/**
 * Converts a data URL string to a base64 data string and its MIME type.
 * @param {string} dataUrl - The data URL to convert.
 * @returns {{ base64Data: string; mimeType: string }}
 */
export const dataUrlToBlob = (dataUrl: string) => {
    const [header, base64Data] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1];
    if (!mimeType || !base64Data) {
        throw new Error('Invalid data URL');
    }
    return { base64Data, mimeType };
};

/**
 * Processes an image using a canvas-like approach on the server with `sharp`
 * to resize and fit it within a target aspect ratio without cropping.
 * @param {string} imageSrc - The base64 data URL of the source image.
 * @param {AspectRatio} targetAspectRatio - The desired aspect ratio.
 * @returns {Promise<string>} A promise that resolves with the data URL of the processed image.
 */
export const processImageWithCanvas = async (imageSrc: string, targetAspectRatio: AspectRatio): Promise<string> => {
    const { base64Data } = dataUrlToBlob(imageSrc);
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const [w, h] = targetAspectRatio.split(':').map(Number);
    if (isNaN(w) || isNaN(h) || h === 0) {
        throw new Error('Invalid aspect ratio format');
    }
    const ratioValue = w / h;
    
    const canvasWidth = 1024;
    const canvasHeight = Math.round(canvasWidth / ratioValue);

    // Create a white canvas background
    const background = await sharp({
        create: {
            width: canvasWidth,
            height: canvasHeight,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 },
        },
    })
    .jpeg()
    .toBuffer();

    // Resize the input image to fit inside the canvas dimensions without cropping
    const resizedImageBuffer = await sharp(imageBuffer)
        .resize({
            width: canvasWidth,
            height: canvasHeight,
            fit: 'inside', // This is key: it scales down to fit, preserving aspect ratio
            withoutEnlargement: true,
        })
        .toBuffer();
    
    // Composite the resized image onto the center of the white canvas
    const finalBuffer = await sharp(background)
        .composite([{ input: resizedImageBuffer, gravity: 'center' }])
        .jpeg({ quality: 95 })
        .toBuffer();
    
    // Convert the final buffer back to a Data URL
    return `data:image/jpeg;base64,${finalBuffer.toString('base64')}`;
};

/**
 * Validates a Google Gemini API key by making a simple request.
 * @param {string} apiKeyToTest - The API key to validate.
 * @returns {Promise<{ valid: boolean; error: string | null }>}
 */
export const validateApiKey = async (apiKeyToTest: string): Promise<{ valid: boolean; error: string | null }> => {
    if (!apiKeyToTest) {
        return { valid: false, error: "Kunci API tidak boleh kosong." };
    }
    try {
        const ai = new GoogleGenAI({ apiKey: apiKeyToTest });
        // Use a lightweight model and method for validation
        // Using countTokens is more efficient than generateContent for validation
        await ai.models.countTokens({model: 'gemini-2.5-flash', contents: 'test'});
        return { valid: true, error: null };
    } catch (err) {
        let errorMessage = "Kunci API tidak valid atau terjadi masalah koneksi.";
        if (err instanceof Error) {
            const lowerMessage = err.message.toLowerCase();
             if (lowerMessage.includes('api key not valid') || lowerMessage.includes('api_key_invalid') || lowerMessage.includes('permission denied')) {
                errorMessage = "Kunci API yang dimasukkan tidak valid atau tidak memiliki izin.";
            } else if (lowerMessage.includes('resource has been exhausted')) {
                errorMessage = "Kunci API ini telah kehabisan kuota.";
            }
        }
        return { valid: false, error: errorMessage };
    }
};
