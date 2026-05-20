// ─── Types ────────────────────────────────────────────────────────────────────

export interface RecentWallet {
  address: string; // hex address (lowercase)
  ens?: string;    // resolved ENS name if available
  analyzedAt: number; // Unix ms
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = "wt-recent";
const MAX_RECENT = 5;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Save a wallet to the recent list (most-recent-first, deduped by address).
 * No-ops in SSR / when localStorage is unavailable.
 */
export function saveRecentWallet(address: string, ens?: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentWallets();
    // Remove duplicate entry for this address
    const filtered = existing.filter((w) => w.address !== address);
    const updated: RecentWallet[] = [
      { address, ens: ens || undefined, analyzedAt: Date.now() },
      ...filtered,
    ].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded, etc.)
  }
}

/**
 * Retrieve the last up-to-5 analysed wallets, most-recent first.
 * Returns [] in SSR or if data is missing / corrupt.
 */
export function getRecentWallets(): RecentWallet[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (w): w is RecentWallet =>
        w !== null &&
        typeof w === "object" &&
        typeof (w as RecentWallet).address === "string" &&
        typeof (w as RecentWallet).analyzedAt === "number"
    );
  } catch {
    return [];
  }
}

/**
 * Clear the recent wallets list.
 */
export function clearRecentWallets(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Formats an address for display: 0x1234…abcd */
export function shortAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
