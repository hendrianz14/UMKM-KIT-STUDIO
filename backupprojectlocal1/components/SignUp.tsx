"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuthMessages } from '../hooks/useAuthMessages';
import { useInView } from '../hooks/useInView';
import GoogleIcon from './ui/GoogleIcon';
import Alert from './ui/Alert';

const CheckIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 inline-block transition-colors duration-300 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

// --- Component ---
interface PasswordValidationState {
    minLength: boolean;
    hasNumber: boolean;
    hasUpperCase: boolean;
    hasSpecialChar: boolean;
}

export default function SignUpForm() {
    const [formRef, isInView] = useInView({ threshold: 0.1 });
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const { errorMessage, infoMessage } = useAuthMessages();

    const passwordValidation = useMemo<PasswordValidationState>(() => ({
        minLength: password.length >= 8,
        hasNumber: /\d/.test(password),
        hasUpperCase: /[A-Z]/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>_]/.test(password),
    }), [password]);

    const isFormValid = name && email && Object.values(passwordValidation).every(Boolean);

    const ValidationItem = ({ isValid, text }: { isValid: boolean; text: string }) => (
        <li className={`flex items-center transition-colors duration-300 ${isValid ? 'text-success' : 'text-gray-500'}`}>
            <CheckIcon className={isValid ? 'text-success' : 'text-gray-400'} />
            {text}
        </li>
    );

    return (
        <div
            ref={formRef}
            className={`bg-white rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-sm mx-auto transform transition-all duration-700 opacity-0 ${isInView ? 'animate-fadeInUp' : ''}`}
        >
            <div className="text-center mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Create Account</h1>
                <p className="text-gray-600">Get started with your new account.</p>
            </div>

            {errorMessage && <Alert message={errorMessage} variant="error" />}
            {!errorMessage && infoMessage && <Alert message={infoMessage} variant="success" />}

            <form method="post" action="/api/auth/signup" noValidate>
                <input type="hidden" name="redirect" value="/dashboard" />
                <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="John Doe"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="you@example.com"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="********"
                        required
                    />
                </div>

                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isPasswordFocused || password.length > 0 ? 'max-h-40 opacity-100 mb-5' : 'max-h-0 opacity-0'}`}>
                    <ul className="space-y-1 text-sm pl-1">
                        <ValidationItem isValid={passwordValidation.minLength} text="At least 8 characters" />
                        <ValidationItem isValid={passwordValidation.hasUpperCase} text="Contains an uppercase letter" />
                        <ValidationItem isValid={passwordValidation.hasNumber} text="Contains a number" />
                        <ValidationItem isValid={passwordValidation.hasSpecialChar} text="Contains a special character" />
                    </ul>
                </div>

                <button
                    type="submit"
                    disabled={!isFormValid}
                    className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-secondary focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Sign Up
                </button>
            </form>

            <div className="flex items-center my-5">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500 font-medium text-sm">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <a className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-light transition-colors duration-300" href="/api/auth/oauth/google?redirect=/dashboard">
                <GoogleIcon />
                Sign up with Google
            </a>

            <p className="text-center text-gray-600 mt-6 text-sm">
                Already have an account?{' '}
                <Link href="/sign-in" className="text-secondary hover:text-primary font-semibold">
                    Sign In
                </Link>
            </p>
        </div>
    );
}
