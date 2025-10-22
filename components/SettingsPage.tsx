'use client';

import React, { useState, useEffect } from 'react';
import { KeyIcon, TrashIcon, CheckIcon } from '../lib/constants';

type ApiKeyInfo = {
    isSet: boolean;
    maskedKey: string | null;
    updatedAt: string | null;
};

export default function SettingsPage() {
    const [inputApiKey, setInputApiKey] = useState('');
    const [apiKeyInfo, setApiKeyInfo] = useState<ApiKeyInfo>({ isSet: false, maskedKey: null, updatedAt: null });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/user/api-key', { cache: 'no-store', signal: controller.signal });
                let payload: Partial<ApiKeyInfo> & { message?: string } = {};
                try {
                    payload = await response.json();
                } catch {
                    payload = {};
                }
                if (!response.ok) {
                    throw new Error(payload.message || 'Gagal memuat status kunci API');
                }
                if (!controller.signal.aborted) {
                    setApiKeyInfo({
                        isSet: Boolean(payload.isSet),
                        maskedKey: (payload.maskedKey as string | null) ?? null,
                        updatedAt: (payload.updatedAt as string | null) ?? null,
                    });
                }
            } catch (err) {
                if (!controller.signal.aborted) {
                    setError(err instanceof Error ? err.message : 'Gagal memuat status kunci API');
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };
        load();
        return () => controller.abort();
    }, []);

    const handleSave = async () => {
        const apiKey = inputApiKey.trim();
        if (!apiKey) return;

        setIsSaving(true);
        setError(null);
        setSaveSuccess(false);
        try {
            const response = await fetch('/api/user/api-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey }),
            });
            let payload: Partial<ApiKeyInfo> & { message?: string } = {};
            try {
                payload = await response.json();
            } catch {
                payload = {};
            }
            if (!response.ok) {
                throw new Error(payload.message || 'Gagal menyimpan kunci API');
            }

            setApiKeyInfo({
                isSet: true,
                maskedKey: (payload.maskedKey as string | null) ?? null,
                updatedAt: (payload.updatedAt as string | null) ?? new Date().toISOString(),
            });
            setInputApiKey('');
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menyimpan kunci API');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsSaving(true);
        setError(null);
        setSaveSuccess(false);
        try {
            const response = await fetch('/api/user/api-key', { method: 'DELETE' });
            let payload: { message?: string } = {};
            try {
                payload = await response.json();
            } catch {
                payload = {};
            }
            if (!response.ok) {
                throw new Error(payload.message || 'Gagal menghapus kunci API');
            }
            setApiKeyInfo({ isSet: false, maskedKey: null, updatedAt: null });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menghapus kunci API');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-8 animate-fadeInUp">
            <h1 className="text-4xl font-bold text-[#0D47A1]">Pengaturan</h1>
            <p className="text-[#1565C0] mt-2 mb-8">Kelola preferensi dan kunci API Anda di sini.</p>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm max-w-2xl space-y-8">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <h2 className="text-xl font-bold text-[#0D47A1] mb-4">Kunci API Tersimpan</h2>
                    {isLoading ? (
                        <div className="text-center py-6 px-4 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500">
                            Memuat status kunci API...
                        </div>
                    ) : apiKeyInfo.isSet ? (
                        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-4">
                                <KeyIcon className="w-8 h-8 text-[#1565C0] flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-gray-800">Kunci Google AI Studio</p>
                                    <p className="text-sm text-gray-500 font-mono tracking-wider">{apiKeyInfo.maskedKey}</p>
                                    {apiKeyInfo.updatedAt && (
                                        <p className="text-xs text-gray-400 mt-1">Diperbarui {new Date(apiKeyInfo.updatedAt).toLocaleString('id-ID')}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={handleDelete}
                                disabled={isSaving}
                                className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200 transition-colors disabled:opacity-50"
                                aria-label="Hapus Kunci API"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-6 px-4 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500">
                            Belum ada kunci API yang disimpan.
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="text-xl font-bold text-[#0D47A1]">{apiKeyInfo.isSet ? 'Ganti Kunci API' : 'Tambah Kunci API Baru'}</h2>
                    <p className="text-gray-600 mt-2 mb-4 text-sm">
                        Gunakan kunci API Anda sendiri untuk generasi tanpa batas. Kunci disimpan secara terenkripsi di server.
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
                                disabled={isSaving}
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isSaving || !inputApiKey.trim()}
                            className="w-full flex items-center justify-center sm:w-auto px-6 py-2 text-sm font-semibold text-white bg-[#0D47A1] rounded-lg hover:bg-[#1565C0] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {saveSuccess ? (
                                <>
                                    <CheckIcon className="w-5 h-5 mr-2" />
                                    <span>Tersimpan!</span>
                                </>
                            ) : (
                                <span>{isSaving ? 'Menyimpan...' : 'Simpan Kunci'}</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}