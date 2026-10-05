import { createHash } from 'node:crypto';

const windows = new Map<string, number[]>();

// Number of reverse proxies in front of the app (cPanel/Apache = 1). Each one
// appends the address it saw to X-Forwarded-For, so the entry that many places
// from the right was written by our own proxy; anything further left is
// client-supplied and can be forged.
const TRUSTED_PROXY_HOPS = Math.max(1, Number(process.env.TRUSTED_PROXY_HOPS || 1));

export function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const hops = forwardedFor.split(',').map((part) => part.trim()).filter(Boolean);
    const trusted = hops[hops.length - TRUSTED_PROXY_HOPS] ?? hops[0];
    if (trusted) return trusted;
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return 'unknown';
}

interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
}

export function checkRateLimitKey(id: string, options: RateLimitOptions = {}) {
  const { windowMs = 60_000, maxRequests = 10 } = options;
  const key = createHash('sha256').update(id).digest('hex');
  const now = Date.now();
  const existing = windows.get(key) || [];

  const recent = existing.filter((timestamp) => now - timestamp < windowMs);
  recent.push(now);
  windows.set(key, recent);

  const allowed = recent.length <= maxRequests;
  const retryAfter = allowed ? 0 : Math.ceil((recent[0] + windowMs - now) / 1000);

  return { allowed, retryAfter, key };
}

export function checkRateLimit(request: Request, options: RateLimitOptions = {}) {
  return checkRateLimitKey(`ip:${getClientIdentifier(request)}`, options);
}
