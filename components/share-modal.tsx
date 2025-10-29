// components/share-modal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Project } from '../lib/types';
import { XIcon, ShareIcon, DownloadIcon, CopyIcon, CheckIcon } from '../lib/icons';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, project }) => {
  const [isShareApiSupported, setIsShareApiSupported] = useState(false);
  const [isFileShareSupported, setIsFileShareSupported] = useState(false);
  const [captionCopied, setCaptionCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState('3/4');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supportsShare = typeof navigator.share === 'function';
      setIsShareApiSupported(supportsShare);
      if (supportsShare && typeof navigator.canShare === 'function') {
        try {
          const dummyFile = new File([""], "dummy.txt", { type: "text/plain" });
          setIsFileShareSupported(navigator.canShare({ files: [dummyFile] }));
        } catch {
          setIsFileShareSupported(false);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCaptionCopied(false);
      setShareError(null);
      if (project?.imageUrl) {
        const img = new Image();
        img.onload = () => {
          setImageAspectRatio(`${img.naturalWidth} / ${img.naturalHeight}`);
        };
        img.src = project.imageUrl;
      }
    }
  }, [isOpen, project?.imageUrl]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isOpen || !project || !mounted) {
    return null;
  }

  const isProject = project.type === 'project';
  const isImageOnly = !!project.imageUrl && !isProject;
  const isTextOnly = !project.imageUrl;
  const hasCaption = Boolean(project.caption && project.caption.trim() !== '');

  const handleNativeShare = async () => {
    try {
      setShareError(null);
      if (isTextOnly || hasCaption) {
        navigator.clipboard.writeText(project.caption ?? project.type).then(() => {
          setCaptionCopied(true);
          setTimeout(() => setCaptionCopied(false), 2500);
        });
      }
      if (isTextOnly) {
        // Share teks saja
        await navigator.share({
          title: project.title,
          text: project.caption ?? project.title ?? 'Konten teks',
        });
      } else {
        // Share dengan file gambar
        if (!isFileShareSupported) {
          // Fallback: tanpa dukungan file share, arahkan ke unduhan atau buka gambar
          await navigator.share({ title: project.title, text: project.caption ?? project.title ?? '' });
          onClose();
          return;
        }
        if (!project.imageUrl) {
          setShareError('Gambar tidak tersedia.');
          return;
        }
        const response = await fetch(project.imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'image.jpg', { type: blob.type });

        if (!navigator.canShare({ files: [file] })) {
          throw new Error('Tidak dapat membagikan file ini.');
        }

        await navigator.share({
          title: project.title,
          text: project.caption ?? project.type,
          files: [file],
        });
      }
      onClose();
    } catch (caughtError) {
      if ((caughtError as DOMException).name !== 'AbortError') {
          console.error('Error sharing content:', caughtError);
          setShareError('Gagal membagikan konten. Silakan coba lagi.');
      }
    }
  };

  const handleDownloadImage = async () => {
    try {
      if (!project.imageUrl) {
        setShareError('Gambar tidak tersedia.');
        return;
      }
      const response = await fetch(project.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      const filename = `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (downloadError) {
      console.error('Error downloading image:', downloadError);
      if (project.imageUrl) {
        window.open(project.imageUrl, '_blank');
      }
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(project.caption ?? project.type).then(() => {
      setCaptionCopied(true);
      setTimeout(() => setCaptionCopied(false), 2500);
    });
  };

  const ManualOptions = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {!isTextOnly && (
        <button
          onClick={handleDownloadImage}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-semibold text-[#1565C0] bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
        >
          <DownloadIcon className="w-5 h-5 mr-2" />
          <span>Unduh Gambar</span>
        </button>
      )}
      {(isTextOnly || hasCaption) && (
        <button
          onClick={handleCopyCaption}
          className={`w-full flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${captionCopied ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-[#1565C0] hover:bg-blue-200'}`}
        >
          {captionCopied ? (
            <>
              <CheckIcon className="w-5 h-5 mr-2" />
              <span>Tersalin!</span>
            </>
          ) : (
            <>
              <CopyIcon className="w-5 h-5 mr-2" />
              <span>{isTextOnly ? 'Salin Teks' : 'Salin Caption'}</span>
            </>
          )}
        </button>
      )}
    </div>
  );

  const modal = (
    <div
      className="fixed inset-0 bg-black/60 z-[1000] flex items-start justify-center p-4 sm:p-6 overflow-y-auto"
      aria-labelledby="share-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden transform transition-all animate-fadeInUp mt-6 sm:mt-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 id="share-modal-title" className="text-xl font-bold text-[#0D47A1]">
            {isProject ? 'Bagikan Project' : isImageOnly ? 'Bagikan Gambar' : 'Bagikan Teks'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
            aria-label="Tutup"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow p-6 text-center overflow-y-auto">
            {!isTextOnly && project.imageUrl && (
              <div className="mb-4">
                  <img 
                      src={project.imageUrl} 
                      alt={project.title}
                      className="w-full object-contain rounded-lg mx-auto shadow-md max-h-[55vh] md:max-h-[60vh]"
                      style={{ aspectRatio: imageAspectRatio }}
                  />
              </div>
            )}
            <h3 className="font-bold text-lg text-[#0D47A1] truncate">{project.title}</h3>
            <p className="text-sm text-gray-500 mb-6" style={{ 
                overflow: 'hidden', 
                display: '-webkit-box', 
                WebkitLineClamp: 3, 
                WebkitBoxOrient: 'vertical' 
              }}>
                {project.caption ?? (isTextOnly ? 'Konten Teks' : project.type)}
            </p>

            {isShareApiSupported ? (
                <div className="space-y-4">
                    {shareError && (
                        <p className="text-sm text-red-600" role="status" aria-live="polite">
                            {shareError}
                        </p>
                    )}
                    <button
                        onClick={handleNativeShare}
                        className="w-full flex items-center justify-center px-4 py-3 text-base font-semibold text-white bg-[#0D47A1] hover:bg-[#1565C0] rounded-lg transition-colors"
                    >
                        <ShareIcon className="w-5 h-5 mr-3" />
                        <span>{isTextOnly ? 'Bagikan Teks...' : 'Bagikan via...'}</span>
                    </button>
                    {(isTextOnly || hasCaption) && (
                      <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-gray-200" />
                          </div>
                          <div className="relative flex justify-center text-sm">
                              <span className="px-2 bg-white text-gray-500">
                                  {isTextOnly ? 'Teks otomatis disalin untuk Anda' : 'Caption otomatis disalin untuk Anda'}
                              </span>
                          </div>
                      </div>
                    )}
                    <ManualOptions />
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-xs text-center text-gray-600 bg-gray-100 p-3 rounded-lg">Browser Anda tidak mendukung berbagi langsung. Silakan gunakan opsi di bawah ini.</p>
                    <ManualOptions />
                </div>
            )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default ShareModal;
