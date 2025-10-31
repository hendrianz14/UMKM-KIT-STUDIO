import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type Cached = {
  expiresAt: number;
  payload: any;
} | null;

let CACHE: Cached = null;
const TTL_MS = 60 * 1000; // 1 minute

export async function GET() {
  const apiKey = process.env.TRIPAY_API_KEY;
  const baseUrl = process.env.TRIPAY_BASE_URL || 'https://tripay.co.id/api-sandbox';

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Tripay is not configured. Set TRIPAY_API_KEY and TRIPAY_BASE_URL.' },
      { status: 400 },
    );
  }

  // Serve from cache if fresh
  const now = Date.now();
  if (CACHE && CACHE.expiresAt > now) {
    return NextResponse.json(CACHE.payload);
  }

  try {
    const resp = await fetch(`${baseUrl}/merchant/payment-channel`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: 'no-store',
    });
    const json = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return NextResponse.json({ error: 'Failed to fetch channels', details: json }, { status: 400 });
    }
    const raw = (json && (json.data || [])) as any[];
    const channels = raw
      .filter((c) => c && c.active)
      .map((c) => ({
        code: String(c.code),
        name: String(c.name),
        group: String(c.group),
        type: String(c.type),
        icon_url: String(c.icon_url || ''),
        minimum_amount: Number(c.minimum_amount || 0),
        maximum_amount: Number(c.maximum_amount || 0),
        fee_merchant: {
          flat: Number(c?.fee_merchant?.flat || 0),
          percent: Number(c?.fee_merchant?.percent || 0),
        },
        fee_customer: {
          flat: Number(c?.fee_customer?.flat || 0),
          percent: Number(c?.fee_customer?.percent || 0),
        },
      }));

    const payload = { channels };
    CACHE = { payload, expiresAt: now + TTL_MS };
    return NextResponse.json(payload, { headers: { 'Cache-Control': 'private, max-age=60' } });
  } catch (err) {
    return NextResponse.json({ error: 'Unexpected error', details: String(err) }, { status: 500 });
  }
}
