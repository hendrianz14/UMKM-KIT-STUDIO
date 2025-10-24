import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClientWritable } from '@/utils/supabase/server';

type EventType = 'store_view' | 'product_view' | 'wa_click';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      type: EventType;
      storeId: string;
      productId?: string;
      source?: 'product' | 'cart';
    };

    if (!body || !body.type || !body.storeId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const supabase = await createSupabaseServerClientWritable();
    const userAgent = request.headers.get('user-agent') ?? null;
    const forwardedFor = request.headers.get('x-forwarded-for') ?? null;

    // Skip obvious bots/crawlers to keep counts clean
    const ua = (userAgent || '').toLowerCase();
    const isBot =
      ua.includes('bot') ||
      ua.includes('crawler') ||
      ua.includes('spider') ||
      ua.includes('facebookexternalhit') ||
      ua.includes('preview');
    if (isBot) {
      return NextResponse.json({ ok: true });
    }

    // Insert a simple event row. Expect the table to exist.
    const { error } = await supabase.from('analytics_events').insert({
      store_id: body.storeId,
      product_id: body.productId ?? null,
      event_type: body.type,
      source: body.source ?? null,
      user_agent: userAgent,
      ip_hint: forwardedFor,
    });

    if (error) {
      // Do not leak DB error details to clients
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
