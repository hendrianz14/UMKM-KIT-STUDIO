"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function BillingSuccessPage() {
  const router = useRouter();
  return (
    <div className="max-w-2xl mx-auto p-6 animate-fadeInUp">
      <div className="bg-white rounded-2xl border border-gray-200 p-10 shadow-sm text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#0D47A1]">Pembayaran Berhasil!</h1>
        <p className="text-[#1565C0] mt-2">
          Langganan kamu sudah aktif. Terima kasih sudah berlangganan UMKM KitStudio.
        </p>

        <button
          onClick={() => router.push("/dashboard")}
          className="mt-8 inline-flex items-center px-6 py-3 rounded-xl bg-[#0D47A1] text-white shadow-sm hover:shadow-md transition-all"
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
}

