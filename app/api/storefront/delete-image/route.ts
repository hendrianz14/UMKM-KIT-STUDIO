import { NextRequest, NextResponse } from "next/server";
import { getFirebaseBucket } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { storagePath } = await request.json();

    if (!storagePath || typeof storagePath !== "string") {
      return NextResponse.json({ error: "storagePath is required" }, { status: 400 });
    }

    const bucket = getFirebaseBucket();
    const file = bucket.file(storagePath);

    await file.delete({ ignoreNotFound: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("storefront delete image failed", error);
    return NextResponse.json({ error: "Gagal menghapus gambar." }, { status: 500 });
  }
}
