"use server";

import crypto from "crypto";
import { getFirebaseBucket } from "./firebase-admin";

type UploadParams = {
  dataUrl: string;
  userId: string;
};

export type UploadedImageInfo = {
  publicUrl: string;
  storagePath: string;
  contentType: string;
};

function parseDataUrl(dataUrl: string): { buffer: Buffer; mimeType: string } {
  const match = dataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!match) {
    throw new Error("Invalid image data supplied. Expected a base64 data URL.");
  }

  const mimeType = match[1];
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, "base64");

  if (!buffer.length) {
    throw new Error("Image payload is empty.");
  }

  return { buffer, mimeType };
}

function buildObjectPath(userId: string, extension: string) {
  const safeExtension = extension.replace(/[^a-z0-9]/gi, "").toLowerCase() || "png";
  const uniqueId = crypto.randomUUID();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `projects/${userId}/${timestamp}-${uniqueId}.${safeExtension}`;
}

export async function uploadProjectImage({ dataUrl, userId }: UploadParams): Promise<UploadedImageInfo> {
  const { buffer, mimeType } = parseDataUrl(dataUrl);
  const extension = mimeType.split("/")[1] ?? "png";
  const storagePath = buildObjectPath(userId, extension);

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

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(storagePath)}`;

  return {
    publicUrl,
    storagePath,
    contentType: mimeType,
  };
}
