import { NextRequest, NextResponse } from 'next/server';
import { uploadProjectImage } from '@/lib/firebase-storage';

export async function POST(req: NextRequest) {
  try {
    const { dataUrl, userId } = await req.json();
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const owner = typeof userId === 'string' && userId.length > 0 ? userId : 'guest';
    const uploaded = await uploadProjectImage({ dataUrl, userId: owner });
    return NextResponse.json(uploaded);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Upload failed' }, { status: 500 });
  }
}

