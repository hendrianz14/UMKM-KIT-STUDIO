"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SparklesIcon, DownloadIcon, ImageIcon, UploadIcon, ChevronDownIcon, RefreshCwIcon, InfoIcon, CheckIcon, XIcon, TextIcon, PlusCircleIcon, KeyIcon, CreditIcon, TrashIcon } from '@/lib/constants';
import { AspectRatio, Project, SavedStyle, StyleOption, SelectedStyles, Preset } from '@/lib/types';
import { useAppContext } from '@/contexts/AppContext';
import { getDefaultStylePresets } from '@/lib/style-presets';

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

const ErrorModal: React.FC<{ isOpen: boolean; onClose: () => void; message: string }> = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <XIcon className="h-6 w-6 text-red-600" strokeWidth="2.5" />
                </div>
                <h3 className="text-xl font-bold text-[#0D47A1] mt-4">Terjadi Kesalahan</h3>
                <p className="text-gray-600 mt-2 mb-6 text-sm">{message}</p>
                <button 
                    onClick={onClose} 
                    className="w-full px-4 py-2 font-semibold text-white bg-[#0D47A1] rounded-lg hover:bg-[#1565C0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0D47A1]"
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
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={onClose}>
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


const GenerateImagePage = () => {
    const { user, handleSaveProject, handleCreditDeduction, onNavigate, userApiKeyInfo } = useAppContext();

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
    const [currentAdvancedStyles, setCurrentAdvancedStyles] = useState<StyleOption[]>(() => getDefaultStylePresets());
    const [detectedCategory, setDetectedCategory] = useState<string | null>(null);
    const [detectedSubject, setDetectedSubject] = useState<string | null>(null);
    const [isolateProduct, setIsolateProduct] = useState<boolean>(true);
    const [generationSuccess, setGenerationSuccess] = useState(false);
    const [savedStyles, setSavedStyles] = useState<SavedStyle[]>([]);
    const [fullPromptForSaving, setFullPromptForSaving] = useState<string>('');
    const [isSaveStyleModalOpen, setIsSaveStyleModalOpen] = useState(false);
    const [newPresetName, setNewPresetName] = useState('');
    const [presetNameError, setPresetNameError] = useState<string | null>(null);
    const [useOwnApiKey, setUseOwnApiKey] = useState(false);
    const [isSavingProject, setIsSavingProject] = useState(false);

    const [projectTitle, setProjectTitle] = useState('');
    const [generatedCaption, setGeneratedCaption] = useState('');
    const [isCaptionLoading, setIsCaptionLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const analysisAbortControllerRef = useRef<AbortController | null>(null);
    const loadingMessageTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
    
    const hasInitialisedOwnKeyRef = useRef(false);

    useEffect(() => {
        if (!userApiKeyInfo.hasKey) {
            setUseOwnApiKey(false);
            hasInitialisedOwnKeyRef.current = false;
            return;
        }

        if (!hasInitialisedOwnKeyRef.current) {
            setUseOwnApiKey(true);
            hasInitialisedOwnKeyRef.current = true;
        }
    }, [userApiKeyInfo.hasKey]);

    const clearLoadingSequence = useCallback(() => {
        loadingMessageTimersRef.current.forEach((timerId) => clearTimeout(timerId));
        loadingMessageTimersRef.current = [];
    }, []);

    const startLoadingSequence = useCallback(() => {
        clearLoadingSequence();
        const steps: Array<{ delay: number; message: string }> = [
            { delay: 0, message: "Mempersiapkan gambar..." },
            { delay: 900, message: "Menganalisis gaya dan komposisi..." },
            { delay: 1800, message: "Menyesuaikan pencahayaan & mood..." },
            { delay: 2700, message: "Merender detail akhir berkualitas tinggi..." },
        ];

        steps.forEach(({ delay, message }) => {
            const timer = setTimeout(() => setLoadingMessage(message), delay);
            loadingMessageTimersRef.current.push(timer);
        });
    }, [clearLoadingSequence]);

    useEffect(() => {
        return () => {
            clearLoadingSequence();
        };
    }, [clearLoadingSequence]);

    const handleGenericError = useCallback((errorMessage: string, context: 'user' | 'system') => {
        if (context === 'user') {
            setUserApiError(errorMessage);
        } else {
            setError(errorMessage);
            setIsErrorModalOpen(true);
        }
    }, []);
    
    const analyzeImageForStyles = useCallback(async (signal: AbortSignal, image: string) => {
        setIsAnalyzingStyles(true);
        setError(null);
        setUserApiError(null);
        
        try {
            const response = await fetch('/api/generate/image-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image, useOwnApiKey }),
                signal,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze image');
            }
            
            setCurrentAdvancedStyles(data.stylePresets);
            setDetectedCategory(data.displayCategoryName);
            setDetectedSubject(data.subject);
        } catch (err) {
            if (err instanceof Error && err.name !== 'AbortError') {
                handleGenericError(err.message, useOwnApiKey ? 'user' : 'system');
            }
            setCurrentAdvancedStyles(getDefaultStylePresets());
            setDetectedCategory('Umum');
        } finally {
            if (!signal.aborted) {
                setIsAnalyzingStyles(false);
                if (analysisAbortControllerRef.current?.signal === signal) {
                    analysisAbortControllerRef.current = null;
                }
            }
        }
    }, [getDefaultStylePresets, handleGenericError, useOwnApiKey]);
    
    useEffect(() => {
        if (!originalImage) {
            // Batalkan analisis yang sedang berjalan dari gambar sebelumnya
            analysisAbortControllerRef.current?.abort();
            analysisAbortControllerRef.current = null;
            
            // Atur ulang semua state yang terkait dengan analisis dan opsi lanjutan
            setCurrentAdvancedStyles(getDefaultStylePresets());
            setDetectedCategory(null);
            setDetectedSubject(null);
            setIsAnalyzingStyles(false);
            setIsAdvancedOpen(false); // Tutup panel
            return;
        }

        // Pemanggilan analisis otomatis telah dihapus dari useEffect ini.
        // Analisis sekarang hanya akan dipicu oleh handleAdvancedOptionsToggle.

        // Opsional: Kembalikan fungsi pembersihan untuk membatalkan analisis jika komponen di-unmount
        return () => {
            analysisAbortControllerRef.current?.abort();
        };
    }, [originalImage, getDefaultStylePresets]);
    
    const handleAdvancedOptionsToggle = () => {
        const aboutToOpen = !isAdvancedOpen;
        setIsAdvancedOpen(aboutToOpen);

        if (aboutToOpen && originalImage) {
            const controller = new AbortController();
            analysisAbortControllerRef.current?.abort();
            analysisAbortControllerRef.current = controller;
            void analyzeImageForStyles(controller.signal, originalImage);
        }
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

    const [presets, setPresets] = useState<Preset[]>([]);

    useEffect(() => {
        const fetchPresets = async () => {
            try {
                const response = await fetch('/api/presets');
                if (!response.ok) {
                    throw new Error('Failed to fetch presets');
                }
                const data = await response.json();
                setPresets(data);
            } catch (error) {
                console.error(error);
                // Optionally, show an error message to the user
            }
        };

        if (user) {
            fetchPresets();
        }
    }, [user]);

    const handleSavePreset = async (name: string, styles: SelectedStyles) => {
        if (!detectedCategory) {
            setError('Tidak dapat menyimpan preset tanpa kategori gambar yang terdeteksi.');
            setIsErrorModalOpen(true);
            return false;
        }
        try {
            const response = await fetch('/api/presets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, styles, category: detectedCategory }),
            });

            if (!response.ok) {
                throw new Error('Failed to save preset');
            }

            const newPreset = await response.json();
            setPresets(prev => [...prev, newPreset]);
            return true;
        } catch (error) {
            console.error(error);
            setError('Gagal menyimpan preset. Silakan coba lagi.');
            setIsErrorModalOpen(true);
            return false;
        }
    };

    const handleDeletePreset = async (presetId: string) => {
        try {
            const response = await fetch('/api/presets', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: presetId }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete preset');
            }

            setPresets(prev => prev.filter(p => p.id !== presetId));
        } catch (error) {
            console.error(error);
            setError('Gagal menghapus preset. Silakan coba lagi.');
            setIsErrorModalOpen(true);
        }
    };

    const handleSaveStyleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = newPresetName.trim();
        if (!trimmedName) {
            setPresetNameError("Nama preset tidak boleh kosong.");
            return;
        }
        if (presets.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
            setPresetNameError("Nama preset sudah ada.");
            return;
        }

        const success = await handleSavePreset(trimmedName, selectedStyles);
        if (success) {
            setIsSaveStyleModalOpen(false);
            setNewPresetName('');
            setPresetNameError(null);
        }
    };

    const applySavedStyle = (styles: SelectedStyles) => {
        setSelectedStyles(styles);
    };

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
            setCurrentAdvancedStyles(getDefaultStylePresets());
            
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

    const handleCancelGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        clearLoadingSequence();
        setIsLoading(false);
        setLoadingMessage('');
    };

    const handleGenerate = async () => {
        if (!originalImage || !user) {
            setError("Silakan unggah gambar terlebih dahulu.");
            setIsErrorModalOpen(true);
            return;
        }

        if (!useOwnApiKey && user.credits < 5) {
            setError("Kredit Anda tidak mencukupi untuk membuat gambar.");
            setIsErrorModalOpen(true);
            return;
        }

        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setIsLoading(true);
        setLoadingMessage("Mempersiapkan gambar...");
        startLoadingSequence();
        setEditedImage(null);
        setGenerationSuccess(false);
        setGeneratedCaption('');
        setProjectTitle('');
        setFullPromptForSaving('');
        setError(null);
        setUserApiError(null);
        
        try {
            const response = await fetch('/api/generate/image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: originalImage,
                    aspectRatio,
                    selectedStyles,
                    detectedCategory,
                    detectedSubject,
                    isolateProduct,
                    useOwnApiKey,
                }),
                signal,
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error);
            }
            
            if (!useOwnApiKey) {
                await handleCreditDeduction(5, data.generationId);
            }

            setEditedImage(data.imageUrl);
            setFullPromptForSaving(data.finalPrompt);
            setGenerationSuccess(true);
            setProjectTitle(detectedSubject ? `Proyek ${detectedSubject}` : `Proyek Gambar AI ${new Date().toLocaleTimeString()}`);
            
        } catch (err) {
            if (err instanceof Error && err.name !== 'AbortError') {
                handleGenericError(err.message, useOwnApiKey ? 'user' : 'system');
            }
        } finally {
             clearLoadingSequence();
             setLoadingMessage('');
             setIsLoading(false);
             abortControllerRef.current = null;
        }
    };

    const handleGenerateCaption = async () => {
        if (!editedImage) return;

        setIsCaptionLoading(true);
        setError(null);
        setUserApiError(null);

        try {
            const response = await fetch('/api/generate/caption', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: editedImage, useOwnApiKey }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error);
            }
            setGeneratedCaption(data.caption);
        } catch (err) {
            if (err instanceof Error) {
                handleGenericError(err.message, useOwnApiKey ? 'user' : 'system');
            }
        } finally {
            setIsCaptionLoading(false);
        }
    };
    
    const onSaveProject = async () => {
         if (!editedImage || !projectTitle) {
            setError("Judul proyek tidak boleh kosong.");
            setIsErrorModalOpen(true);
            return;
        }

        setIsSavingProject(true);

        try {
            const promptDetails = formatPromptDetails(selectedStyles, currentAdvancedStyles);

            const newProject: Omit<Project, 'id' | 'user_id' | 'created_at'> = {
                title: projectTitle,
                imageUrl: editedImage,
                caption: generatedCaption || 'Gambar AI yang dibuat dengan KitStudio',
                aspectRatio: aspectRatio,
                promptDetails: promptDetails,
                type: 'image',
                promptFull: fullPromptForSaving,
            };

            await handleSaveProject(newProject);
            onNavigate('dashboard');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan proyek.';
            setError(message);
            setIsErrorModalOpen(true);
        } finally {
            setIsSavingProject(false);
        }
    }

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

    if (!user) {
        return <div className="flex items-center justify-center min-h-screen text-[#0D47A1]">Memuat data pengguna...</div>;
    }

    const isGenerateDisabled = isLoading || !originalImage || isAnalyzingStyles;
    const isCaptionDisabled = isCaptionLoading;
    const filteredPresets = presets.filter(p => p.category === detectedCategory);

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
                                <span className="text-lg font-bold text-[#0D47A1]">{user.credits}</span>
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
                                        {filteredPresets.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Preset Gaya untuk {detectedCategory}</h4>
                                                <div className="flex space-x-3 overflow-x-auto pb-2 -mx-1 px-1">
                                                    {filteredPresets.map((preset) => (
                                                        <div key={preset.id} className="relative group">
                                                            <button
                                                                onClick={() => applySavedStyle(preset.styles)}
                                                                className="flex-shrink-0 w-32 text-left p-3 rounded-lg border bg-white shadow-sm hover:border-[#1565C0] hover:bg-blue-50 transition-colors"
                                                                title={formatPromptDetails(preset.styles, currentAdvancedStyles)}
                                                            >
                                                                <span className="font-bold text-sm text-[#0D47A1]">{preset.name}</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeletePreset(preset.id)}
                                                                className="absolute top-1 right-1 p-1 bg-white/50 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                title="Hapus preset"
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
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

                        {userApiKeyInfo.hasKey && (
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
                                <span>{`4. Generate (${useOwnApiKey && userApiKeyInfo.hasKey ? 'Tanpa Kredit' : '5 Kredit'})`}</span>
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
                                        onClick={onSaveProject}
                                        disabled={!projectTitle || isSavingProject}
                                        className="w-full flex items-center justify-center px-4 py-3 text-base font-bold text-white bg-[#0D47A1] hover:bg-[#1565C0] rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSavingProject ? (
                                            <>
                                                <Spinner size="h-5 w-5 mr-2" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            'Simpan ke Project'
                                        )}
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
