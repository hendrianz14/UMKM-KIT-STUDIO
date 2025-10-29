"use client";

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import type { Project } from '@/lib/types';
import { ShareIcon } from '@/lib/icons';

const ImageCard: React.FC<{ project: Project; onShareClick?: (p: Project) => void }> = ({ project, onShareClick }) => {
  const [computedRatio, setComputedRatio] = useState<string | null>(null);

  const onImgLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (project.aspectRatio) return;
    const el = e.currentTarget;
    const w = el.naturalWidth || 0;
    const h = el.naturalHeight || 0;
    if (w > 0 && h > 0) {
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const g = gcd(w, h);
      setComputedRatio(`${Math.round(w / g)}:${Math.round(h / g)}`);
    }
  }, [project.aspectRatio]);
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col group">
      <div className="w-full aspect-[3/4] overflow-hidden bg-gray-50 p-3">
        <div className="relative w-full h-full rounded-lg overflow-hidden">
          {project.imageUrl ? (
            <Image
              src={project.imageUrl}
              alt={project.title || 'Preview project'}
              fill
              sizes="(min-width: 1280px) 240px, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              quality={60}
              onLoadingComplete={(img) => {
                if (!project.aspectRatio && img.naturalWidth && img.naturalHeight) {
                  const w = img.naturalWidth;
                  const h = img.naturalHeight;
                  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
                  const g = gcd(w, h);
                  setComputedRatio(`${Math.round(w / g)}:${Math.round(h / g)}`);
                }
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
              Tidak ada pratinjau
            </div>
          )}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-[#0D47A1] truncate">{project.title || 'Proyek Gambar AI'}</h3>
        {project.caption && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.caption}</p>
        )}
        <div className="mt-auto flex items-center justify-between">
          <button
            onClick={() => onShareClick && onShareClick(project)}
            className="flex items-center justify-center px-3 py-2 text-sm font-semibold text-[#1565C0] bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
          >
            <ShareIcon className="w-4 h-4 mr-2" /> Bagikan
          </button>
          {(project.aspectRatio || computedRatio) && (
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{project.aspectRatio || computedRatio}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
