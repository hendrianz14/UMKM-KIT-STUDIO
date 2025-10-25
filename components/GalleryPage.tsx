"use client";

import React, { useMemo, useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import ProjectCard from './project-card';
import ShareModal from './share-modal';
import type { Project } from '@/lib/types';

type TabKey = 'all' | 'images' | 'captions' | 'texts' | 'edited';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'images', label: 'Gambar AI' },
  { key: 'captions', label: 'Caption AI' },
  { key: 'texts', label: 'Teks AI' },
  { key: 'edited', label: 'Gambar Hasil Edit' },
];

const GalleryPage: React.FC = () => {
  const { projects, creditHistory } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [shareProject, setShareProject] = useState<Project | null>(null);

  const imageProjects = useMemo(
    () => projects.filter((p) => Boolean(p.imageUrl)),
    [projects]
  );

  const captionProjects = useMemo(
    () => projects.filter((p) => Boolean(p.caption) || p.type === 'Caption AI'),
    [projects]
  );

  // Tidak ada flag eksplisit "edited"; asumsikan proyek bergambar adalah hasil edit/generate
  const editedProjects = imageProjects;

  const textActivities = useMemo(
    () =>
      creditHistory
        .filter((h) => /Generate Caption|Caption/i.test(h.type))
        .slice(0, 20),
    [creditHistory]
  );

  const displayedProjects = useMemo(() => {
    switch (activeTab) {
      case 'images':
        return imageProjects;
      case 'captions':
        return captionProjects;
      case 'edited':
        return editedProjects;
      case 'all':
      default:
        return projects;
    }
  }, [activeTab, projects, imageProjects, captionProjects, editedProjects]);

  return (
    <div className="max-w-7xl mx-auto py-8 animate-fadeInUp">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-[#0D47A1]">Galeri</h1>
        <p className="text-[#1565C0] mt-2">Koleksi hasil generate dan edit Anda.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
              activeTab === t.key
                ? 'bg-[#0D47A1] text-white border-[#0D47A1]'
                : 'bg-white text-[#1565C0] border-[#1565C0] hover:bg-blue-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Grid Project */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {displayedProjects.length > 0 ? (
          displayedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onShareClick={(p) => setShareProject(p)}
            />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 bg-white p-12 rounded-2xl border border-gray-200">
            Belum ada item pada tab ini.
          </div>
        )}
      </div>

      {/* Daftar Aktivitas Teks (Caption) */}
      {activeTab === 'texts' && (
        <div className="mt-10 bg-white p-6 rounded-2xl border border-gray-200">
          <h2 className="text-xl font-bold text-[#0D47A1] mb-4">Aktivitas Teks Terbaru</h2>
          {textActivities.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {textActivities.map((item) => (
                <li key={item.id} className="py-3 flex items-center justify-between">
                  <span className="text-gray-700">{item.type}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(item.date).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Belum ada aktivitas teks.</p>
          )}
        </div>
      )}

      {shareProject && (
        <ShareModal
          isOpen={!!shareProject}
          onClose={() => setShareProject(null)}
          project={shareProject}
        />
      )}
    </div>
  );
};

export default GalleryPage;

