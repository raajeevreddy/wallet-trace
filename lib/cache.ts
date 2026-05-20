import type { AnalysisResponse } from "./types";

// ─── Config ───────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_ENTRIES = 500;

// ─── Store ────────────────────────────────────────────────────────────────────

interface CacheEntry {
  data: AnalysisResponse;
  expiresAt: number;
}

// Module-level Map — persists across requests in the same serverless instance
const store = new Map<string, CacheEntry>();

// ─── Public API ───────────────────────────────────────────────────────────────

export function getCachedAnalysis(address: string): AnalysisResponse | null {
  const key = address.toLowerCase();
  const entry = store.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }

  return entry.data;
}

export function setCachedAnalysis(address: string, data: AnalysisResponse): void {
  // Evict oldest entry when at capacity (FIFO)
  if (store.size >= MAX_ENTRIES) {
    const firstKey = store.keys().next().value;
    if (firstKey) store.delete(firstKey);
  }

  store.set(address.toLowerCase(), {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

/** Exposed for tests and admin tooling */
export function clearCache(): void {
  store.clear();
}

export function getCacheSize(): number {
  return store.size;
}
