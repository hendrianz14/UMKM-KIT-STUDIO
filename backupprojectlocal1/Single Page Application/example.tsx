 import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SparklesIcon, DownloadIcon, ImageIcon, UploadIcon, ChevronDownIcon, RefreshCwIcon, InfoIcon, CheckIcon, XIcon, TextIcon, PlusCircleIcon, KeyIcon, CreditIcon } from '../constants';
import { Project } from '../App';

// Helper to convert data URL to base64 string and get mimeType
const dataUrlToBlob = (dataUrl: string) => {
    const [header, base64Data] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1];
    if (!mimeType || !base64Data) {
        throw new Error('Invalid data URL');
    }
    return { base64Data, mimeType };
};


// --- START: DIRECT REST API CALLER (FOR USER KEY ONLY) ---
// Bypasses the SDK to ensure the correct API key is always used without interference.
const callApiDirectly = async (apiKey: string, endpoint: string, body: object, signal: AbortSignal) => {
    const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/';
    const url = `${BASE_URL}${endpoint}?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: signal, // Pass the abort signal to the fetch request
    });

    const responseData = await response.json();
    if (!response.ok) {
        console.error("--- [DIRECT API ERROR] ---", responseData);
        const errorMessage = responseData.error?.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
    }

    return responseData;
};
 const analyzeImageForStyles = async (signal: AbortSignal) => {
        console.log(`--- [analyzeImageForStyles TRIGGERED] ---`);
        if (!originalImage) return;

        setIsAnalyzingStyles(true);
        setError(null);
        setUserApiError(null);

        const isUsingUserKey = useOwnApiKey;
        
        try {
            if(isUsingUserKey) {
                const userKey = localStorage.getItem('user_gemini_api_key');
                if (!userKey) throw new Error("Mode 'Gunakan API Key Sendiri' aktif, tapi tidak ada kunci yang valid.");
                const validationResult = await validateApiKey(userKey, signal);
                if (!validationResult.valid) throw new Error(validationResult.error || "Validasi kunci API gagal.");
            }
            
            const { base64Data, mimeType } = dataUrlToBlob(originalImage);
            const body = {
                contents: [{ parts: [{ inlineData: { mimeType, data: base64Data } }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: { type: "OBJECT", properties: { category: { type: "STRING" }, subject: { type: "STRING" } }, required: ['category', 'subject'] }
                },
                systemInstruction: { parts: [{ text: `Analyze image, identify main subject. Classify into: Food, Drink, Portrait, Landscape, Product, Default. Respond in JSON.` }] }
            };
            // FIX: Use correct model 'gemini-2.5-flash' instead of deprecated model.
            const response = await authenticatedApiCall('gemini-2.5-flash', body, signal);
            const textContent = response.candidates[0].content.parts[0].text;
            console.log('--- [ANALYZE RESPONSE JSON] ---', textContent);
            const { category, subject } = JSON.parse(textContent);
            
            const prettyCategoryName: Record<string, string> = { Food: 'Makanan', Drink: 'Minuman', Portrait: 'Potret', Landscape: 'Pemandangan', Product: 'Produk', Default: 'Umum' };
            const styleCategoryKey = category in stylePresets ? category : 'Default';
            const displayCategoryName = prettyCategoryName[category] || category;

            setCurrentAdvancedStyles(stylePresets[styleCategoryKey]);
            setDetectedCategory(displayCategoryName);
            setDetectedSubject(subject);
        } catch (err) {
            handleGenericError(err, isUsingUserKey);
            setCurrentAdvancedStyles(stylePresets.Default);
            setDetectedCategory('Umum');
        } finally {
            if (!signal.aborted) {
                setIsAnalyzingStyles(false);
            }
        }
    };
    