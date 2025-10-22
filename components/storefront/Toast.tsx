'use client';

import { useEffect } from 'react';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XIcon from './icons/XIcon';

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

const Toast = ({ message, duration = 3000, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed right-5 top-5 z-50 flex items-center rounded-lg bg-secondary px-4 py-3 text-white shadow-lg">
      <CheckCircleIcon />
      <span className="ml-3 font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-4 rounded-full p-1 transition hover:bg-primary"
        aria-label="Tutup notifikasi"
      >
        <XIcon />
      </button>
    </div>
  );
};

export default Toast;
