'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { KeyIcon, TrashIcon, CheckIcon } from '../lib/constants';

export default function SettingsPage() {
    const router = useRouter();
    const [inputApiKey, setInputApiKey] = useState('');
    const [savedApiKey, setSavedApiKey] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        const storedKey = localStorage.getItem('user_gemini_api_key');
        if (storedKey) {
            setSavedApiKey(storedKey);
        }
    }, []);

    const censorApiKey = (key: string): string => {
        if (key.length <= 7) {
            return key.substring(0, 3) + '****';
        }
        return `${key.substring(0, 3)}********************${key.substring(key.length - 4)}`;
    };

    const handleSave = () => {
        if (!inputApiKey.trim()) return;
        
        localStorage.setItem('user_gemini_api_key', inputApiKey);
        setSavedApiKey(inputApiKey);
        setInputApiKey('');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
    };

    const handleDelete = () => {
        localStorage.removeItem('user_gemini_api_key');
        setSavedApiKey(null);
    };

    return (
        <div className="max-w-7xl mx-auto p-8 animate-fadeInUp">
            <h1 className="text-4xl font-bold text-[#0D47A1]">Pengaturan</h1>
            <p className="text-[#1565C0] mt-2 mb-8">Kelola preferensi dan kunci API Anda di sini.</p>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm max-w-2xl space-y-8">
                {/* Section for saved API Key */}
                <div>
                    <h2 className="text-xl font-bold text-[#0D47A1] mb-4">Kunci API Tersimpan</h2>
                    {savedApiKey ? (
                        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-4">
                                <KeyIcon className="w-8 h-8 text-[#1565C0] flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-gray-800">Kunci Google AI Studio</p>
                                    <p className="text-sm text-gray-500 font-mono tracking-wider">{censorApiKey(savedApiKey)}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleDelete}
                                className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
                                aria-label="Hapus Kunci API"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-6 px-4 border-2 border-dashed border-gray-200 rounded-lg">
                            <p className="text-sm text-gray-500">Belum ada kunci API yang disimpan.</p>
                        </div>
                    )}
                </div>

                {/* Section to add a new API Key */}
                <div>
                    <h2 className="text-xl font-bold text-[#0D47A1]">{savedApiKey ? 'Ganti Kunci API' : 'Tambah Kunci API Baru'}</h2>
                    <p className="text-gray-600 mt-2 mb-4 text-sm">
                        Gunakan kunci API Anda sendiri untuk generasi tanpa batas. Kunci Anda disimpan dengan aman di browser Anda.
                        <br />
                        <a 
                            href="https://aistudio.google.com/app/apikey" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#1565C0] hover:underline font-semibold"
                        >
                            Dapatkan kunci API Google AI Studio Anda di sini.
                        </a>
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-1 sr-only">
                                Kunci API Anda
                            </label>
                            <input
                                type="password"
                                id="api-key"
                                value={inputApiKey}
                                onChange={(e) => setInputApiKey(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1565C0] focus:border-[#1565C0]"
                                placeholder="Masukkan kunci API baru di sini..."
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={!inputApiKey.trim()}
                            className="w-full flex items-center justify-center sm:w-auto px-6 py-2 text-sm font-semibold text-white bg-[#0D47A1] rounded-lg hover:bg-[#1565C0] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                             {saveSuccess ? (
                                <>
                                    <CheckIcon className="w-5 h-5 mr-2" />
                                    <span>Tersimpan!</span>
                                </>
                            ) : (
                                <span>Simpan Kunci</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
