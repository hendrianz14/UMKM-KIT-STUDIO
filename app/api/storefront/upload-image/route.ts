import { NextRequest, NextResponse } from "next/server";
import { getFirebaseBucket } from "@/lib/firebase-admin";

function parseDataUrl(dataUrl: string): { buffer: Buffer; mimeType: string } {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid data URL payload.");
  }

  const mimeType = match[1]!;
  const base64 = match[2]!;
  const buffer = Buffer.from(base64, "base64");

  if (!buffer.length) {
    throw new Error("Image data is empty.");
  }

  return { buffer, mimeType };
}

export async function POST(request: NextRequest) {
  try {
    const { dataUrl, storeId, fileName } = await request.json();

    if (!dataUrl || typeof dataUrl !== "string") {
      return NextResponse.json({ error: "dataUrl is required" }, { status: 400 });
    }

    if (!storeId || typeof storeId !== "string") {
      return NextResponse.json({ error: "storeId is required" }, { status: 400 });
    }

    const { buffer, mimeType } = parseDataUrl(dataUrl);
    const extension = mimeType.split("/")[1] ?? "jpg";
    const sanitizedName =
      typeof fileName === "string"
        ? fileName.replace(/\.[^.]+$/, "").replace(/[^a-z0-9-_]/gi, "").toLowerCase()
        : "image";

    const timestamp = Date.now();
    const storagePath = `storefronts/${storeId}/${timestamp}-${sanitizedName}.${extension}`;

    const bucket = getFirebaseBucket();
    const file = bucket.file(storagePath);

    await file.save(buffer, {
      resumable: false,
      metadata: {
        contentType: mimeType,
        cacheControl: "public,max-age=31536000,immutable",
      },
    });

    await file.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(
      storagePath,
    )}`;

    return NextResponse.json({ url: publicUrl, storagePath });
  } catch (error) {
    console.error("storefront upload failed", error);
    return NextResponse.json({ error: "Upload gambar gagal." }, { status: 500 });
  }
}
