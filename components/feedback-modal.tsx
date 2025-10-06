// components/feedback-modal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { XIcon, BugIcon, LightbulbIcon } from '../lib/icons';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [feedbackType, setFeedbackType] = useState<'Issue' | 'Ide'>('Issue');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFeedbackType('Issue');
      setMessage('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      type: feedbackType,
      message: message,
    });
    alert('Masukan Anda telah dikirim! (mock)');
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center md:items-start justify-center p-4 overflow-y-auto"
      aria-labelledby="feedback-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all animate-fadeInUp md:mt-20"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 id="feedback-modal-title" className="text-xl font-bold text-[#0D47A1]">Berikan Masukan</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
              aria-label="Tutup"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label htmlFor="message" className="sr-only">Pesan</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1565C0] focus:border-[#1565C0] transition text-gray-900 placeholder:text-gray-500"
                placeholder="Apa yang bisa kami perbaiki atau ide apa yang Anda punya?"
                required
              ></textarea>
            </div>
            
            <fieldset>
              <legend className="sr-only">Tipe Masukan</legend>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setFeedbackType('Issue')}
                  className={`flex items-center justify-center flex-1 px-4 py-2 border rounded-lg cursor-pointer transition text-center ${feedbackType === 'Issue' ? 'bg-blue-50 border-[#0D47A1] ring-2 ring-[#0D47A1]' : 'border-gray-300 hover:border-gray-400'}`}
                >
                  <BugIcon className="w-5 h-5 mr-2 text-[#0D47A1]" />
                  <span className="font-semibold text-sm text-[#0D47A1]">Issue</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackType('Ide')}
                  className={`flex items-center justify-center flex-1 px-4 py-2 border rounded-lg cursor-pointer transition text-center ${feedbackType === 'Ide' ? 'bg-blue-50 border-[#0D47A1] ring-2 ring-[#0D47A1]' : 'border-gray-300 hover:border-gray-400'}`}
                >
                  <LightbulbIcon className="w-5 h-5 mr-2 text-[#0D47A1]" />
                  <span className="font-semibold text-sm text-[#0D47A1]">Ide</span>
                </button>
              </div>
            </fieldset>
          </div>
          
          <div className="flex justify-end items-center p-6 bg-gray-50 rounded-b-2xl space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-[#0D47A1] rounded-lg hover:bg-[#1565C0]"
            >
              Kirim
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
