import { NextResponse } from 'next/server';
import { createSupabaseServerClientWritable } from '@/utils/supabase/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

type Body = {
  plan?: string;
  method?: string | null; // optional: Tripay payment method code
};

const PLAN_PRICES: Record<'Free' | 'Basic' | 'Pro' | 'Business', number> = {
  Free: 0,
  Basic: 49900,
  Pro: 139000,
  Business: 249000,
};

function canonicalizePlan(input: string | undefined | null): 'Free' | 'Basic' | 'Pro' | 'Business' | null {
  if (!input) return null;
  const p = String(input).trim().toLowerCase();
  if (p === 'free' || p === 'gratis') return 'Free';
  if (p === 'basic') return 'Basic';
  if (p === 'pro') return 'Pro';
  if (p === 'business' || p === 'enterprise') return 'Business';
  return null;
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClientWritable();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const planCanonical = canonicalizePlan(body.plan);
  if (!planCanonical) {
    return NextResponse.json({ error: 'Invalid or missing plan' }, { status: 400 });
  }

  const amount = PLAN_PRICES[planCanonical];
  if (amount <= 0) {
    // Free plan doesn’t need checkout; send to billing success right away
    return NextResponse.json({ payment_url: '/billing/success' });
  }

  // Create a pending transaction record (best-effort)
  let transactionId: number | string | null = null;
  try {
    const { data: inserted, error } = await supabase
      .from('transactions')
      .insert({ user_id: user.id, plan: planCanonical, amount, status: 'PENDING' })
      .select('id')
      .single();
    if (!error) {
      transactionId = (inserted as any)?.id ?? null;
    }
  } catch {
    // ignore – table may not exist yet
  }

  const apiKey = process.env.TRIPAY_API_KEY;
  const merchantCode = process.env.TRIPAY_MERCHANT_CODE;
  const privateKey = process.env.TRIPAY_PRIVATE_KEY;
  const baseUrl = process.env.TRIPAY_BASE_URL || 'https://tripay.co.id/api-sandbox';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  // If Tripay keys are configured, attempt to create a real transaction
  if (apiKey && merchantCode && privateKey) {
    try {
      const merchant_ref = `UMKM-${user.id}-${Date.now()}`;
      const signature = crypto
        .createHmac('sha256', privateKey)
        .update(merchantCode + merchant_ref + amount)
        .digest('hex');

      const callbackUrl = appUrl ? `${appUrl.replace(/\/$/, '')}/api/tripay/callback` : undefined;
      const payload = {
        method: body.method || process.env.TRIPAY_DEFAULT_METHOD || 'QRIS2',
        merchant_ref,
        amount,
        customer_name: user.user_metadata?.name || user.email || 'UMKM User',
        customer_email: user.email || 'user@example.com',
        order_items: [
          {
            sku: `PLAN-${planCanonical}`,
            name: `Langganan ${planCanonical} (30 hari)`,
            price: amount,
            quantity: 1,
          },
        ],
        return_url: `${appUrl}/billing/success`,
        callback_url: callbackUrl,
        expired_time: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        signature,
      };

      const resp = await fetch(`${baseUrl}/transaction/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        return NextResponse.json({
          error: 'Failed to create Tripay transaction',
          details: json,
        }, { status: 400 });
      }

      // Tripay response variations: try common fields
      const data = (json && (json.data || json)) as any;
      const paymentUrl = data?.payment_url || data?.checkout_url || data?.pay_url;

      if (transactionId) {
        try {
          await supabase
            .from('transactions')
            .update({ external_ref: merchant_ref, gateway: 'TRIPAY', status: 'PENDING' })
            .eq('id', transactionId);
        } catch {
          // ignore
        }
      }

      if (typeof paymentUrl === 'string' && paymentUrl.length > 0) {
        return NextResponse.json({ payment_url: paymentUrl });
      }

      // No URL in response – treat as error
      return NextResponse.json({ error: 'Payment URL not available from Tripay response' }, { status: 400 });
    } catch (err) {
      // Network or unexpected error
      return NextResponse.json({ error: 'Tripay request failed', details: String(err) }, { status: 400 });
    }
  }

  // No Tripay credentials – explicit error
  return NextResponse.json({ error: 'Tripay is not configured. Please set TRIPAY_API_KEY, TRIPAY_MERCHANT_CODE, TRIPAY_PRIVATE_KEY, and NEXT_PUBLIC_APP_URL' }, { status: 400 });
}
