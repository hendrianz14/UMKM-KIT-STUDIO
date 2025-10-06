'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthError } from '@supabase/supabase-js';
import { createClient as createSupabaseClient } from '@/utils/supabase/client';
import { useAuthMessages } from '../hooks/useAuthMessages';
import { useInView } from '../hooks/useInView';
import GoogleIcon from './ui/GoogleIcon';
import Alert from './ui/Alert';
import RememberGoogleLinkSync from './auth/RememberGoogleLinkSync';

type AuthErrorCode = 'invalid_credentials' | 'email_not_confirmed' | 'rate_limit_exceeded';

const AUTH_ERROR_MESSAGES: Record<AuthErrorCode | 'unknown', string> = {
  invalid_credentials: 'Email atau kata sandi salah. Periksa kembali.',
  email_not_confirmed: 'Email belum dikonfirmasi. Cek inbox Anda untuk tautan verifikasi.',
  rate_limit_exceeded: 'Terlalu banyak percobaan. Silakan coba lagi beberapa saat lagi.',
  unknown: 'Terjadi kesalahan. Silakan coba lagi.',
};

const KNOWN_ERROR_CODES = new Set<AuthErrorCode>([
  'invalid_credentials',
  'email_not_confirmed',
  'rate_limit_exceeded',
]);

function detectCodeFromMessage(message: string): AuthErrorCode | null {
  const normalized = message.toLowerCase();

  if (normalized.includes('email not confirmed') || normalized.includes('confirm your email')) {
    return 'email_not_confirmed';
  }

  if (normalized.includes('too many requests') || normalized.includes('rate limit')) {
    return 'rate_limit_exceeded';
  }

  if (
    normalized.includes('invalid login') ||
    normalized.includes('invalid email or password') ||
    normalized.includes('invalid credentials') ||
    normalized.includes('invalid_grant')
  ) {
    return 'invalid_credentials';
  }

  return null;
}

function resolveAuthError(error: AuthError | null): string {
  if (!error) {
    return AUTH_ERROR_MESSAGES.unknown;
  }

  const augmented = error as AuthError & { code?: string; status?: number };
  const codeFromError = typeof augmented.code === 'string' ? augmented.code.toLowerCase() : '';

  if (KNOWN_ERROR_CODES.has(codeFromError as AuthErrorCode)) {
    return AUTH_ERROR_MESSAGES[codeFromError as AuthErrorCode];
  }

  if (augmented.status === 429) {
    return AUTH_ERROR_MESSAGES.rate_limit_exceeded;
  }

  if (augmented.status === 400) {
    return AUTH_ERROR_MESSAGES.invalid_credentials;
  }

  if (augmented.message) {
    const inferred = detectCodeFromMessage(augmented.message);
    if (inferred) {
      return AUTH_ERROR_MESSAGES[inferred];
    }

    return augmented.message;
  }

  return AUTH_ERROR_MESSAGES.unknown;
}

const SignIn: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ref, isInView] = useInView({ threshold: 0.2, triggerOnce: true });
  const { errorMessage, infoMessage } = useAuthMessages();
  const supabase = useMemo(() => createSupabaseClient(), []);

  const hasAlertSpacing = useMemo(
    () => Boolean(errorMessage || infoMessage || formError),
    [errorMessage, infoMessage, formError]
  );

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail, remember: true }));
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormError(null);

      const email = formData.email.trim();
      const password = formData.password;

      if (formData.remember) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      if (!email || !password) {
        setFormError('Email dan kata sandi wajib diisi.');
        return;
      }

      setIsSubmitting(true);

      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          setFormError(resolveAuthError(error));
          return;
        }

        setFormError(null);
        router.replace('/dashboard');
        router.refresh();
      } catch {
        setFormError('Tidak dapat terhubung ke server. Silakan coba lagi.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData.email, formData.password, formData.remember, router, supabase]
  );

  const handleForgot = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const hiddenEmail = document.getElementById('forgot-email-hidden') as HTMLInputElement | null;
    if (hiddenEmail) {
      hiddenEmail.value = formData.email.trim();
    }
    const forgotForm = document.getElementById('forgot-form') as HTMLFormElement | null;
    forgotForm?.submit();
  }, [formData.email]);

  return (
    <div
      ref={ref}
      className={`bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-sm w-full transition-opacity duration-700 ${isInView ? 'animate-fadeInUp' : 'opacity-0'}`}
    >
      <div className={`text-center mb-6 ${hasAlertSpacing ? 'md:mb-4' : ''}`}>
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Welcome Back!</h1>
        <p className="text-gray-500 mt-2">Sign in to continue to your account.</p>
      </div>

      {errorMessage && <Alert message={errorMessage} variant="error" />}
      {!errorMessage && infoMessage && <Alert message={infoMessage} variant="success" />}

      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && <Alert message={formError} variant="error" />}
        <div style={{ animationDelay: '200ms' }} className={isInView ? 'animate-fadeInUp' : 'opacity-0'}>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow"
            placeholder="you@example.com"
          />
        </div>

        <div style={{ animationDelay: '300ms' }} className={isInView ? 'animate-fadeInUp' : 'opacity-0'}>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow"
            placeholder="********"
          />
        </div>

        <div style={{ animationDelay: '400ms' }} className={`flex items-center justify-between ${isInView ? 'animate-fadeInUp' : 'opacity-0'}`}>
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember"
              type="checkbox"
              checked={formData.remember}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember Me
            </label>
          </div>
          <a href="#" onClick={handleForgot} className="text-sm font-medium text-secondary hover:text-primary">
            Forgot your password?
          </a>
        </div>

        <div style={{ animationDelay: '500ms' }} className={isInView ? 'animate-fadeInUp' : 'opacity-0'}>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white bg-secondary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 transform hover:scale-105"
          >
            Sign In
          </button>
        </div>
      </form>
      <RememberGoogleLinkSync />

      <div className="mt-5">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        <div className="mt-5">
          <a
            id="google-login-link"
            href="/api/auth/oauth/google?redirect=/dashboard"
            className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-all duration-300 transform hover:scale-105"
          >
            <GoogleIcon />
            <span>Sign in with Google</span>
          </a>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <a href="/sign-up" className="font-semibold leading-6 text-secondary hover:text-primary">
          Sign Up
        </a>
      </p>

      <form id="forgot-form" method="post" action="/api/auth/forgot" className="hidden">
        <input type="hidden" name="email" value="" id="forgot-email-hidden" />
      </form>
    </div>
  );
};

export default SignIn;
