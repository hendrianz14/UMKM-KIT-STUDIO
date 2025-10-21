import React from 'react';

export type Plan = 'Gratis' | 'Basic' | 'Pro' | 'Enterprise';

interface ActiveCreditCardProps {
  plan: Plan;
  credits: number;
  expiryDate: string;
}

const planStyles: Record<Plan, { container: string; badge: string; title: string; credits: string; expiry: string; border: string; }> = {
  Gratis: {
    container: 'bg-white',
    badge: 'bg-[#1565C0] text-white',
    title: 'text-[#1565C0]',
    credits: 'text-[#0D47A1]',
    expiry: 'text-[#1565C0]',
    border: 'border-gray-200'
  },
  Basic: {
    container: 'bg-gradient-to-br from-blue-400 to-blue-600 text-white',
    badge: 'bg-white/20 text-white backdrop-blur-sm',
    title: 'text-white/80',
    credits: 'text-white',
    expiry: 'text-white/80',
    border: 'border-t-white/20'
  },
  Pro: {
    container: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white relative overflow-hidden',
    badge: 'bg-white/20 text-white backdrop-blur-sm',
    title: 'text-white/80',
    credits: 'text-white',
    expiry: 'text-white/80',
    border: 'border-t-white/20'
  },
  Enterprise: {
    container: 'bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white border-2 border-amber-400 shadow-lg shadow-amber-500/20 relative overflow-hidden',
    badge: 'bg-amber-400/20 text-amber-300 backdrop-blur-sm border border-amber-400/50',
    title: 'text-gray-300',
    credits: 'text-amber-300',
    expiry: 'text-gray-400',
    border: 'border-t-amber-400/30'
  },
};

const GlowEffect: React.FC<{ plan: Plan }> = ({ plan }) => {
  switch (plan) {
    case 'Pro':
      return <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-radial from-white/20 via-white/5 to-transparent animate-spin-slow" />;
    case 'Enterprise':
      return <div className="absolute top-0 left-0 w-full h-full animate-shimmer bg-[linear-gradient(110deg,#000103,45%,#ffffff20,55%,#000103)] bg-[length:200%_100%]" />;
    default:
      return null;
  }
};

const ActiveCreditCard: React.FC<ActiveCreditCardProps> = ({ plan, credits, expiryDate }) => {
  const styles = planStyles[plan];

  return (
    <div className={`rounded-2xl shadow-sm flex flex-col overflow-hidden ${styles.container}`}>
      <GlowEffect plan={plan} />
      <div className="p-6 flex-grow relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <p className={`text-base ${styles.title}`}>Kredit aktif</p>
            <p className={`text-5xl font-bold mt-2 ${styles.credits}`}>{credits}</p>
          </div>
          <div className={`text-center py-2 px-4 rounded-lg ${styles.badge}`}>
            <p className="font-semibold text-sm">Paket {plan}</p>
          </div>
        </div>
      </div>
      {plan !== 'Gratis' && (
        <div className={`w-full text-center py-3 px-6 border-t relative z-10 ${styles.border}`}>
          <p className={`text-xs ${styles.expiry}`}>Kedaluwarsa pada {expiryDate}</p>
        </div>
      )}
    </div>
  );
};

export default ActiveCreditCard;