// components/dashboard-client.tsx
'use client';

import React, { useState } from 'react';
import ActiveCreditCard from './active-credit-card';
import ProjectCard from './project-card';
import ShareModal from './share-modal';
import { AppData, Project, CreditHistoryItem } from '../lib/types';

const DashboardStats: React.FC<{ stats: AppData['dashboardStats']; user: AppData['user'] }> = ({ stats, user }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
    <ActiveCreditCard plan={user.plan} credits={user.credits} expiryDate={user.expiryDate} />
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
      <div>
        <p className="text-[#1565C0] text-base">Pekerjaan minggu ini :</p>
        <p className="text-[#0D47A1] text-5xl font-bold mt-4">{stats.weeklyWork}</p>
      </div>
      <p className="text-gray-500 text-sm mt-4">Ringkasan otomatis dari pekerjaan AI anda.</p>
    </div>
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
      <div>
        <p className="text-[#1565C0] text-base">Total kredit terpakai :</p>
        <p className="text-[#0D47A1] text-5xl font-bold mt-4">{stats.totalCreditsUsed}</p>
      </div>
      <button className="w-full py-3 mt-4 bg-[#0D47A1] text-white font-bold rounded-xl">
        TOPUP
      </button>
    </div>
  </div>
);

const ProjectCardPlaceholder = () => (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 animate-pulse">
        <div className="w-full aspect-[3/4] bg-gray-200 rounded-lg"></div>
        <div className="mt-4 h-4 w-3/4 bg-gray-200 rounded"></div>
        <div className="flex space-x-2 mt-4">
            <div className="h-6 w-1/2 bg-gray-200 rounded-md"></div>
            <div className="h-6 w-1/3 bg-gray-200 rounded-md"></div>
        </div>
    </div>
);

const ProjectsSection: React.FC<{ projects: Project[]; onShareClick: (project: Project) => void; }> = ({ projects, onShareClick }) => (
  <div className="mb-12">
    <h2 className="text-2xl font-bold text-[#0D47A1] mb-6">Project anda</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {projects && projects.length > 0 ? (
        projects.map(project => <ProjectCard key={project.id} project={project} onShareClick={onShareClick} />)
      ) : (
        <>
          <ProjectCardPlaceholder />
          <ProjectCardPlaceholder />
          <ProjectCardPlaceholder />
        </>
      )}
    </div>
  </div>
);

const CreditsHistory: React.FC<{ history: CreditHistoryItem[] }> = ({ history }) => (
  <div className="mb-12">
    <h2 className="text-2xl font-bold text-[#0D47A1] mb-6">Riwayat Credits</h2>
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      {history.slice(0, 5).map((item) => (
        <div
          key={item.id}
          className="flex justify-between items-center text-gray-800 py-4 border-b border-gray-200 last:border-b-0 -mx-4 px-4"
        >
          <div>
            <p className="font-semibold">{item.type}</p>
            <p className="text-sm text-gray-500">{item.date}</p>
          </div>
          <div>
            <p className={`font-bold ${item.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {item.amount > 0 ? `+${item.amount.toLocaleString()}` : item.amount.toLocaleString()}
            </p>
          </div>
        </div>
      ))}
      <div className="text-center mt-6">
        <button className="text-[#0D47A1] text-sm font-semibold">Lihat semua</button>
      </div>
    </div>
  </div>
);

const Footer = () => (
  <footer className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-6 text-sm text-gray-500 pt-8 border-t border-gray-200">
    <p>© 2025 UMKM KitStudio. Seluruh hak cipta dilindungi.</p>
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <p className="text-[#1565C0] font-medium">Dapatkan tips konten</p>
      <button className="px-5 py-2 bg-[#0D47A1] text-white font-semibold rounded-lg w-full sm:w-auto">
        Langganan
      </button>
    </div>
  </footer>
);

export default function DashboardClient({ initialData }: { initialData: AppData }) {
  const [projectToShare, setProjectToShare] = useState<Project | null>(null);

  const handleShareClick = (project: Project) => {
    setProjectToShare(project);
  };
  
  return (
    <>
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-[#0D47A1]">Dashboard AI Anda</h1>
        <p className="text-[#1565C0] mt-2 mb-8">Pantau penggunaan kredit, kelola project dan pekerjaan AI anda.</p>
        
        <DashboardStats stats={initialData.dashboardStats} user={initialData.user} />
        <ProjectsSection projects={initialData.projects} onShareClick={handleShareClick} />
        <CreditsHistory history={initialData.creditHistory} />
        <Footer />
      </div>

      {projectToShare && (
        <ShareModal 
          isOpen={!!projectToShare} 
          onClose={() => setProjectToShare(null)} 
          project={projectToShare} 
        />
      )}
    </>
  );
}
