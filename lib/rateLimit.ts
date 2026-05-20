// ─── Config ───────────────────────────────────────────────────────────────────

const WINDOW_MS = 60 * 1000;  // 1-minute rolling window
const MAX_REQUESTS = 10;       // per IP per window

// ─── Store ────────────────────────────────────────────────────────────────────

// Map of IP → sorted array of request timestamps (within current window)
const windows = new Map<string, number[]>();

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns true if the IP has exceeded the rate limit.
 * Records the request timestamp if not limited.
 */
export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (windows.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    windows.set(ip, recent); // keep pruned list without recording new request
    return true;
  }

  recent.push(now);
  windows.set(ip, recent);
  return false;
}

/** How many requests remain in the current window for this IP */
export function getRemainingRequests(ip: string): number {
  const now = Date.now();
  const recent = (windows.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  return Math.max(0, MAX_REQUESTS - recent.length);
}

/** Prune fully-expired IP entries — call periodically to avoid memory growth */
export function purgeExpired(): void {
  const now = Date.now();
  for (const [ip, timestamps] of windows.entries()) {
    const valid = timestamps.filter((t) => now - t < WINDOW_MS);
    if (valid.length === 0) windows.delete(ip);
    else windows.set(ip, valid);
  }
}

/** Exposed for tests */
export function resetLimiter(): void {
  windows.clear();
}
