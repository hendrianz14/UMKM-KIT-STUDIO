import React from 'react';

type AlertVariant = 'error' | 'success' | 'info' | 'warning';

interface AlertProps {
    message: string;
    variant?: AlertVariant;
    title?: string;
}

const variantStyles: Record<AlertVariant, string> = {
    error: 'bg-red-100 border-red-400 text-red-700',
    success: 'bg-emerald-100 border-emerald-400 text-emerald-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700',
    warning: 'bg-amber-100 border-amber-400 text-amber-700',
};

const defaultTitles: Record<AlertVariant, string> = {
    error: 'Error',
    success: 'Berhasil',
    info: 'Info',
    warning: 'Perhatian',
};

const Alert: React.FC<AlertProps> = ({ message, variant = 'error', title }) => {
    const variantClassName = variantStyles[variant];
    const resolvedTitle = title ?? defaultTitles[variant];

    return (
        <div
            role="alert"
            className={`border px-4 py-3 rounded-lg relative mb-6 ${variantClassName}`}
        >
            <strong className="font-bold">{resolvedTitle}!</strong>
            <span className="block sm:inline ml-2">{message}</span>
        </div>
    );
};

export default Alert;
