import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import crypto from 'crypto';

export const runtime = 'nodejs';

function hmacSignature(merchantCode: string, merchantRef: string, amount: number, privateKey: string) {
  return crypto
    .createHmac('sha256', privateKey)
    .update(String(merchantCode) + String(merchantRef) + String(amount))
    .digest('hex');
}

export async function POST(request: Request) {
  const privateKey = process.env.TRIPAY_PRIVATE_KEY || '';
  const merchantCode = process.env.TRIPAY_MERCHANT_CODE || '';

  // Tripay may send JSON with signature either in header (x-signature) or body
  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const headerSignature =
    request.headers.get('x-callback-signature') ||
    request.headers.get('X-Callback-Signature') ||
    request.headers.get('x-signature') ||
    request.headers.get('X-Signature');
  const data = payload?.data || payload; // support raw or wrapped
  const merchant_ref: string = data?.merchant_ref || data?.merchantRef || '';
  const reference: string = data?.reference || data?.ref || '';
  const amountRaw = Number(data?.amount || data?.total_amount || 0);
  const statusRaw: string = (data?.status || '').toString().toUpperCase(); // PAID | EXPIRED | PENDING
  const bodySignature = payload?.signature || data?.signature || '';

  // Verify signature strictly when possible
  let signatureValid = false;
  if (privateKey && merchantCode && amountRaw > 0) {
    const supplied = (headerSignature || bodySignature || '').toString().toLowerCase();

    // Known signature variants observed in Tripay integrations
    const candidates = [
      // Using merchant_ref
      String(merchantCode) + String(merchant_ref) + String(amountRaw),
      String(merchantCode) + String(merchant_ref) + String(statusRaw) + String(amountRaw),
      String(merchant_ref) + String(amountRaw),
      String(merchant_ref) + String(statusRaw) + String(amountRaw),
      // Using reference
      String(merchantCode) + String(reference) + String(amountRaw),
      String(merchantCode) + String(reference) + String(statusRaw) + String(amountRaw),
      String(reference) + String(amountRaw),
      String(reference) + String(statusRaw) + String(amountRaw),
    ];

    let match = false;
    for (const s of candidates) {
      const h = crypto.createHmac('sha256', privateKey).update(s).digest('hex').toLowerCase();
      if (h === supplied) {
        match = true;
        break;
      }
    }

    signatureValid = !!supplied && match;
  }

  // Fallback verification via Tripay API if signature mismatch but we have reference
  let verifiedByApi = false;
  let verifiedStatus: 'PAID' | 'PENDING' | 'EXPIRED' | 'UNKNOWN' = 'UNKNOWN';
  if (!signatureValid && reference) {
    try {
      const apiKey = process.env.TRIPAY_API_KEY;
      const baseUrl = process.env.TRIPAY_BASE_URL || 'https://tripay.co.id/api-sandbox';
      if (apiKey) {
        const resp = await fetch(`${baseUrl}/transaction/detail?reference=${encodeURIComponent(reference)}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
          cache: 'no-store',
        });
        const json = await resp.json().catch(() => ({}));
        if (resp.ok && json && json.success !== false) {
          const d = (json.data || {}) as any;
          const st = String(d.status || '').toUpperCase();
          const total = Number(d.total_amount || d.amount || 0);
          const mref = String(d.merchant_ref || '');
          if (st && total && (total === amountRaw) && (mref ? (mref === merchant_ref) : true)) {
            verifiedByApi = true;
            verifiedStatus = (st === 'PAID' || st === 'SUCCESS') ? 'PAID' : (st === 'EXPIRED' ? 'EXPIRED' : 'PENDING');
          }
        }
      }
    } catch {
      // ignore; keep as invalid
    }
  }

  if (!signatureValid && !verifiedByApi) {
    return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = supabaseAdmin;

  try {
    // Find transaction by external_ref (merchant_ref)
    const { data: tx } = await supabase
      .from('transactions')
      .select('id, user_id, plan, status')
      .eq('external_ref', merchant_ref)
      .single();

    if (!tx) {
      // Acknowledge to Tripay to avoid retries, but note not found
      return NextResponse.json({ success: true, note: 'Transaction not found; ack' });
    }

    const normalizedStatus = verifiedByApi
      ? verifiedStatus
      : (statusRaw === 'PAID' || statusRaw === 'SUCCESS' ? 'PAID' : statusRaw === 'EXPIRED' ? 'EXPIRED' : 'PENDING');

    await supabase
      .from('transactions')
      .update({ status: normalizedStatus })
      .eq('id', tx.id);

    if (normalizedStatus === 'PAID') {
      // Activate subscription for 30 days
      const now = new Date();
      const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const plan = (tx as any).plan || 'Basic';

      // Insert subscriptions row (best-effort)
      try {
        await supabase.from('subscriptions').insert({
          user_id: tx.user_id,
          plan_name: plan,
          status: 'active',
          expires_at: expires.toISOString(),
        });
      } catch {}

      // Update profiles for dashboard consistency
      try {
        await supabase
          .from('profiles')
          .update({ plan, plan_expires_at: expires.toISOString() })
          .eq('user_id', tx.user_id);
      } catch {}
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    // Acknowledge to Tripay to avoid repeated retries; log handled with errors
    return NextResponse.json({ success: true, note: 'Handled with errors' });
  }
}
