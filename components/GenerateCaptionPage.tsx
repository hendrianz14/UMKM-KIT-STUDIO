"use client";
import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';

const GenerateCaptionPage = () => {
    const { userApiKeyInfo } = useAppContext();
    const [topic, setTopic] = useState('');
    const [caption, setCaption] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!topic.trim()) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setCaption('');

        try {
            const response = await fetch('/api/generate/caption', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: topic.trim(),
                    image: null,
                    useOwnApiKey: userApiKeyInfo.hasKey,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Gagal membuat caption.');
            }
            setCaption(data.caption);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Terjadi kesalahan saat membuat caption.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-8 animate-fadeInUp">
            <h1 className="text-4xl font-bold text-[#0D47A1]">AI Caption Generator</h1>
            <p className="text-[#1565C0] mt-2 mb-8">Buat caption media sosial yang menarik dalam hitungan detik.</p>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm max-w-2xl space-y-6">
                <div>
                    <label htmlFor="topic" className="block text-base font-bold text-[#0D47A1] mb-2">
                        Topik atau Kata Kunci
                    </label>
                    <input
                        type="text"
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Contoh: Kopi pagi hari, diskon spesial"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1565C0] focus:border-[#1565C0]"
                    />
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !topic}
                    className="w-full flex items-center justify-center sm:w-auto px-6 py-2 text-sm font-semibold text-white bg-[#0D47A1] rounded-lg hover:bg-[#1565C0] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Membuat...' : 'Buat Caption'}
                </button>

                {(caption || error) && (
                    <div className="pt-6 border-t border-gray-200">
                        <h2 className="text-xl font-bold text-[#0D47A1] mb-2">Hasil Caption</h2>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className={error ? 'text-red-600' : 'text-gray-800'}>
                                {error ?? caption}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenerateCaptionPage;
