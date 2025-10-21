"use client";
import React, { useState } from 'react';
import { KeyIcon, TrashIcon, CheckIcon } from '@/lib/constants';
import { useAppContext } from '@/contexts/AppContext';

const ApiKeyUser: React.FC = () => {
    const { userApiKeyInfo, setUserApiKeyInfo } = useAppContext();
    const [inputApiKey, setInputApiKey] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        if (!inputApiKey.trim()) return;
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch('/api/user/api-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: inputApiKey }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Gagal menyimpan kunci API.");
            }
            setUserApiKeyInfo(data);
            setInputApiKey('');
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2500);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/user/api-key', { method: 'DELETE' });
            if (!response.ok) {
                throw new Error("Gagal menghapus kunci API.");
            }
            setUserApiKeyInfo(null);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-8 animate-fadeInUp">
            <h1 className="text-4xl font-bold text-[#0D47A1]">Pengaturan</h1>
            <p className="text-[#1565C0] mt-2 mb-8">Kelola preferensi dan kunci API Anda di sini.</p>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm max-w-2xl space-y-8">
                <div>
                    <h2 className="text-xl font-bold text-[#0D47A1] mb-4">Kunci API Tersimpan</h2>
                    {userApiKeyInfo.hasKey ? (
                        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-4 min-w-0">
                                <KeyIcon className="w-8 h-8 text-[#1565C0] flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-800 truncate">Kunci Google AI Studio</p>
                                    <p className="text-sm text-gray-500 font-mono tracking-wider truncate">
                                        {userApiKeyInfo.masked ?? '••••••••••'}
                                    </p>
                                    {userApiKeyInfo.updatedAt && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            Diperbarui: {new Date(userApiKeyInfo.updatedAt).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200 transition-colors disabled:opacity-50"
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

                <div>
                    <h2 className="text-xl font-bold text-[#0D47A1]">
                        {userApiKeyInfo.hasKey ? 'Ganti Kunci API' : 'Tambah Kunci API Baru'}
                    </h2>
                    <p className="text-gray-600 mt-2 mb-4 text-sm">
                        Gunakan kunci API Anda sendiri untuk generasi tanpa batas. Kunci Anda disimpan dengan aman.
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
                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <button
                            onClick={handleSave}
                            disabled={!inputApiKey.trim() || isLoading}
                            className="w-full flex items-center justify-center sm:w-auto px-6 py-2 text-sm font-semibold text-white bg-[#0D47A1] rounded-lg hover:bg-[#1565C0] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                             {saveSuccess ? (
                                <>
                                    <CheckIcon className="w-5 h-5 mr-2" />
                                    <span>Tersimpan!</span>
                                </>
                             ) : isLoading ? 'Menyimpan...' : 'Simpan Kunci'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyUser;
