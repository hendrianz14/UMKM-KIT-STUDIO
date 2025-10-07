import { NextResponse } from 'next/server';
import { getDashboardData } from '@/lib/data';

export async function GET() {
  try {
    const data = await getDashboardData();
    if (!data) {
      return NextResponse.json({ message: 'Tidak terautentikasi' }, { status: 401 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to bootstrap app data:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}