import { NextResponse } from 'next/server';
import { getDashboardData } from '@/lib/data';

export async function GET() {
  try {
    const appData = await getDashboardData();

    if (!appData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(appData);
  } catch (error) {
    console.error('Bootstrap API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to load dashboard data. ${errorMessage}` }, { status: 500 });
  }
}
