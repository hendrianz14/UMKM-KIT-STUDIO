"use client";

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

const normalize = (value: string) => value.trim().toLowerCase();

const KNOWN_AUTH_ERRORS: Record<string, string> = {
    [normalize('Kredensial tidak valid')]: 'Email atau kata sandi salah.',
    [normalize('Invalid login credentials')]: 'Email atau kata sandi salah.',
    [normalize('Invalid email or password')]: 'Email atau kata sandi salah.',
    [normalize('Email or password is incorrect')]: 'Email atau kata sandi salah.',
    [normalize('User not found')]: 'Akun tidak ditemukan.',
    [normalize('User already registered')]: 'Email sudah terdaftar.',
    [normalize('Email sudah terdaftar')]: 'Email sudah terdaftar.',
    [normalize('Identitas tidak ditemukan')]: 'Akun tidak ditemukan.',
};

export function useAuthMessages() {
    const searchParams = useSearchParams();
    const rawError = searchParams.get('error');
    const rawInfo = searchParams.get('info');

    const errorMessage = useMemo(() => {
        if (!rawError) return null;
        const normalized = normalize(rawError);
        return KNOWN_AUTH_ERRORS[normalized] ?? rawError;
    }, [rawError]);

    const infoMessage = useMemo(() => {
        const trimmed = rawInfo?.trim();
        return trimmed ? trimmed : null;
    }, [rawInfo]);

    return { errorMessage, infoMessage };
}
