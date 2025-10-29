"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import ShareModal from './share-modal';
import type { Project } from '@/lib/types';
import ImageCard from './gallery/ImageCard';
import TextCard from './gallery/TextCard';
import ProjectCard from './project-card';

type TabKey = 'images' | 'texts' | 'projects';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'images', label: 'Gambar' },
  { key: 'texts', label: 'Teks' },
  { key: 'projects', label: 'Project' },
];

const GalleryPage: React.FC = () => {
  const { projects } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabKey>('images');
  const [shareProject, setShareProject] = useState<Project | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>(projects || []);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [trueCounts, setTrueCounts] = useState<{ images: number; texts: number; projects: number } | null>(null);

  const [page, setPage] = useState(0);
  const pageSize = 5;
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async (p: number) => {
      try {
        setLoading(true);
        setLoadError(null);
        const offset = p * pageSize;
        const res = await fetch(`/api/projects?limit=${pageSize}&offset=${offset}&counts=1`, { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(typeof data?.error === 'string' ? data.error : 'Gagal memuat data galeri');
        }
        const rawItems: any[] = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
        const normalized: Project[] = rawItems.map((d: any) => ({
          id: Number(d.id),
          title: d.title,
          type: String(d.type ?? ''),
          imageUrl: d.imageUrl ?? null,
          imageStoragePath: d.imageStoragePath ?? null,
          caption: d.caption ?? null,
          aspectRatio: d.aspectRatio ?? null,
          promptDetails: d.promptDetails ?? null,
          promptFull: d.promptFull ?? null,
          user_id: d.userId,
          created_at: d.createdAt,
        }));
        if (!cancelled) {
          setAllProjects(prev => p === 0 ? normalized : [...prev, ...normalized]);
          setHasMore(Boolean((Array.isArray(data.items) ? data.hasMore : normalized.length === pageSize)));
          if (data && data.counts && typeof data.counts === 'object') {
            setTrueCounts({ images: Number(data.counts.images || 0), texts: Number(data.counts.texts || 0), projects: Number(data.counts.projects || 0) });
          }
        }
      } catch (e: unknown) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Gagal memuat data galeri');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load(page);
    return () => { cancelled = true; };
  }, [page]);

  const imageItems = useMemo(
    () => allProjects.filter((p) => Boolean(p.imageUrl) && (!p.caption || p.caption.trim() === '')),
    [allProjects]
  );

  const textItems = useMemo(
    () => allProjects.filter((p) => !p.imageUrl && (Boolean(p.caption) || /caption|text/i.test(p.type))),
    [allProjects]
  );

  const projectItems = useMemo(
    () => allProjects.filter((p) => Boolean(p.imageUrl) && Boolean(p.caption) && p.caption!.trim() !== ''),
    [allProjects]
  );

  const displayed = useMemo(() => {
    switch (activeTab) {
      case 'images':
        return { images: imageItems, texts: [] as Project[], projects: [] as Project[] };
      case 'texts':
        return { images: [] as Project[], texts: textItems, projects: [] as Project[] };
      case 'projects':
      default:
        return { images: [] as Project[], texts: [] as Project[], projects: projectItems };
    }
  }, [activeTab, imageItems, textItems, projectItems]);

  const isEmpty =
    displayed.images.length === 0 &&
    displayed.texts.length === 0 &&
    displayed.projects.length === 0;

  const counts = useMemo(() => ({
    images: trueCounts?.images ?? imageItems.length,
    texts: trueCounts?.texts ?? textItems.length,
    projects: trueCounts?.projects ?? projectItems.length,
  }), [trueCounts, imageItems.length, textItems.length, projectItems.length]);

  return (
    <div className="max-w-7xl mx-auto py-8 animate-fadeInUp">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-[#0D47A1]">Galeri</h1>
        <p className="text-[#1565C0] mt-2">Koleksi hasil generate dan project Anda.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => {
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                active ? 'bg-[#0D47A1] text-white border-[#0D47A1]' : 'bg-white text-[#1565C0] border-[#1565C0] hover:bg-blue-50'
              }`}
            >
              <span>{t.label}</span>
              <span className={`inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-xs font-bold ${
                active ? 'bg-white text-[#0D47A1]' : 'bg-[#1565C0] text-white'
              }`}>
                {counts[t.key]}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center text-gray-500 bg-white p-12 rounded-2xl border border-gray-200">Memuat galeri...</div>
      ) : loadError ? (
        <div className="text-center text-red-600 bg-white p-12 rounded-2xl border border-red-200">{loadError}</div>
      ) : isEmpty ? (
        <div className="text-center text-gray-500 bg-white p-12 rounded-2xl border border-gray-200">
          Belum ada item pada kategori ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {displayed.images.map((p) => (
            <ImageCard key={"img-" + p.id} project={p} onShareClick={setShareProject} />
          ))}
          {displayed.texts.map((p) => (
            <TextCard key={"txt-" + p.id} project={p} onShareClick={setShareProject} />
          ))}
          {displayed.projects.map((p) => (
            <ProjectCard key={"prj-" + p.id} project={p} onShareClick={(proj) => setShareProject(proj)} />
          ))}
        </div>
      )}

      {/* Load more */}
      {!loading && !loadError && hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-6 py-2 text-sm font-semibold bg-white border border-gray-300 rounded-full text-[#0D47A1] hover:bg-gray-50"
          >
            Muat lebih
          </button>
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
