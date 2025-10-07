const DEFAULT_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function calculateBase64Size(base64: string): number {
  const padding = (base64.match(/=+$/) || [""])[0].length;
  return Math.ceil((base64.length * 3) / 4) - padding;
}

export const dataUrlToBlob = (
  dataUrl: string,
  options?: { maxSizeBytes?: number }
): { base64Data: string; mimeType: string; sizeBytes: number } => {
  if (!dataUrl?.startsWith("data:")) {
    throw new Error("Invalid data URL");
  }
  const [header, base64Data] = dataUrl.split(",");
  const mimeType = header.match(/data:(.*?);base64/)?.[1];
  if (!mimeType || !base64Data) {
    throw new Error("Invalid data URL");
  }

  const normalizedMime = mimeType.toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(normalizedMime)) {
    throw new Error("Tipe file tidak didukung");
  }

  const sizeBytes = calculateBase64Size(base64Data);
  const maxBytes = options?.maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES;
  if (sizeBytes > maxBytes) {
    throw new Error("Gambar terlalu besar");
  }

  return { base64Data, mimeType: normalizedMime, sizeBytes };
};