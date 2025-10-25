"use client";

import React from 'react';
import Link from 'next/link';
import { TextIcon, TagIcon, MessageSquareIcon, MailIcon } from '@/lib/constants';

const toolConfig = {
    caption: {
        name: "Caption Media Sosial",
        description: "Buat caption menarik untuk Instagram, Facebook, dll.",
        icon: TextIcon,
        href: '/textgenerator/caption',
    },
    catalog: {
        name: "Deskripsi Katalog",
        description: "Tulis deskripsi produk yang persuasif untuk e-commerce.",
        icon: TagIcon,
        href: '/textgenerator/catalog',
    },
    whatsapp: {
        name: "Materi Bulk WhatsApp",
        description: "Buat pesan promosi singkat untuk WhatsApp blast.",
        icon: MessageSquareIcon,
        href: '/textgenerator/whatsapp',
    },
    email: {
        name: "Email Marketing",
        description: "Rancang draf email marketing untuk pelanggan Anda.",
        icon: MailIcon,
        href: '/textgenerator/email',
    }
};

const GenerateTextPage: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto py-8 animate-fadeInUp">
            <h1 className="text-4xl font-bold text-[#0D47A1]">AI Text Generator</h1>
            <p className="text-[#1565C0] mt-2 mb-8">Pilih alat yang Anda butuhkan untuk membuat konten tulisan berkualitas.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {(Object.values(toolConfig)).map(tool => {
                    const Icon = tool.icon;
                    return (
                        <Link
                            key={tool.name}
                            href={tool.href}
                            className="block p-6 rounded-2xl border-2 border-gray-200 bg-white text-left transition-all duration-300 hover:border-[#1565C0] hover:shadow-xl hover:-translate-y-1 group"
                        >
                            <Icon className="w-10 h-10 mb-4 text-[#1565C0] transition-transform duration-300 group-hover:scale-110" />
                            <h3 className="font-bold text-lg text-[#0D47A1]">{tool.name}</h3>
                            <p className="text-sm mt-1 text-gray-500">{tool.description}</p>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default GenerateTextPage;

