'use client';

const ID_LOCALE = "id-ID";

export function formatCurrency(amount: number, currency = "IDR"): string {
  if (!Number.isFinite(amount)) {
    return "Rp 0";
  }

  return new Intl.NumberFormat(ID_LOCALE, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" ? 0 : 2,
  }).format(amount);
}

export function formatPriceRange(min: number, max: number, currency = "IDR"): string {
  if (!Number.isFinite(min)) {
    return formatCurrency(max, currency);
  }
  if (!Number.isFinite(max)) {
    return formatCurrency(min, currency);
  }
  if (min === max) {
    return formatCurrency(min, currency);
  }
  return `${formatCurrency(min, currency)} - ${formatCurrency(max, currency)}`;
}

export function truncate(text: string, length = 120): string {
  if (!text) {
    return "";
  }
  if (text.length <= length) {
    return text;
  }
  return `${text.slice(0, length - 1)}…`;
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const normalizedNumber = phone.replace(/[^0-9]/g, "");
  const base = normalizedNumber.startsWith("62")
    ? normalizedNumber
    : normalizedNumber.startsWith("0")
    ? `62${normalizedNumber.slice(1)}`
    : `62${normalizedNumber}`;
  const query = new URLSearchParams({ text: message }).toString();
  return `https://wa.me/${base}?${query}`;
}

export function isClient(): boolean {
  return typeof window !== "undefined";
}
