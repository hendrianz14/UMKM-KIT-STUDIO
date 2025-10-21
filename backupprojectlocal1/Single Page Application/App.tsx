import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ActiveCreditCard, { Plan } from './components/ActiveCreditCard';
import ProjectCard from './components/ProjectCard';
import ShareModal from './components/ShareModal';
import GenerateImagePage from './components/GenerateImagePage';
import SettingsPage from './components/SettingsPage';

interface User {
  name: string;
  email: string;
  plan: string;
  credits: number;
  expiryDate: string;
}

interface DashboardStatsData {
  weeklyWork: number;
  totalCreditsUsed: number;
}

export interface Project {
  id: number;
  title: string;
  imageUrl: string;
  caption: string;
  aspectRatio: string;
  promptDetails?: string;
  type: 'image' | 'caption' | 'video';
  promptFull?: string;
}

interface CreditHistoryItem {
  id: number;
  type: string;
  date: string;
  amount: number;
  transactionId: number;
}

interface AppData {
  user: User;
  dashboardStats: DashboardStatsData;
  projects: Project[];
  creditHistory: CreditHistoryItem[];
}

const DashboardStats: React.FC<{ stats: DashboardStatsData; user: User }> = ({ stats, user }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
    {/* Active Plan Card */}
    <ActiveCreditCard plan={user.plan as Plan} credits={user.credits} expiryDate={user.expiryDate} />

    {/* Weekly Work Card */}
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
      <div>
        <p className="text-[#1565C0] text-base">Pekerjaan minggu ini :</p>
        <p className="text-[#0D47A1] text-5xl font-bold mt-4">{stats.weeklyWork}</p>
      </div>
      <p className="text-gray-500 text-sm mt-4">Ringkasan otomatis dari pekerjaan AI anda.</p>
    </div>

    {/* Total Credits Used Card */}
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

const DashboardPage: React.FC<{ data: AppData; onShareClick: (project: Project) => void; }> = ({ data, onShareClick }) => (
  <div className="max-w-7xl mx-auto p-8 animate-fadeInUp">
    <h1 className="text-4xl font-bold text-[#0D47A1]">Dashboard AI Anda</h1>
    <p className="text-[#1565C0] mt-2 mb-8">Pantau penggunaan kredit, kelola project dan pekerjaan AI anda.</p>
    
    <DashboardStats stats={data.dashboardStats} user={data.user} />
    <ProjectsSection projects={data.projects} onShareClick={onShareClick} />
    <CreditsHistory history={data.creditHistory} />
    <Footer />
  </div>
);

export type Page = 'dashboard' | 'generate-image' | 'settings';

export default function App() {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [projectToShare, setProjectToShare] = useState<Project | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  useEffect(() => {
    fetch('./data.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setAppData(data);
      })
      .catch(error => {
        console.error('Failed to fetch app data:', error);
        setError('Gagal memuat data aplikasi.');
      });
  }, []);

  const handleShareClick = (project: Project) => {
    setProjectToShare(project);
  };
  
  const handleSaveProject = (newProject: Project) => {
    setAppData(prevData => {
        if (!prevData) return null;
        return {
            ...prevData,
            projects: [newProject, ...prevData.projects],
        };
    });
  };

  const handleCreditDeduction = (amount: number) => {
    setAppData(prevData => {
      if (!prevData) return null;
      
      const newCredits = Math.max(0, prevData.user.credits - amount);
      const newTotalCreditsUsed = prevData.dashboardStats.totalCreditsUsed + amount;

      console.log(`[CREDIT] Deducting ${amount}. Old: ${prevData.user.credits}, New: ${newCredits}`);

      return {
        ...prevData,
        user: {
          ...prevData.user,
          credits: newCredits,
        },
        dashboardStats: {
            ...prevData.dashboardStats,
            totalCreditsUsed: newTotalCreditsUsed,
        },
        creditHistory: [
            {
                id: Date.now(),
                type: 'Credit Usage',
                date: new Date().toLocaleString(),
                amount: -amount,
                transactionId: Math.floor(Math.random() * 1000000),
            },
            ...prevData.creditHistory,
        ]
      };
    });
  };

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
  }

  if (!appData) {
    return <div className="flex items-center justify-center min-h-screen text-[#0D47A1]">Memuat data...</div>;
  }
  
  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage data={appData} onShareClick={handleShareClick} />;
      case 'generate-image':
        return (
          <GenerateImagePage 
              onSaveProject={handleSaveProject}
              onNavigate={(page) => setCurrentPage(page)}
              onCreditDeduction={handleCreditDeduction}
              userCredits={appData.user.credits}
          />
        );
      case 'settings':
        return <SettingsPage onNavigate={(page) => setCurrentPage(page)} />;
      default:
        return <DashboardPage data={appData} onShareClick={handleShareClick} />;
    }
  }

  return (
    <Layout 
      user={appData.user} 
      currentPage={currentPage}
      onNavigate={(page) => setCurrentPage(page)}
    >
      {renderContent()}
      {projectToShare && (
        <ShareModal 
          isOpen={!!projectToShare} 
          onClose={() => setProjectToShare(null)} 
          project={projectToShare} 
        />
      )}
    </Layout>
  );
}