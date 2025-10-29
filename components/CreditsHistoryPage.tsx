"use client";

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { formatDateID } from '@/lib/format';

const CreditsHistoryPage: React.FC = () => {
  const { creditHistory } = useAppContext();

  return (
    <div className="max-w-7xl mx-auto py-8 animate-fadeInUp">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-[#0D47A1]">Riwayat Credits</h1>
        <p className="text-[#1565C0] mt-2">Daftar penggunaan dan perubahan kredit Anda.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        {creditHistory && creditHistory.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {creditHistory.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold text-gray-800">{item.type}</p>
                  <p className="text-sm text-gray-500">{formatDateID(item.date)}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${item.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.amount > 0 ? `+${item.amount.toLocaleString()}` : item.amount.toLocaleString()}
                  </p>
                  {item.transactionId && (
                    <p className="text-xs text-gray-400">Transaksi #{item.transactionId}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">Belum ada riwayat kredit.</div>
        )}
      </div>
    </div>
  );
};

export default CreditsHistoryPage;

