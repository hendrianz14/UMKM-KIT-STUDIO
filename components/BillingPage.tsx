"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { createClient } from "@/lib/supabaseClient";
import { formatDateID } from "@/lib/format";
import Alert from "@/components/ui/Alert";
import Portal from "@/components/ui/Portal";

type SubscriptionRow = {
  plan_name: string | null;
  status: string | null;
  expires_at: string | null;
  user_id?: string;
  created_at?: string | null;
};

type TransactionRow = {
  id?: string | number;
  user_id?: string;
  created_at: string | null;
  plan: string | null;
  amount: number | null;
  status: string | null; // PAID | PENDING | EXPIRED
};

type CurrentPlan = {
  name: string;
  status: "active" | "pending" | "expired" | "none";
  expires_at: string | null;
};

type Channel = {
  code: string;
  name: string;
  group: string;
  type: string;
  icon_url?: string;
  minimum_amount?: number;
  maximum_amount?: number;
  fee_merchant?: { flat: number; percent: number };
  fee_customer?: { flat: number; percent: number };
};

const StatusBadge = ({
  status,
  label,
}: {
  status: "active" | "pending" | "expired" | "none";
  label?: string;
}) => {
  const classes =
    status === "active"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : status === "pending"
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : status === "expired"
      ? "bg-gray-100 text-gray-600 border-gray-200"
      : "bg-gray-50 text-gray-500 border-gray-200";
  const text =
    label ??
    (status === "active"
      ? "Aktif"
      : status === "pending"
      ? "Menunggu Pembayaran"
      : status === "expired"
      ? "Sudah Berakhir"
      : "Tidak Ada");
  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${classes}`}>
      {text}
    </span>
  );
};

const PriceCard = ({
  title,
  price,
  period,
  description,
  featured,
  onSubscribe,
  disabled,
}: {
  title: string;
  price: string;
  period: string;
  description: string;
  featured?: boolean;
  onSubscribe: () => void;
  disabled?: boolean;
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border ${
        featured ? "border-blue-300 shadow-blue-100" : "border-gray-200"
      } shadow-sm p-6 flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-0.5`}
    >
      <div>
        <div className="flex items-center justify-between">
          <h3 className={`text-xl font-bold ${featured ? "text-[#0D47A1]" : "text-gray-900"}`}>{title}</h3>
          {featured && <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-[#1565C0] border border-blue-200">Rekomendasi</span>}
        </div>
        <div className="mt-4">
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-extrabold text-gray-900">{price}</span>
            <span className="text-sm text-gray-500">/{period}</span>
          </div>
          <p className="text-gray-600 mt-2">{description}</p>
        </div>
      </div>

      <button
        onClick={onSubscribe}
        disabled={disabled}
        className={`mt-6 w-full inline-flex items-center justify-center px-4 py-2 rounded-xl border text-[#1565C0] bg-white hover:bg-blue-50 hover:border-[#1565C0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        Langganan Sekarang
      </button>
    </div>
  );
};

export default function BillingPage() {
  const { user } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan>({ name: "Gratis", status: "none", expires_at: null });
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showMethodPicker, setShowMethodPicker] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const pricingRef = useRef<HTMLDivElement | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // Subscriptions: ambil yang terbaru
      const { data: subs, error: subsErr } = await supabase
        .from<SubscriptionRow>("subscriptions")
        .select("plan_name, status, expires_at, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (subsErr) {
        // Tidak fatal: fallback ke profile data
        // console.warn("Subscriptions fetch error:", subsErr.message);
      }

      const latest = subs && subs.length > 0 ? subs[0] : null;

      // Fallback dari context user untuk plan & expiry kalau subscriptions kosong
      const normalizedPlanName = latest?.plan_name ?? (user.plan as any) ?? "Gratis";
      const normalizedExpiry = latest?.expires_at ?? user.expiryDate ?? null;
      const normalizedStatusRaw = (latest?.status ?? "").toLowerCase();
      const planLower = String(normalizedPlanName || '').toLowerCase();
      const isFreeLike = planLower === 'free' || planLower === 'gratis';
      const derivedStatus: CurrentPlan["status"] = normalizedStatusRaw === "active"
        ? "active"
        : normalizedStatusRaw === "pending"
        ? "pending"
        : normalizedStatusRaw === "expired"
        ? "expired"
        : normalizedPlanName && !isFreeLike
        ? "active"
        : "none";

      setCurrentPlan({
        name: normalizedPlanName,
        status: derivedStatus,
        expires_at: normalizedExpiry,
      });

      // Transactions history
      const { data: txs, error: txErr } = await supabase
        .from<TransactionRow>("transactions")
        .select("id, created_at, plan, amount, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (txErr) {
        // Tidak fatal
        setTransactions([]);
      } else {
        setTransactions(txs ?? []);
      }

      // Load Tripay channels
      try {
        const r = await fetch('/api/tripay/channels', { cache: 'no-store' });
        if (r.ok) {
          const j = await r.json();
          const list: Channel[] = j.channels || [];
          setChannels(list);
          // default selection: TRIPAY_DEFAULT_METHOD or QRIS2 or first
          const envDefault = process.env.NEXT_PUBLIC_TRIPAY_DEFAULT_METHOD as string | undefined;
          const found = envDefault && list.find((c) => c.code === envDefault);
          setSelectedMethod((found?.code) || (list.find((c) => c.code === 'QRIS2')?.code) || (list[0]?.code ?? null));
        } else {
          setChannels([]);
          setSelectedMethod(null);
        }
      } catch {
        setChannels([]);
        setSelectedMethod(null);
      }
    } catch (e: any) {
      setError(e?.message ?? "Gagal memuat data billing");
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    if (user) void fetchData();
  }, [user, fetchData]);

  const handleUpgradeScroll = useCallback(() => {
    if (pricingRef.current) {
      pricingRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleCheckout = useCallback(async (plan: string) => {
    try {
      setError(null);
      // Validate amount against channel limits
      const PLAN_AMOUNTS: Record<string, number> = { Basic: 49900, Pro: 139000, Gratis: 0 };
      const amount = PLAN_AMOUNTS[plan] ?? 0;
      const ch = channels.find((c) => c.code === selectedMethod);
      if (ch) {
        const minOk = !ch.minimum_amount || amount >= ch.minimum_amount;
        const maxOk = !ch.maximum_amount || amount <= ch.maximum_amount;
        if (!minOk || !maxOk) {
          const minText = ch.minimum_amount ? `min Rp${ch.minimum_amount.toLocaleString('id-ID')}` : '';
          const maxText = ch.maximum_amount ? `max Rp${ch.maximum_amount.toLocaleString('id-ID')}` : '';
          const range = [minText, maxText].filter(Boolean).join(', ');
          throw new Error(`Nominal paket tidak sesuai batas kanal ${ch.name} (${range}). Pilih kanal lain atau paket lain.`);
        }
      }
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, method: selectedMethod || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Gagal membuat transaksi checkout.");
      }
      const url = data?.payment_url || data?.paymentUrl || data?.redirect_url;
      if (typeof url === "string" && url.length > 0) {
        window.location.href = url;
        return;
      }
      throw new Error("URL pembayaran tidak tersedia.");
    } catch (e: any) {
      setError(e?.message ?? "Gagal memproses checkout.");
    }
  }, [selectedMethod, channels]);

  const openMethodPicker = useCallback((plan: string) => {
    setPendingPlan(plan);
    // Ensure a default method is selected when opening
    if (!selectedMethod && channels.length > 0) {
      const envDefault = (process.env.NEXT_PUBLIC_TRIPAY_DEFAULT_METHOD as string | undefined) || undefined;
      const found = envDefault && channels.find((c) => c.code === envDefault);
      setSelectedMethod((found?.code) || (channels.find((c) => c.code === 'QRIS2')?.code) || channels[0].code);
    }
    setShowMethodPicker(true);
  }, [channels, selectedMethod]);

  // Lock body scroll when modal open
  useEffect(() => {
    if (showMethodPicker && typeof document !== 'undefined') {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return;
  }, [showMethodPicker]);

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <Alert variant="info" message="Silakan masuk untuk mengakses halaman Billing." />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 animate-fadeInUp">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-[#0D47A1] flex items-center gap-2">
          <span role="img" aria-label="kartu">💳</span>
          Billing & Langganan Kamu
        </h1>
        <p className="text-[#1565C0] mt-2">Kelola paket langganan dan histori pembayaran di sini.</p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-6 w-40 bg-gray-200 rounded mb-3" />
            <div className="h-4 w-64 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-56 bg-gray-200 rounded" />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              {currentPlan.status === "none" ? (
                <>
                  <p className="text-gray-800 font-semibold">Kamu belum memiliki langganan aktif.</p>
                  <p className="text-gray-500 text-sm">Pilih paket untuk mulai menggunakan fitur premium.</p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-gray-900">Paket {(() => {
                      const name = currentPlan.name || '';
                      if (name === 'Free') return 'Gratis';
                      if (name === 'Business') return 'Enterprise';
                      return name;
                    })()}</h3>
                    <StatusBadge status={currentPlan.status} label={
                      currentPlan.status === "active" && currentPlan.expires_at
                        ? `Aktif sampai ${formatDateID(currentPlan.expires_at)}`
                        : undefined
                    } />
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {currentPlan.expires_at ? (
                      <>Kedaluwarsa: {formatDateID(currentPlan.expires_at)}</>
                    ) : (
                      <>Tidak ada tanggal kedaluwarsa</>
                    )}
                  </div>
                </>
              )}
            </div>
            <div>
              <button
                onClick={handleUpgradeScroll}
                className="inline-flex items-center px-4 py-2 rounded-xl border border-blue-300 text-[#1565C0] bg-white hover:bg-blue-50 hover:border-[#1565C0] transition-colors shadow-sm"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Metode Pembayaran (Tripay) */}
      {/* Pricing */}
      <div ref={pricingRef} className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pilih Paket</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PriceCard
            title="Gratis"
            price="Rp0"
            period="bulan"
            description="Akses fitur dasar."
            onSubscribe={() => handleCheckout("Gratis")}
            disabled={true}
          />
          <PriceCard
            title="Basic"
            price="Rp49.900"
            period="30 hari"
            description="Generate gambar & caption tanpa watermark."
            onSubscribe={() => openMethodPicker("Basic")}
            featured
          />
          <PriceCard
            title="Pro"
            price="Rp139.000"
            period="30 hari"
            description="Semua fitur Pro + template eksklusif."
            onSubscribe={() => openMethodPicker("Pro")}
          />
        </div>
        {error && (
          <div className="mt-4">
            <Alert variant="error" message={error} />
          </div>
        )}
      </div>

      {/* Method Picker Modal */}
      {showMethodPicker && (
        <Portal>
          <div className="fixed inset-0 z-[10000] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 z-0" onClick={() => setShowMethodPicker(false)} />
            <div className="relative z-10 bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-xl p-6 mx-4 sm:mx-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Pilih Metode Pembayaran</h3>
                <button onClick={() => setShowMethodPicker(false)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {channels.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setSelectedMethod(c.code)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${selectedMethod === c.code ? 'border-[#1565C0] bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  title={`${c.name} • ${c.group}`}
                >
                  <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center overflow-hidden">
                    {c.icon_url ? (
                      <img src={c.icon_url} alt={c.name} className="w-8 h-8 object-contain" />
                    ) : (
                      <span className="w-8 h-8" />
                    )}
                  </span>
                  <span className="text-sm font-medium text-gray-800">{c.name}</span>
                </button>
              ))}
            </div>
            {selectedMethod && (() => {
              const c = channels.find((x) => x.code === selectedMethod);
              if (!c) return null;
              const fm = c.fee_merchant || { flat: 0, percent: 0 };
              const fc = c.fee_customer || { flat: 0, percent: 0 };
              return (
                <div className="mt-4 text-xs text-gray-600 bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <div className="flex flex-wrap gap-4">
                    <span><span className="font-medium">Biaya Merchant:</span> Rp{fm.flat.toLocaleString('id-ID')} + {fm.percent}%</span>
                    <span><span className="font-medium">Biaya Customer:</span> Rp{fc.flat.toLocaleString('id-ID')} + {fc.percent}%</span>
                    {(c.minimum_amount || c.maximum_amount) && (
                      <span>
                        <span className="font-medium">Batas Nominal:</span>
                        {c.minimum_amount ? ` min Rp${c.minimum_amount.toLocaleString('id-ID')}` : ''}
                        {c.maximum_amount ? `, max Rp${c.maximum_amount.toLocaleString('id-ID')}` : ''}
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowMethodPicker(false)} className="px-4 py-2 rounded-xl border bg-white text-gray-700 hover:bg-gray-50">Batal</button>
              <button
                onClick={() => {
                  if (!pendingPlan) return;
                  void handleCheckout(pendingPlan);
                  setShowMethodPicker(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#0D47A1] text-white hover:opacity-95"
              >
                Lanjutkan Pembayaran
              </button>
            </div>
            </div>
          </div>
        </Portal>
      )}

      {/* History */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Riwayat Pembayaran</h2>
        <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm overflow-x-auto">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-5 bg-gray-200 rounded" />
              <div className="h-5 bg-gray-200 rounded" />
              <div className="h-5 bg-gray-200 rounded" />
            </div>
          ) : transactions.length > 0 ? (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 pr-4">Tanggal</th>
                  <th className="py-2 pr-4">Plan</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((t, idx) => {
                  const stat = (t.status || "").toUpperCase();
                  const badgeClass =
                    stat === "PAID"
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : stat === "PENDING"
                      ? "bg-amber-100 text-amber-700 border-amber-200"
                      : "bg-gray-100 text-gray-600 border-gray-200";
                  return (
                    <tr key={(t.id ?? idx).toString()} className="text-gray-800">
                      <td className="py-3 pr-4 whitespace-nowrap">{formatDateID(t.created_at ?? undefined)}</td>
                      <td className="py-3 pr-4">{(() => {
                        const name = t.plan ?? '-';
                        if (name === 'Free') return 'Gratis';
                        if (name === 'Business') return 'Enterprise';
                        return name;
                      })()}</td>
                      <td className="py-3 pr-4">{typeof t.amount === "number" ? `Rp${t.amount.toLocaleString("id-ID")}` : "-"}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border ${badgeClass}`}>
                          {stat || "-"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center text-gray-500">Belum ada transaksi.</div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="text-gray-600 text-sm flex items-center gap-2">
        <span role="img" aria-label="repeat">🔁</span>
        Langganan aktif kamu akan otomatis berakhir saat masa berlaku habis. Kamu bisa perpanjang kapan saja.
      </div>
    </div>
  );
}
