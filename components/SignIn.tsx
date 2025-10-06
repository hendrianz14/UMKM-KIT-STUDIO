'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useInView } from '../hooks/useInView';
import GoogleIcon from './ui/GoogleIcon';
import AuthFlash from './AuthFlash';
import RememberGoogleLinkSync from './auth/RememberGoogleLinkSync';

const SignIn: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [ref, isInView] = useInView({ threshold: 0.2, triggerOnce: true });

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

  const handleSubmit = useCallback(() => {
    if (formData.remember) {
      localStorage.setItem('rememberedEmail', formData.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
  }, [formData.email, formData.remember]);

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
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Welcome Back!</h1>
        <p className="text-gray-500 mt-2">Sign in to continue to your account.</p>
      </div>

      <form method="post" action="/api/auth/signin" onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="redirect" value="/dashboard" />
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
            placeholder="you@gmail.com"
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
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white bg-secondary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 transform hover:scale-105"
          >
            Sign In
          </button>
        </div>
      </form>
      <RememberGoogleLinkSync />

      <p className="mt-2 text-center text-sm text-red-600" data-auth-error></p>
      <p className="mt-2 text-center text-sm text-emerald-600" data-auth-info></p>

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
        Don't have an account?{' '}
        <a href="/sign-up" className="font-semibold leading-6 text-secondary hover:text-primary">
          Sign Up
        </a>
      </p>

      <form id="forgot-form" method="post" action="/api/auth/forgot" className="hidden">
        <input type="hidden" name="email" value="" id="forgot-email-hidden" />
      </form>

      <AuthFlash />
    </div>
  );
};

export default SignIn;










