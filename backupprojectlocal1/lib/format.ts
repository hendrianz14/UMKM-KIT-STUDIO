// lib/format.ts
export function formatDateID(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
    // timeZoneName: "short", // aktifkan kalau mau tampil GMT+7
  }).format(d);
}

// Opsional: relative time (mis. "2 jam lalu")
export function formatRelativeID(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso).getTime();
  const diffSec = Math.round((d - Date.now()) / 1000); // negatif = lampau
  const rtf = new Intl.RelativeTimeFormat("id-ID", { numeric: "auto" });
  const table: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000], ["month", 2592000], ["week", 604800],
    ["day", 86400], ["hour", 3600], ["minute", 60], ["second", 1],
  ];
  for (const [unit, sec] of table) {
    const val = Math.trunc(diffSec / sec);
    if (Math.abs(val) >= 1) return rtf.format(val, unit);
  }
  return rtf.format(0, "second");
}
