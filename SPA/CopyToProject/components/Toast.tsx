'use client';

import React, { useEffect } from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XIcon } from './icons/XIcon';

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  return (
    <div className="fixed top-5 right-5 bg-secondary text-white p-4 rounded-lg shadow-lg flex items-center z-50 animate-fadeInUp">
      <CheckCircleIcon />
      <span className="ml-3 font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-primary transition-colors">
        <XIcon />
      </button>
    </div>
  );
};

export default Toast;