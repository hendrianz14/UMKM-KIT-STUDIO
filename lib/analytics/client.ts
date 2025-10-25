'use client';

type AnalyticsPayload = {
  type: 'store_view' | 'product_view' | 'wa_click';
  storeId: string;
  productId?: string;
  source?: 'product' | 'cart';
};

export async function trackEvent(payload: AnalyticsPayload) {
  try {
    const json = JSON.stringify(payload);
    const url = '/api/analytics';
    const headers = { type: 'application/json' } as const;

    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([json], headers);
      navigator.sendBeacon(url, blob);
      return;
    }

    void fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: json,
      // keepalive helps allow the request to complete during page unload
      keepalive: true,
    });
  } catch {
    // swallow analytics errors
  }
}
