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
// --- END: DIRECT REST API CALLER ---

// --- START: PROFESSIONAL PROMPT LIBRARY ---
// This library translates simple user choices into detailed, technical instructions for the AI.
const professionalPromptLibrary = {
    style: {
        'Cinematic': "Emulate a cinematic film still. Utilize dramatic, high-contrast lighting, a shallow depth of field to create bokeh, and apply professional color grading, often with teal and orange tones, to evoke a specific emotion.",
        'Minimalist': "Create a minimalist aesthetic by focusing on simplicity, negative space, and a limited color palette. The composition must be clean, uncluttered, and highlight the subject's essential form.",
        'Vintage': "Recreate the look of a vintage photograph from the 1970s. Apply a warm, slightly faded color treatment, add subtle film grain, and use lighting characteristic of that era.",
        'Dark & Moody': "Use dramatic, low-key lighting (chiaroscuro) with deep shadows and selective highlights to create a mysterious and atmospheric mood. Emphasize texture and form.",
        'Clean & Bright': "Produce a high-key image with bright, airy lighting, soft shadows, and a clean, vibrant color palette. The scene should feel fresh, positive, and full of light.",
        'Food Porn': "An extreme close-up, highly detailed, and appetizing shot. Emphasize textures like melting, dripping, or glistening elements. Use vibrant, saturated colors and dramatic lighting to make the food look irresistible.",
        'Hero Shot': "Create a dramatic 'hero shot' of the product. It should be presented at a slightly low angle to make it look imposing and iconic. Lighting should be dramatic and the focus should be sharp on the product.",
        'Abstract': "Create an abstract interpretation of the subject. Focus on form, color, and texture rather than a literal representation. Use unconventional angles, macro shots, and creative lighting to deconstruct the subject into its basic visual elements.",
        'Rustic': "Create a warm and authentic rustic aesthetic. Use natural materials like old wood, rough linen, and iron tableware. Lighting should be soft and natural, and food styling should feel simple and unpretentious.",
        'Splash': "Capture a dynamic high-speed action shot. Show liquid splashing or being poured with motion frozen in time. Lighting should be sharp to highlight every droplet and liquid texture.",
        'Lifestyle': "Present the product in a natural and aspirational everyday context. The image should tell a story and include relevant human or environmental elements to create an authentic atmosphere.",
        'Fashion': "Create an editorial fashion photograph. Focus on the clothing and styling, with strong and expressive poses. The background and lighting should complement the garments, often in a dramatic or conceptual way.",
        'Fine Art': "Produce an artistic and conceptual portrait, not just a representation. Use symbolism, unusual lighting, and careful composition to convey a deeper idea or emotion.",
        'Candid': "Capture a candid, un-posed moment. The subject should appear natural and unaware of the camera, creating a sense of authenticity and spontaneity.",
        'Headshot': "Create a professional headshot. The primary focus is on the face, typically from the shoulders up. Lighting should be flattering and the background neutral, with a confident and approachable expression.",
        'Epic': "Capture a majestic and expansive landscape. Use a wide-angle lens, dramatic scale (e.g., a small person in a large landscape), and breathtaking light (like a storm or sunrise) to create a sense of awe.",
        'Long Exposure': "Use a long exposure technique to blur moving elements like water or clouds, creating a smooth, dreamlike effect. Stationary elements should remain sharp.",
        'Infrared': "Simulate infrared photography. Foliage should appear bright white, skies become dark, and contrast is high, creating a surreal, otherworldly look.",
        'Aerial': "Capture the scene from an aerial perspective, as if from a drone or airplane. Showcase patterns, textures, and a unique point of view that can only be seen from above.",
        'Clean Catalog': "Create a clean, professional studio shot with a solid light grey or white background. The lighting should be even and soft, showcasing the product clearly without distracting shadows.",
    },
    lighting: {
        'Dramatic': "Use high-contrast lighting with hard shadows to create a sense of drama and tension. The light source should be directional and sculpt the subject's features.",
        'Soft Light': "Employ soft, diffused lighting to create gentle shadows and a flattering, smooth look. This can be achieved with a large light source like an overcast sky or a softbox.",
        'Golden Hour': "Simulate the lighting of the golden hour (just after sunrise or before sunset). The light should be soft, warm, and directional, creating long, gentle shadows and bathing the scene in a golden hue.",
        'Studio Light': "Replicate a professional studio lighting setup. Use controlled lighting with key, fill, and rim lights to perfectly shape the subject and separate it from the background.",
        'Backlit': "Position the main light source behind the subject, creating a bright rim or halo effect. This should highlight the subject's silhouette and create a sense of depth and drama.",
        'Hard Shadow': "Use a single, small, hard light source to create sharp, well-defined shadows. This adds drama, contrast, and a graphic quality to the image.",
        'Natural Light': "Use only available natural light, such as light from a window. Create soft shadows and natural light transitions for a realistic and authentic look.",
        'Rembrandt': "Use Rembrandt lighting technique. This is a dramatic portrait lighting setup using one light source and a reflector, characterized by a triangle of light on the subject's less illuminated cheek.",
        'Neon': "Utilize neon lights as the primary light source. Create a futuristic, urban, or retro mood with vibrant colors from the neon signs reflecting on the subject.",
        'Blue Hour': "Capture the scene during the blue hour (the period shortly before sunrise or after sunset). The scene should be imbued with a soft, calm, deep blue light, often contrasted with warm city lights.",
        'Misty': "Create a mysterious atmosphere with dense fog or mist. The mist should simplify the scene, obscure details in the distance, and create layers of depth.",
        'Dramatic Sky': "Focus on a dramatic sky as a key element. Feature menacing storm clouds, a fiery sunset, or unique cloud formations.",
        'Ring Light': "Use a ring light to create even, almost shadowless illumination, ideal for beauty products or close-up shots. It often produces a signature circular catchlight in reflective surfaces.",
    },
    composition: {
        'Close-up': "Frame the subject tightly, focusing on a specific detail to create intimacy and highlight texture. Fill the frame with the subject.",
        'Wide Shot': "Capture a wide shot that shows the subject within its environment. This composition should establish context and a sense of scale.",
        'Portrait': "Compose a classic portrait. The focus should be on the subject's face and expression, using techniques like a shallow depth of field to blur the background.",
        'Top-down': "Arrange a flat lay composition viewed directly from above. The arrangement of objects must be deliberate, clean, and graphically interesting.",
        'Rule of Thirds': "Apply the rule of thirds for a balanced and dynamic composition. Place the main subject or key points of interest off-center, along the grid lines or at their intersections.",
        'Human Element': "Introduce a natural human element to add a sense of scale and story, such as a hand interacting with the subject (e.g., holding a cup, sprinkling garnish), but keep the focus on the main subject.",
        '45-Degree Angle': "Shoot from a 45-degree angle, which is the most common viewpoint when eating. This composition provides depth and shows the side and top of the subject simultaneously.",
        'Garnishes': "Focus on the details of the garnish on the drink, such as fruit slices, mint leaves, or a cocktail umbrella. Use a shallow depth of field to make the garnish sharp while the rest of the drink is slightly blurred.",
        'Medium Shot': "Frame the subject from approximately the waist up. This composition is close enough to see facial expressions but wide enough to include some body language and environmental context.",
        'Full Body': "Capture the subject's entire body from head to toe. This composition is great for showing fashion, posture, and the subject's interaction with their environment.",
        'Leading Lines': "Use natural or man-made lines (like a road, river, or fence) to guide the viewer's eye through the image, usually towards a main point of focus.",
        'Framing': "Use elements in the foreground (like tree branches, an archway, or a window) to create a natural frame around the main subject, adding depth and context.",
        'Symmetry': "Create a symmetrically balanced composition, often using reflections in water to create a perfect mirror effect.",
        'Isometric': "Present the product from an isometric angle. This creates a clean, graphic, flat 3D look, often used for tech products or to showcase multiple facets at once.",
        'Group Shot': "Arrange multiple products together in a balanced and visually appealing composition. Ensure each product is clearly visible and the styling feels intentional.",
        'Floating': "Create the effect of the product floating in mid-air. This gives a modern, clean, and dynamic look, often with a soft drop shadow underneath to ground it and give a sense of depth.",
    },
    mood: {
        'Misterius': "Evoke a mysterious mood using techniques like chiaroscuro (strong contrast between light and dark), deep shadows, perhaps with elements of fog or haze, and a cooler color palette to create a sense of intrigue and the unknown.",
        'Ceria': "Create a cheerful and happy atmosphere with bright, warm lighting, vibrant colors, and dynamic composition. The scene should feel energetic and positive.",
        'Tenang': "Establish a calm and peaceful mood. Use soft, diffused lighting, a muted or harmonious color palette, and simple, balanced compositions.",
        'Energik': "Generate an energetic and dynamic feel using high-contrast lighting, bold colors, diagonal lines, and a sense of motion (e.g., motion blur, dynamic angles).",
        'Elegan': "Convey elegance and sophistication. Use clean compositions, soft and controlled lighting, a refined color palette, and a focus on high-quality textures and details.",
        'Lezat': "Create a very appetizing visual. Focus on rich textures, ripe and saturated colors, and details like glistening sauces, melting cheese, or thin warm steam to signify the deliciousness and freshness of the dish.",
        'Segar': "Visually display the subject's freshness. Use bright and clean lighting, vibrant and lively colors, and details like dewdrops on fruits/vegetables, or a crisp and clean texture. Avoid heavy shadows.",
        'Hangat': "Evoke a feeling of warmth and comfort. Use a warm color palette (yellows, oranges, reds), soft lighting, and details like steam rising from a hot drink or food. The background might have a soft focus to enhance the intimate atmosphere.",
        'Rumahan': "Create a comfortable and unpretentious homely atmosphere. Use props from natural materials like wood or rough ceramics, slightly imperfect plating to show a handmade impression, and soft natural lighting as if from a window.",
        'Menyegarkan': "Produce a visual that feels refreshing and cooling. Emphasize details like condensation on a cold glass, liquid splashes, bubbles, and fresh fruit slices. Use a cool color palette (blues, greens, whites) and bright, clear lighting.",
        'Santai': "Create a relaxed and informal atmosphere. Use soft natural lighting, a comfortable and not-too-busy background (like an afternoon porch or a cozy sofa), and a composition that feels natural and unstaged.",
        'Profesional': "Create a professional and competent atmosphere. Use clean lighting, a non-distracting background (like a modern office or solid backdrop), and a pose that conveys confidence.",
        'Intim': "Evoke a sense of closeness and intimacy. Use tight framing (close-ups), soft lighting, and focus on details of expression or gentle touch to create an emotional connection with the viewer.",
        'Megah': "Capture a majestic and expansive scene. Use a wide-angle lens, dramatic scale (e.g., a small person in a large landscape), and breathtaking light (like a storm or sunrise) to create a sense of awe.",
        'Damai': "Create a peaceful and serene atmosphere. Use soft light, harmonious colors, and balanced, simple compositions. The scene should feel still and quiet.",
        'Dramatis': "Create a dramatic mood. Use high-contrast lighting, strong shadows, imposing weather conditions (like a storm), or intense, powerful colors.",
        'Modern': "Produce a modern, clean aesthetic. Use bold lines, a limited color palette, minimalist backgrounds, and sharp, crisp lighting.",
        'Premium': "Convey a sense of luxury and high quality. Use rich materials in the background (like marble, silk), sophisticated lighting, and an extremely sharp focus on the product's details and craftsmanship.",
        'Fun': "Create a cheerful and fun atmosphere. Use bright, poppy colors, dynamic backgrounds, playful props, and energetic compositions.",
        'Natural': "Present the subject in a natural environment. Use organic elements like plants, wood, or stone, and leverage natural lighting to create an authentic and grounded feel."
    }
};
// --- END: PROFESSIONAL PROMPT LIBRARY ---


const Spinner: React.FC<{ size?: string }> = ({ size = 'h-8 w-8' }) => (
    <svg className={`animate-spin text-[#0D47A1] ${size}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const LoadingComponent: React.FC<{ message: string }> = ({ message }) => (
    <div className="absolute inset-0 bg-gray-50/80 rounded-xl flex flex-col items-center justify-center backdrop-blur-sm p-4 z-10">
        <Spinner />
        <p className="text-[#1565C0] font-semibold mt-4 text-center">{message}</p>
    </div>
);

type AspectRatio = '1:1' | '4:5' | '16:9' | '9:16';
const aspectRatios: { value: AspectRatio; label: string; icon: React.ReactNode }[] = [
    { value: '1:1', label: '1:1', icon: <div className="w-6 h-6 border-2 border-current rounded-sm" /> },
    { value: '4:5', label: '4:5', icon: <div className="w-5 h-6 border-2 border-current rounded-sm" /> },
    { value: '16:9', label: '16:9', icon: <div className="w-8 h-[18px] border-2 border-current rounded-sm" /> },
    { value: '9:16', label: '9:16', icon: <div className="w-[18px] h-8 border-2 border-current rounded-sm" /> },
];

const aspectRatioClasses: Record<AspectRatio, string> = {
    '1:1': 'aspect-square',
    '4:5': 'aspect-[4/5]',
    '16:9': 'aspect-video',
    '9:16': 'aspect-[9/16]',
};

// --- START: Context-Aware Style Presets ---
type StyleCategory = 'style' | 'lighting' | 'composition' | 'mood';
type StyleOption = { category: StyleCategory; name: string; options: string[] };

const stylePresets: Record<string, StyleOption[]> = {
    Default: [
        { category: 'style', name: 'Gaya Fotografi', options: ['Cinematic', 'Minimalist', 'Vintage', 'Abstract'] },
        { category: 'lighting', name: 'Pencahayaan', options: ['Dramatic', 'Soft Light', 'Golden Hour', 'Studio Light'] },
        { category: 'composition', name: 'Komposisi', options: ['Close-up', 'Wide Shot', 'Portrait', 'Top-down'] },
        { category: 'mood', name: 'Suasana', options: ['Misterius', 'Ceria', 'Tenang', 'Energik', 'Elegan'] },
    ],
    Food: [
        { category: 'style', name: 'Gaya Fotografi Makanan', options: ['Dark & Moody', 'Minimalist', 'Rustic', 'Clean & Bright', 'Food Porn'] },
        { category: 'lighting', name: 'Pencahayaan', options: ['Natural Light', 'Soft Light', 'Backlit', 'Hard Shadow'] },
        { category: 'composition', name: 'Komposisi', options: ['Top-down', 'Close-up', '45-Degree Angle', 'Human Element'] },
        { category: 'mood', name: 'Suasana', options: ['Lezat', 'Segar', 'Hangat', 'Elegan', 'Rumahan'] },
    ],
    Drink: [
        { category: 'style', name: 'Gaya Fotografi Minuman', options: ['Splash', 'Minimalist', 'Lifestyle', 'Dark & Moody'] },
        { category: 'lighting', name: 'Pencahayaan', options: ['Backlit', 'Natural Light', 'Studio Light', 'Hard Shadow'] },
        { category: 'composition', name: 'Komposisi', options: ['Close-up', 'Garnishes', 'Human Element', 'Top-down'] },
        { category: 'mood', name: 'Suasana', options: ['Menyegarkan', 'Hangat', 'Elegan', 'Santai'] },
    ],
    Portrait: [
        { category: 'style', name: 'Gaya Fotografi Potret', options: ['Cinematic', 'Fashion', 'Fine Art', 'Candid', 'Headshot'] },
        { category: 'lighting', name: 'Pencahayaan', options: ['Rembrandt', 'Golden Hour', 'Studio Light', 'Dramatic', 'Neon'] },
        { category: 'composition', name: 'Komposisi', options: ['Close-up', 'Medium Shot', 'Full Body', 'Rule of Thirds'] },
        { category: 'mood', name: 'Suasana', options: ['Ceria', 'Misterius', 'Profesional', 'Elegan', 'Intim'] },
    ],
    Landscape: [
        { category: 'style', name: 'Gaya Fotografi Pemandangan', options: ['Epic', 'Long Exposure', 'Minimalist', 'Infrared', 'Aerial'] },
        { category: 'lighting', name: 'Pencahayaan', options: ['Golden Hour', 'Blue Hour', 'Misty', 'Dramatic Sky'] },
        { category: 'composition', name: 'Komposisi', options: ['Wide Shot', 'Leading Lines', 'Framing', 'Symmetry'] },
        { category: 'mood', name: 'Suasana', options: ['Tenang', 'Megah', 'Misterius', 'Damai', 'Dramatis'] },
    ],
    Product: [
        { category: 'style', name: 'Gaya Fotografi Produk', options: ['Clean Catalog', 'Lifestyle', 'Minimalist', 'Hero Shot'] },
        { category: 'lighting', name: 'Pencahayaan', options: ['Studio Light', 'Soft Light', 'Dramatic', 'Ring Light'] },
        { category: 'composition', name: 'Komposisi', options: ['Close-up', 'Isometric', 'Group Shot', 'Floating'] },
        { category: 'mood', name: 'Suasana', options: ['Elegan', 'Modern', 'Premium', 'Fun', 'Natural'] },
    ],
};

const styleEnhancements: Record<string, string> = {
    'Splash': 'Create a dynamic high-speed action shot. The main subject should be captured as if suspended or floating in mid-air with a zero-gravity effect, showing dramatic splashes of liquid frozen in time. Lighting must highlight the droplets and liquid texture. This composition should be used by default unless another composition is explicitly chosen.',
    'Clean Catalog': 'A clean, professional studio shot with a plain, solid light grey or white background. The lighting should be even and soft, showcasing the product clearly without distracting shadows. This style overrides any other background suggestions.',
    'Ghost Mannequin': 'The clothing must be displayed using the "invisible mannequin" technique. It should have a realistic 3D shape as if worn, but the model is invisible. Show the inside of the back of the collar/neckline to complete the effect.',
};

type SelectedStyles = {
    [key: string]: string | null;
};

interface SavedStyle {
    id: number;
    name: string;
    styles: SelectedStyles;
}

interface GenerateImagePageProps {
    onSaveProject: (project: Project) => void;
    onNavigate: (page: 'dashboard' | 'settings') => void;
    onCreditDeduction: (amount: number) => void;
    userCredits: number;
}

const ErrorModal: React.FC<{ isOpen: boolean; onClose: () => void; message: string }> = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" style={{ animation: 'fadeInUp 0.3s ease-out forwards' }} onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <XIcon className="h-6 w-6 text-red-600" strokeWidth="2.5" />
                </div>
                <h3 className="text-xl font-bold text-[#0D47A1] mt-4">Terjadi Kesalahan</h3>
                <p className="text-gray-600 mt-2 mb-6 text-sm">{message}</p>
                <button 
                    onClick={onClose} 
                    className="w-full px-4 py-2 font-semibold text-white bg-[#0D47A1] rounded-lg hover:bg-[#1565C0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1565C0]"
                >
                    Mengerti
                </button>
            </div>
        </div>
    );
};

const UserApiErrorModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    message: string;
    onGoToSettings: () => void;
}> = ({ isOpen, onClose, message, onGoToSettings }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" style={{ animation: 'fadeInUp 0.3s ease-out forwards' }} onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <KeyIcon className="h-6 w-6 text-red-600" strokeWidth="2" />
                </div>
                <h3 className="text-xl font-bold text-[#0D47A1] mt-4">Masalah Kunci API</h3>
                <p className="text-gray-600 mt-2 mb-6 text-sm">{message}</p>
                <div className="space-y-3">
                    <button 
                        onClick={onGoToSettings} 
                        className="w-full px-4 py-2 font-semibold text-white bg-[#0D47A1] rounded-lg hover:bg-[#1565C0]"
                    >
                        Perbarui Kunci API
                    </button>
                    <button 
                        onClick={onClose} 
                        className="w-full px-4 py-2 font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

const GenerateImagePage: React.FC<GenerateImagePageProps> = ({ onSaveProject, onNavigate, onCreditDeduction, userCredits }) => {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [userApiError, setUserApiError] = useState<string | null>(null);
    
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [selectedStyles, setSelectedStyles] = useState<SelectedStyles>({});
    const [isAnalyzingStyles, setIsAnalyzingStyles] = useState(false);
    const [currentAdvancedStyles, setCurrentAdvancedStyles] = useState<StyleOption[]>(stylePresets.Default);
    const [detectedCategory, setDetectedCategory] = useState<string | null>(null);
    const [detectedSubject, setDetectedSubject] = useState<string | null>(null);
    const [isolateProduct, setIsolateProduct] = useState<boolean>(true);
    const [generationSuccess, setGenerationSuccess] = useState(false);
    const [savedStyles, setSavedStyles] = useState<SavedStyle[]>([]);
    const [fullPromptForSaving, setFullPromptForSaving] = useState<string>('');
    const [isSaveStyleModalOpen, setIsSaveStyleModalOpen] = useState(false);
    const [newPresetName, setNewPresetName] = useState('');
    const [presetNameError, setPresetNameError] = useState<string | null>(null);
    const [userApiKey, setUserApiKey] = useState<string | null>(null);
    const [useOwnApiKey, setUseOwnApiKey] = useState(false);

    const [projectTitle, setProjectTitle] = useState('');
    const [generatedCaption, setGeneratedCaption] = useState('');
    const [isCaptionLoading, setIsCaptionLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const storedKey = localStorage.getItem('user_gemini_api_key');
        if (storedKey) {
            setUserApiKey(storedKey);
            setUseOwnApiKey(true);
        }
    }, []);

    const validateApiKey = useCallback(async (apiKeyToTest: string, signal: AbortSignal): Promise<{ valid: boolean; error: string | null }> => {
        const maskedKey = apiKeyToTest ? `${apiKeyToTest.substring(0, 4)}...${apiKeyToTest.substring(apiKeyToTest.length - 4)}` : 'null or empty';
        console.log(`--- [VALIDATION] Attempting to validate API key: ${maskedKey}`);
        if (!apiKeyToTest) {
            return { valid: false, error: "Kunci API tidak boleh kosong." };
        }
        try {
            const body = { contents: [{ parts: [{ text: "test" }] }] };
            await callApiDirectly(apiKeyToTest, 'gemini-2.5-flash:countTokens', body, signal);
            console.log('--- [VALIDATION] SUCCESS: API key is valid.');
            return { valid: true, error: null };
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                console.log('--- [VALIDATION] Aborted by user.');
                return { valid: false, error: "Validasi dibatalkan." };
            }
            console.error('--- [VALIDATION] FAILED: API key is invalid or has issues.', err);
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
    }, []);

    const handleGenericError = (err: unknown, wasUsingUserKey: boolean) => {
        if (err instanceof Error && err.name === 'AbortError') {
            console.log("--- [Operation Cancelled] ---");
            // Don't show an error modal if the user intentionally cancelled.
            return;
        }

        const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
        console.log(`--- [handleGenericError] Context: wasUsingUserKey=${wasUsingUserKey}, Raw error: "${message}"`);
    
        let userFriendlyMessage = "Terjadi kesalahan yang tidak terduga. Silakan coba lagi nanti.";
        const lowerCaseMessage = message.toLowerCase();
    
        if (wasUsingUserKey) {
            if (lowerCaseMessage.includes('api key not valid') || lowerCaseMessage.includes('permission denied') || lowerCaseMessage.includes('api_key_invalid')) {
                userFriendlyMessage = "Kunci API yang Anda masukkan tidak valid atau tidak memiliki izin.";
            } else if (lowerCaseMessage.includes('resource has been exhausted')) {
                userFriendlyMessage = "Kunci API Anda telah melebihi kuota penggunaan. Silakan periksa akun Google AI Studio Anda.";
            } else {
                userFriendlyMessage = `Gagal menggunakan kunci API Anda. Pastikan kunci tersebut benar dan aktif.`;
            }
            setUserApiError(userFriendlyMessage);
        } else {
            if (lowerCaseMessage.includes('resource has been exhausted')) {
                userFriendlyMessage = "Kuota kredit aplikasi telah habis. Coba lagi nanti atau gunakan kunci API Anda sendiri.";
            } else if (lowerCaseMessage.includes('safety')) {
                userFriendlyMessage = "Konten tidak dapat dibuat karena melanggar kebijakan keamanan. Coba prompt/gambar yang berbeda.";
            } else if (lowerCaseMessage.includes('500') || lowerCaseMessage.includes('unknown') || lowerCaseMessage.includes('xhr')) {
                userFriendlyMessage = "Server AI sedang sibuk atau mengalami gangguan sesaat. Silakan coba lagi beberapa saat lagi.";
            }
            setError(userFriendlyMessage);
            setIsErrorModalOpen(true);
        }
    };
    
    // --- Unified API Caller with RETRY LOGIC for SDK path ---
    const authenticatedApiCall = async (model: string, body: any, signal: AbortSignal) => {
        if (signal.aborted) throw new Error("Operation was aborted before it could start.");

        if (useOwnApiKey) {
            // USER KEY PATH: Use direct fetch
            const userKey = localStorage.getItem('user_gemini_api_key');
            if (!userKey) throw new Error("Kunci API pengguna tidak ditemukan.");
            const endpoint = `${model}:generateContent`;
            return callApiDirectly(userKey, endpoint, body, signal);
        } else {
            // DEV KEY PATH: Use SDK with retry logic
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const { contents, generationConfig, systemInstruction } = body;
            
            const config = {
                ...generationConfig,
                systemInstruction: systemInstruction?.parts?.[0]?.text,
            };
            
            const maxRetries = 2;
            const retryDelay = 1500; // ms

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                if (signal.aborted) throw new Error("Operation aborted during retry wait.");
                try {
                    // SDK doesn't natively support AbortSignal, so we can't cancel the in-flight request.
                    // However, the check before the loop and between retries prevents starting new attempts.
                    const sdkResponse = await ai.models.generateContent({
                        model,
                        contents,
                        config,
                    });

                    if (!sdkResponse || !sdkResponse.candidates) {
                        throw new Error("AI SDK returned a response without candidates.");
                    }
                    console.log(`[SDK Call] Success on attempt ${attempt}.`);
                    return { candidates: sdkResponse.candidates }; // Success
                } catch (err) {
                    const message = err instanceof Error ? err.message.toLowerCase() : "";
                    const isServerError = message.includes('500') || message.includes('unknown') || message.includes('xhr');

                    console.warn(`[SDK Call] Attempt ${attempt} failed. Error: ${message}`);
                    
                    if (isServerError && attempt < maxRetries) {
                        console.log(`[SDK Call] Server error detected. Retrying in ${retryDelay / 1000}s...`);
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                    } else {
                        throw err; // Non-server error or max retries reached, re-throw to be handled by caller
                    }
                }
            }
            // This line should not be reachable, but is a safeguard.
            throw new Error("Gagal memanggil API setelah beberapa kali percobaan.");
        }
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
            // FIX: Use correct model 'gemini-2.5-flash'
            const response = await authenticatedApiCall('gemini-2.5-flash', body, signal);
            const textContent = response.candidates[0].content.parts[0].text;
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
    
    const handleAdvancedOptionsToggle = () => {
        const aboutToOpen = !isAdvancedOpen;
        if (aboutToOpen && !detectedCategory && originalImage) {
            // Since this is a short operation, we won't make it cancellable.
            // A dedicated abort controller would be needed if it were long.
            analyzeImageForStyles(new AbortController().signal);
        }
        setIsAdvancedOpen(aboutToOpen);
    };

    const handleGoToSettings = () => {
        setUserApiError(null);
        onNavigate('settings');
    };

    const handleStyleSelect = (category: string, option: string) => {
        setSelectedStyles(prev => ({ ...prev, [category]: prev[category] === option ? null : option, }));
    };
    
    const handleResetStyles = () => setSelectedStyles({});

    const handleOpenSaveStyleModal = () => setIsSaveStyleModalOpen(true);

    const handleSaveStyleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = newPresetName.trim();
        if (!trimmedName) {
            setPresetNameError("Nama preset tidak boleh kosong.");
            return;
        }
        if (savedStyles.some(s => s.name.toLowerCase() === trimmedName.toLowerCase())) {
            setPresetNameError("Nama preset sudah ada.");
            return;
        }
        setSavedStyles(prev => [...prev, { id: Date.now(), name: trimmedName, styles: selectedStyles }]);
        setIsSaveStyleModalOpen(false);
    };

    const applySavedStyle = (styles: SelectedStyles) => setSelectedStyles(styles);

    const handleImageUpload = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            setEditedImage(null);
            setError(null);
            setUserApiError(null);
            setGenerationSuccess(false);
            setSelectedStyles({});
            setDetectedCategory(null);
            setDetectedSubject(null);
            setIsAdvancedOpen(false);
            setGeneratedCaption('');
            setProjectTitle('');
            
            const reader = new FileReader();
            reader.onloadend = () => setOriginalImage(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setError("Silakan pilih file gambar yang valid.");
            setIsErrorModalOpen(true);
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) handleImageUpload(e.target.files[0]);
        e.target.value = '';
    };

    const processImageWithCanvas = useCallback(async (imageSrc: string, targetAspectRatio: AspectRatio): Promise<string> => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Could not get canvas context'));

            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = imageSrc;
            img.onload = () => {
                const ratioValue = eval(targetAspectRatio.replace(':', '/'));
                const canvasWidth = 1024;
                canvas.width = canvasWidth;
                canvas.height = canvasWidth / ratioValue;
                
                const imgRatio = img.width / img.height;
                const canvasRatio = canvas.width / canvas.height;
                let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

                if (imgRatio > canvasRatio) {
                    sWidth = img.height * canvasRatio;
                    sx = (img.width - sWidth) / 2;
                } else {
                    sHeight = img.width / canvasRatio;
                    sy = (img.height - sHeight) / 2;
                }
                
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
                
                resolve(canvas.toDataURL('image/jpeg', 0.95));
            };
            img.onerror = () => reject(new Error('Gagal memuat gambar untuk diproses.'));
        });
    }, []);

    const handleCancelGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            console.log("--- [handleCancelGeneration] Abort signal sent.");
        }
        setIsLoading(false);
        setLoadingMessage('');
    };

    const handleGenerate = async () => {
        console.log(`--- [handleGenerate TRIGGERED] ---`);
        if (!originalImage) {
            setError("Silakan unggah gambar terlebih dahulu.");
            setIsErrorModalOpen(true);
            return;
        }

        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setIsLoading(true);
        setEditedImage(null);
        setGenerationSuccess(false);
        setGeneratedCaption('');
        setProjectTitle('');
        setFullPromptForSaving('');
        setError(null);
        setUserApiError(null);

        const isUsingUserKey = useOwnApiKey;
        console.log(`- Mode: ${isUsingUserKey ? 'USER KEY' : 'DEV KEY'}`);

        if (!isUsingUserKey) {
            console.log(`[CREDIT CHECK] Current credits: ${userCredits}. Cost: 5.`);
            if (userCredits < 5) {
                setError("Kredit Anda tidak mencukupi untuk membuat gambar.");
                setIsErrorModalOpen(true);
                setIsLoading(false);
                return;
            }
        }

        try {
            if (isUsingUserKey) {
                setLoadingMessage("Memvalidasi kunci API Anda...");
                const userKey = localStorage.getItem('user_gemini_api_key');
                if (!userKey) throw new Error("Mode 'Gunakan API Key Sendiri' aktif, tapi tidak ada kunci yang ditemukan.");
                const validationResult = await validateApiKey(userKey, signal);
                if (!validationResult.valid) throw new Error(validationResult.error || "Validasi kunci API gagal.");
            }

            const canvasImage = await processImageWithCanvas(originalImage, aspectRatio);
            const { base64Data, mimeType } = dataUrlToBlob(canvasImage);
            
            setLoadingMessage("Menganalisis gambar & merancang gaya...");
            const analysisBody = {
                contents: [{ parts: [{ inlineData: { mimeType, data: base64Data } }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: { type: "OBJECT", properties: { style: { type: "STRING" }, background_prompt: { type: "STRING" } }, required: ['style', 'background_prompt'] }
                },
                systemInstruction: { parts: [{ text: "You are a professional photoshoot director. Analyze the image. First, determine the most fitting professional photography style. Second, suggest a NEW, creative, and professional background that would elevate the subject. Respond ONLY with a JSON object." }] }
            };
            // FIX: Use correct model 'gemini-2.5-flash'
            const analysisResponse = await authenticatedApiCall('gemini-2.5-flash', analysisBody, signal);
            const { style: analyzedStyle, background_prompt } = JSON.parse(analysisResponse.candidates[0].content.parts[0].text);
            
            // --- NEW: PROMPT ENHANCEMENT LOGIC ---
            const getProfessionalDetail = (category: 'style' | 'lighting' | 'composition' | 'mood', key: string | null | undefined): string | null => {
                if (!key) return null;
                // @ts-ignore
                return professionalPromptLibrary[category]?.[key] || key; // Fallback to the key itself if not in library
            };

            const selectedStyle = selectedStyles.style || analyzedStyle;
            const styleDetail = getProfessionalDetail('style', selectedStyle);
            const lightingDetail = getProfessionalDetail('lighting', selectedStyles.lighting);
            const compositionDetail = getProfessionalDetail('composition', selectedStyles.composition);
            const moodDetail = getProfessionalDetail('mood', selectedStyles.mood);

            let compositionInstruction = compositionDetail;
            if (selectedStyles.composition === 'Human Element' && detectedSubject) {
                setLoadingMessage("Merancang interaksi manusia yang natural...");
                
                const deepResearchSystemInstruction = `You are an expert in product photography and cultural anthropology. Your task is to describe a natural, context-aware, and culturally appropriate human interaction with a given subject. The output must be a concise phrase suitable for an image generation prompt.

Follow these rules:
1.  **Analyze the Subject:** First, identify the object and its primary use.
2.  **Determine the Interaction:**
    *   **For Food:** Consider the food type and cultural context to choose the correct utensil.
        *   **Rice/Grain Dishes (like Nasi Goreng, Risotto):** The primary utensil is a spoon. Phrase: "a hand holding a spoon, scooping a perfect bite."
        *   **Noodle Dishes (like Mie Ayam, Ramen, Pasta):** Can be chopsticks or a fork. If it's a soupy noodle dish, a spoon can also be present for the broth. Phrase: "a hand lifting noodles with chopsticks" or "a hand twirling pasta with a fork."
        *   **Soups (Sop):** The only appropriate utensil is a soup spoon. Phrase: "a hand holding a spoon, lifting it from a bowl of soup."
        *   **Western dishes (like Steak):** Knife and fork. Phrase: "hands cutting a piece of steak with a knife and fork."
        *   **Hand-held food (like Burgers, Tacos):** Hands are the primary tool. Phrase: "hands holding a burger, about to take a bite."
    *   **For Drinks (like Coffee, Tea):** A hand holding the cup/mug/glass appropriately (e.g., by the handle for a hot mug). Phrase: "a hand holding a ceramic coffee mug."
    *   **For Technology (like a Smartphone, Laptop):** A hand interacting with the device. Phrase: "a hand holding a smartphone, a finger scrolling the screen" or "hands typing on a laptop keyboard."
    *   **For Apparel/Accessories (like a Watch, Jacket):** A human wearing or interacting with the item. Phrase: "a hand fastening a leather strap watch on a wrist" or "a hand touching the fabric of a denim jacket."
    *   **For Tools (like a Hammer, Screwdriver):** A hand gripping and using the tool for its intended purpose. Phrase: "a hand gripping a hammer, poised to strike."
    *   **For Cosmetics (like Lipstick, Cream Jar):** A hand using the product. Phrase: "fingers scooping a small amount of cream from a jar."
3.  **Be Concise:** The final output must be a short, descriptive phrase. Do not add any introductory text like 'Here is the phrase:'. Just provide the phrase itself.
4.  **Focus on the Action:** The phrase should describe a subtle, elegant action, not a full scene. The human element should complement the product, not dominate it.

Example Input: 'Secangkir Kopi'
Example Output: 'a hand holding the handle of a warm ceramic coffee mug.'

Example Input: 'Jam Tangan Kulit'
Example Output: 'a hand fastening the buckle of a leather watch on a wrist.'
`;

                const interactionBody = {
                    contents: [{ parts: [{ text: `Describe a natural, culturally appropriate human interaction with "${detectedSubject}" in a concise phrase.` }] }],
                    systemInstruction: { parts: [{ text: deepResearchSystemInstruction }] }
                };
                // FIX: Use correct model 'gemini-2.5-flash'
                const interactionResponse = await authenticatedApiCall('gemini-2.5-flash', interactionBody, signal);
                compositionInstruction = interactionResponse.candidates[0].content.parts[0].text.trim();
            }
            
            let final_background_prompt = selectedStyles.style === 'Clean Catalog' 
                ? 'a clean, professional studio shot with a plain, solid light grey or white background and even, soft lighting.' 
                : background_prompt;
            
            const promptClauses = [
                styleDetail,
                lightingDetail,
                compositionInstruction,
                moodDetail,
            ].filter(Boolean); // Filter out null/undefined values

            let finalPrompt: string;
            
            if (detectedCategory === 'Produk' && isolateProduct) {
                setLoadingMessage("Mengisolasi produk & membuat studio virtual...");
                const isClothing = detectedSubject && ['baju', 'kemeja', 'gaun', 'jaket', 'celana', 'rok', 'pakaian'].some(k => detectedSubject.toLowerCase().includes(k));
                const clothingInstruction = isClothing ? `SPECIAL INSTRUCTION: ${styleEnhancements['Ghost Mannequin']}` : '';
                finalPrompt = `CRITICAL TASK: Perfectly isolate the main subject, a '${detectedSubject}', from everything else. Reconstruct any obscured parts. Place it onto a new background: '${final_background_prompt}'. ${clothingInstruction} Apply these professional aesthetic principles:\n${promptClauses.map(c => `- ${c}`).join('\n')}\nMust be hyper-realistic.\n\nABSOLUTE RULE: Do not generate any new text, words, letters, logos, or watermarks. Preserve any text that is part of the original subject, but do not add any extra text elements to the image.`;
            } else {
                setLoadingMessage(`Menerapkan gaya...`);
                finalPrompt = `Task: Transform this image into a professional, hyper-realistic photograph. The main subject must be perfectly integrated into a new background described as: '${final_background_prompt}'.\n\nApply the following professional photographic principles:\n${promptClauses.map(c => `- ${c}`).join('\n')}\n\nABSOLUTE RULE: Do not generate any new text, words, letters, logos, or watermarks. Preserve any text that is part of the original subject, but do not add any extra text elements to the image.`;
            }
            
            setFullPromptForSaving(finalPrompt);
            console.log("--- [FINAL PROMPT] ---", finalPrompt);
            setLoadingMessage("Menghasilkan gambar akhir...");
            const imageEditBody = {
                contents: [{ parts: [{ inlineData: { mimeType, data: base64Data } }, { text: finalPrompt }] }],
                generationConfig: {
                    responseModalities: ["IMAGE", "TEXT"],
                },
            };
            const imageEditResponse = await authenticatedApiCall('gemini-2.5-flash-image', imageEditBody, signal);

            const imagePart = imageEditResponse.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData);
            if (imagePart?.inlineData) {
                const generatedImgSrc = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
                setEditedImage(generatedImgSrc);
                setGenerationSuccess(true);
                setProjectTitle(detectedSubject ? `Proyek ${detectedSubject}` : `Proyek Gambar AI ${new Date().toLocaleTimeString()}`);
                
                if (!isUsingUserKey) {
                    onCreditDeduction(5);
                    console.log("[CREDIT] Deduction successful for image generation.");
                }
            } else {
                throw new Error(imageEditResponse.candidates?.[0]?.content?.parts?.find((part: any) => part.text)?.text || "Tidak ada gambar yang dihasilkan.");
            }
        } catch (err) {
            handleGenericError(err, isUsingUserKey);
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    const handleGenerateCaption = async () => {
        if (!editedImage) return;

        setIsCaptionLoading(true);
        setError(null);
        setUserApiError(null);

        const isUsingUserKey = useOwnApiKey;
        
        try {
            if(isUsingUserKey) {
                const userKey = localStorage.getItem('user_gemini_api_key');
                 if (!userKey) throw new Error("Mode 'Gunakan API Key Sendiri' aktif, tapi tidak ada kunci yang ditemukan.");
                const validationResult = await validateApiKey(userKey, new AbortController().signal);
                if (!validationResult.valid) throw new Error(validationResult.error || "Validasi kunci API gagal.");
            }
            
            const { base64Data, mimeType } = dataUrlToBlob(editedImage);
            const body = {
                contents: [{ parts: [{ inlineData: { mimeType, data: base64Data } }, { text: "Write a short, engaging, creative social media caption in Indonesian with hashtags." }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: { type: "OBJECT", properties: { caption: { type: "STRING" } }, required: ['caption'] }
                },
                systemInstruction: { parts: [{ text: "You are a professional social media manager." }] }
            };
            // FIX: Use correct model 'gemini-2.5-flash'
            const response = await authenticatedApiCall('gemini-2.5-flash', body, new AbortController().signal);
            const result = JSON.parse(response.candidates[0].content.parts[0].text);
            setGeneratedCaption(result.caption);
            
        } catch (err) {
            handleGenericError(err, isUsingUserKey);
        } finally {
            setIsCaptionLoading(false);
        }
    };

    const formatPromptDetails = (styles: SelectedStyles, styleOptions: StyleOption[]): string => {
        const categoryNameMap = styleOptions.reduce((acc, curr) => {
            acc[curr.category] = curr.name;
            return acc;
        }, {} as Record<string, string>);
    
        return Object.entries(styles)
            .filter(([, value]) => value)
            .map(([key, value]) => `{${categoryNameMap[key] || key}: ${value}}`)
            .join(', ');
    };

    const handleSaveProject = () => {
        if (!editedImage || !projectTitle) {
            setError("Judul proyek tidak boleh kosong.");
            setIsErrorModalOpen(true);
            return;
        }

        const promptDetails = formatPromptDetails(selectedStyles, currentAdvancedStyles);

        const newProject: Project = {
            id: Date.now(),
            title: projectTitle,
            imageUrl: editedImage,
            caption: generatedCaption || 'Gambar AI yang dibuat dengan KitStudio',
            aspectRatio: aspectRatio,
            promptDetails: promptDetails,
            type: 'image',
            promptFull: fullPromptForSaving,
        };

        onSaveProject(newProject);
        onNavigate('dashboard');
    };
    
    const ImageDropzone = () => (
        <div 
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-[#1565C0] hover:bg-blue-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
        >
            <UploadIcon className="w-12 h-12 mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
                <span className="font-semibold text-[#0D47A1]">Klik untuk mengunggah</span> atau seret dan lepas
            </p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP</p>
        </div>
    );
    
    const SaveStyleModal = () => (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsSaveStyleModalOpen(false)}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSaveStyleSubmit}>
                    <div className="p-6 border-b">
                        <h3 className="text-lg font-bold text-[#0D47A1]">Simpan Preset Gaya</h3>
                        <p className="text-sm text-gray-500 mt-1">Beri nama untuk kombinasi gaya Anda saat ini.</p>
                    </div>
                    <div className="p-6 space-y-2">
                        <label htmlFor="presetName" className="text-sm font-semibold text-gray-700">Nama Preset</label>
                        <input
                            id="presetName"
                            type="text"
                            value={newPresetName}
                            onChange={(e) => {
                                setNewPresetName(e.target.value);
                                if (presetNameError) setPresetNameError(null);
                            }}
                            className={`w-full p-2 border rounded-md focus:ring-2 ${presetNameError ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-[#1565C0] focus:border-[#1565C0]'}`}
                            placeholder="Contoh: Gaya Produk Kopi"
                        />
                        {presetNameError && <p className="text-xs text-red-600">{presetNameError}</p>}
                    </div>
                    <div className="flex justify-end p-4 bg-gray-50 rounded-b-2xl space-x-3">
                        <button type="button" onClick={() => setIsSaveStyleModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100">
                            Batal
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-[#0D47A1] rounded-lg hover:bg-[#1565C0]">
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const isGenerateDisabled = isLoading || !originalImage || isAnalyzingStyles;
    const isCaptionDisabled = isCaptionLoading;

    return (
        <>
            <ErrorModal 
                isOpen={isErrorModalOpen}
                onClose={() => setIsErrorModalOpen(false)}
                message={error || ''}
            />
            <UserApiErrorModal
                isOpen={!!userApiError}
                onClose={() => setUserApiError(null)}
                message={userApiError || ''}
                onGoToSettings={handleGoToSettings}
            />
            {isSaveStyleModalOpen && <SaveStyleModal />}
            {generationSuccess && (
                 <div 
                    className="fixed top-24 left-1/2 -translate-x-1/2 bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-center z-[60] animate-fadeInUp"
                    role="alert"
                >
                    <CheckIcon className="w-6 h-6 mr-3 flex-shrink-0" strokeWidth="2.5" />
                    <span className="font-semibold text-sm">Gambar berhasil di buat</span>
                    <button onClick={() => setGenerationSuccess(false)} className="ml-4 -mr-1 p-1 text-green-800 hover:text-green-900 hover:bg-green-200 rounded-full transition-colors" aria-label="Tutup">
                       <XIcon className="w-5 h-5"/>
                    </button>
                </div>
            )}
            <div className="max-w-7xl mx-auto p-8">
                <div className="animate-fadeInUp">
                    <h1 className="text-4xl font-bold text-[#0D47A1]">Fotografi Profesional AI</h1>
                    <p className="text-[#1565C0] mt-2 mb-8">Ubah foto biasa menjadi fotografi profesional yang siap untuk media sosial.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeInUp" style={{ animationDelay: '150ms' }}>
                     <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col space-y-6 h-fit">
                        <div className="flex justify-between items-center p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                            <span className="text-sm font-semibold text-[#0D47A1]">Sisa Kredit Anda:</span>
                            <div className="flex items-center gap-2">
                                <CreditIcon className="w-5 h-5 text-amber-500" strokeWidth="2" />
                                <span className="text-lg font-bold text-[#0D47A1]">{userCredits}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-base font-bold text-[#0D47A1] mb-2">1. Unggah Gambar Anda</label>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={onFileChange} 
                                className="hidden" 
                                accept="image/png, image/jpeg, image/webp"
                            />
                            {originalImage ? (
                                <div className="relative">
                                    <img src={originalImage} alt="Preview" className="w-full rounded-lg" />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute top-2 right-2 px-3 py-1 bg-white/80 text-[#0D47A1] text-sm font-semibold rounded-md backdrop-blur-sm hover:bg-white z-10"
                                    >
                                        Ganti
                                    </button>
                                </div>
                            ) : (
                                <ImageDropzone />
                            )}
                        </div>

                        <div>
                            <label className="block text-base font-bold text-[#0D47A1] mb-2">2. Atur Aspek Rasio</label>
                            <div className="grid grid-cols-4 gap-2">
                                {aspectRatios.map(({ value, label, icon }) => (
                                    <button
                                        key={value}
                                        onClick={() => setAspectRatio(value)}
                                        className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-colors ${aspectRatio === value ? 'border-[#0D47A1] bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                                        aria-label={`Set aspect ratio to ${label}`}
                                    >
                                        {icon}
                                        <span className={`mt-1 text-xs font-semibold ${aspectRatio === value ? 'text-[#0D47A1]' : 'text-gray-600'}`}>{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                            <div className="flex justify-between items-center w-full mb-1">
                                <h3 className="text-base font-bold text-[#0D47A1]">3. Opsi Lanjutan (Cerdas)</h3>
                                <div className="flex items-center gap-1">
                                    {Object.values(selectedStyles).some(s => s) && (
                                         <button onClick={handleOpenSaveStyleModal} className="p-1.5 text-[#1565C0] hover:text-[#0D47A1] rounded-md hover:bg-blue-100 transition-colors" title="Simpan Gaya">
                                            <PlusCircleIcon className="w-5 h-5"/>
                                        </button>
                                    )}
                                    {Object.values(selectedStyles).some(s => s) && (
                                        <button onClick={handleResetStyles} className="p-1.5 text-[#1565C0] hover:text-[#0D47A1] rounded-md hover:bg-blue-100 transition-colors" title="Reset Pilihan">
                                            <RefreshCwIcon className="w-4 h-4"/>
                                        </button>
                                    )}
                                    <button onClick={handleAdvancedOptionsToggle} disabled={!originalImage} className="p-1 disabled:cursor-not-allowed disabled:opacity-50" aria-expanded={isAdvancedOpen} aria-controls="advanced-options-panel">
                                        <ChevronDownIcon className={`w-5 h-5 text-[#0D47A1] transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                            </div>
                            {!originalImage && <p className="text-xs text-gray-500">Unggah gambar untuk mengaktifkan opsi lanjutan.</p>}
                            
                            <div id="advanced-options-panel" className={`grid transition-all duration-300 ease-in-out ${isAdvancedOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden pt-2">
                                    {isAnalyzingStyles && (
                                        <div className="flex items-center justify-center py-4 bg-gray-50 rounded-lg">
                                            <Spinner size="h-5 w-5" />
                                            <span className="ml-2 text-sm text-gray-600">Menganalisis gambar...</span>
                                        </div>
                                    )}
                                    <div className={`space-y-4 ${isAnalyzingStyles ? 'hidden' : ''}`}>
                                        {savedStyles.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Preset Gaya</h4>
                                                <div className="flex space-x-3 overflow-x-auto pb-2 -mx-1 px-1">
                                                    {savedStyles.map((saved) => (
                                                        <button
                                                            key={saved.id}
                                                            onClick={() => applySavedStyle(saved.styles)}
                                                            className="flex-shrink-0 w-32 text-left p-3 rounded-lg border bg-white shadow-sm hover:border-[#1565C0] hover:bg-blue-50 transition-colors"
                                                            title={formatPromptDetails(saved.styles, currentAdvancedStyles)}
                                                        >
                                                            <span className="font-bold text-sm text-[#0D47A1]">{saved.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {detectedCategory && (
                                            <div className="flex items-center p-2 text-sm text-blue-800 rounded-lg bg-blue-100" role="alert">
                                                <InfoIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                                                <div>
                                                    Gaya direkomendasikan untuk: <span className="font-bold">{detectedCategory}</span>
                                                    {detectedSubject && <span className="font-normal italic"> ({detectedSubject})</span>}
                                                </div>
                                            </div>
                                        )}
                                        {currentAdvancedStyles.map(({ category, name, options }) => (
                                            <div key={category}>
                                                <h4 className="text-sm font-semibold text-gray-700 mb-2">{name}</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {options.map(option => (
                                                        <button
                                                            key={option}
                                                            onClick={() => handleStyleSelect(category, option)}
                                                            className={`px-3 py-1 text-sm font-medium rounded-full border transition-colors ${ selectedStyles[category] === option ? 'bg-[#0D47A1] text-white border-[#0D47A1]' : 'bg-gray-100 text-gray-700 border-gray-200 hover:border-[#1565C0] hover:text-[#1565C0]'}`}>
                                                            {option}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {detectedCategory === 'Produk' && !isAnalyzingStyles && (
                             <div className="p-3 bg-blue-50 rounded-lg">
                                 <label htmlFor="isolate-product-toggle" className="flex items-center justify-between w-full cursor-pointer">
                                     <span className="text-sm font-semibold text-[#0D47A1] pr-4">
                                         Fokus pada Produk
                                         <p className="text-xs font-normal text-gray-600">Hapus orang/tangan dari gambar.</p>
                                     </span>
                                     <div className="relative inline-flex items-center flex-shrink-0">
                                         <input type="checkbox" id="isolate-product-toggle" className="sr-only peer" checked={isolateProduct} onChange={(e) => setIsolateProduct(e.target.checked)} />
                                         <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0D47A1]"></div>
                                     </div>
                                 </label>
                             </div>
                        )}

                        {userApiKey && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <label htmlFor="use-own-api-key-toggle" className="flex items-center justify-between w-full cursor-pointer">
                                    <span className="text-sm font-semibold text-[#0D47A1] pr-4">
                                        Gunakan API Key Sendiri
                                        <p className="text-xs font-normal text-gray-600">
                                            {useOwnApiKey ? 'Generasi tanpa kredit' : 'Gunakan kredit aplikasi'}
                                        </p>
                                    </span>
                                    <div className="relative inline-flex items-center flex-shrink-0">
                                        <input type="checkbox" id="use-own-api-key-toggle" className="sr-only peer" checked={useOwnApiKey} onChange={(e) => setUseOwnApiKey(e.target.checked)} />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0D47A1]"></div>
                                     </div>
                                 </label>
                            </div>
                        )}

                        {isLoading ? (
                            <button 
                                onClick={handleCancelGeneration}
                                className="w-full flex items-center justify-center px-4 py-3 text-base font-bold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all shadow-md"
                            >
                                <XIcon className="w-5 h-5 mr-2" />
                                <span>Batal</span>
                            </button>
                        ) : (
                             <button 
                                onClick={() => handleGenerate()}
                                disabled={isGenerateDisabled}
                                className="w-full flex items-center justify-center px-4 py-3 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <SparklesIcon className="w-5 h-5 mr-2" />
                                <span>{`4. Generate (${useOwnApiKey && userApiKey ? 'Tanpa Kredit' : '5 Kredit'})`}</span>
                            </button>
                        )}
                    </div>

                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div className="w-full">
                            <h2 className="text-xl font-bold text-[#0D47A1] mb-4 text-center">Original</h2>
                            <div className={`${aspectRatioClasses[aspectRatio]} w-full bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center p-2`}>
                                {originalImage ? (
                                    <img src={originalImage} alt="Original" className="w-full h-full object-contain rounded-lg" />
                                ) : (
                                    <div className="text-center text-gray-400 p-4">
                                        <ImageIcon className="w-16 h-16 mx-auto" />
                                        <p className="mt-2 text-sm">Unggah gambar untuk memulai</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="w-full">
                             <h2 className="text-xl font-bold text-[#0D47A1] mb-4 text-center">Hasil AI</h2>
                            <div className={`${aspectRatioClasses[aspectRatio]} w-full bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center p-2 relative`}>
                                {isLoading && <LoadingComponent message={loadingMessage} />}
                                 {!isLoading && editedImage && (
                                    <div className="relative group w-full h-full flex items-center justify-center">
                                        <img src={editedImage} alt="Edited" className="w-full h-full object-cover rounded-lg"/>
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                            <a href={editedImage} download={`edited_image_${Date.now()}.png`} className="flex items-center px-4 py-2 bg-white/80 text-[#0D47A1] font-semibold rounded-lg hover:bg-white transition-colors">
                                                <DownloadIcon className="w-5 h-5 mr-2" />
                                                Unduh
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {!isLoading && !editedImage && (
                                    <div className="text-center text-gray-400 p-4">
                                        <ImageIcon className="w-16 h-16 mx-auto" />
                                        <p className="mt-2 text-sm">Hasil editan akan muncul di sini</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {editedImage && !isLoading && (
                             <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm animate-fadeInUp">
                                <h2 className="text-2xl font-bold text-[#0D47A1] mb-4">Langkah Selanjutnya</h2>
                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="projectTitle" className="block text-base font-bold text-[#0D47A1] mb-2">
                                            Judul Proyek
                                        </label>
                                        <input
                                            type="text"
                                            id="projectTitle"
                                            value={projectTitle}
                                            onChange={(e) => setProjectTitle(e.target.value)}
                                            placeholder="Contoh: Foto Produk Kopi Musim Panas"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1565C0] focus:border-[#1565C0]"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="aiCaption" className="block text-base font-bold text-[#0D47A1] mb-2">
                                            Caption AI (Opsional)
                                        </label>
                                        <div className="relative">
                                            <textarea
                                                id="aiCaption"
                                                rows={4}
                                                value={generatedCaption}
                                                onChange={(e) => setGeneratedCaption(e.target.value)}
                                                placeholder="Klik 'Buat Caption' atau tulis caption Anda di sini..."
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1565C0] focus:border-[#1565C0] pr-48"
                                            />
                                            <button 
                                                onClick={() => handleGenerateCaption()}
                                                disabled={isCaptionDisabled}
                                                className="absolute top-3 right-3 flex items-center justify-center px-3 py-2 text-sm font-semibold text-[#1565C0] bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait"
                                            >
                                                {isCaptionLoading ? (
                                                     <Spinner size="h-5 w-5" />
                                                ) : (
                                                    <>
                                                        <TextIcon className="w-4 h-4 mr-2" />
                                                        Buat Caption (Gratis)
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSaveProject}
                                        disabled={!projectTitle}
                                        className="w-full flex items-center justify-center px-4 py-3 text-base font-bold text-white bg-[#0D47A1] hover:bg-[#1565C0] rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Simpan ke Project
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default GenerateImagePage;