const globalStore = globalThis as typeof globalThis & {
  __appRateLimiter?: Map<string, { count: number; expiresAt: number }>;
};

if (!globalStore.__appRateLimiter) {
  globalStore.__appRateLimiter = new Map();
}

const bucketStore = globalStore.__appRateLimiter;

export interface RateLimitResult {
  ok: boolean;
  remaining?: number;
  retryAfterMs?: number;
}

export function rateLimit(
  key: string,
  limit = 20,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  const bucket = bucketStore.get(key);

  if (!bucket || bucket.expiresAt <= now) {
    bucketStore.set(key, { count: 1, expiresAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterMs: bucket.expiresAt - now };
  }

  bucket.count += 1;
  bucketStore.set(key, bucket);
  return { ok: true, remaining: limit - bucket.count };
}