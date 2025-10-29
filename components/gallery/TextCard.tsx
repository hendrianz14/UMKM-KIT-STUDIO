"use client";

import React from 'react';
import type { Project } from '@/lib/types';
import { ShareIcon } from '@/lib/icons';

const TextCard: React.FC<{ project: Project; onShareClick?: (p: Project) => void }> = ({ project, onShareClick }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col">
      <div className="mb-3">
        <span className="inline-block text-xs font-semibold text-[#1565C0] bg-blue-50 px-2 py-1 rounded-full">Teks</span>
      </div>
      <h3 className="font-bold text-lg text-[#0D47A1] mb-2 truncate">{project.title || 'Konten Teks'}</h3>
      <p className="text-gray-700 whitespace-pre-line text-sm flex-1" style={{overflow: 'hidden'}}>
        {project.caption || '—'}
      </p>
      <div className="mt-4 flex items-center justify-between">
        {project.created_at ? (
          <p className="text-xs text-gray-500">{new Date(project.created_at).toLocaleString()}</p>
        ) : <span />}
        {onShareClick && (
          <button
            onClick={() => onShareClick(project)}
            className="flex items-center justify-center px-3 py-2 text-sm font-semibold text-[#1565C0] bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
          >
            <ShareIcon className="w-4 h-4 mr-2" /> Bagikan
          </button>
        )}
      </div>
    </div>
  );
};

export default TextCard;
