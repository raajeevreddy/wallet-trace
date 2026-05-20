import type { TokenBalance } from "../types";

const BASE_URL = "https://api.coingecko.com/api/v3";
const BATCH_SIZE = 50; // CoinGecko supports up to ~100 addresses, stay conservative
const TIMEOUT_MS = 10_000;

// ─── Price Fetching ───────────────────────────────────────────────────────────

/**
 * Fetch USD prices for a batch of contract addresses on a given platform.
 * Returns a map of lowercase contract address → USD price.
 */
export async function fetchTokenPrices(
  contractAddresses: string[],
  platform = "ethereum"
): Promise<Record<string, number>> {
  if (contractAddresses.length === 0) return {};

  const apiKey = process.env.COINGECKO_API_KEY;
  const baseUrl = apiKey
    ? "https://pro-api.coingecko.com/api/v3"
    : BASE_URL;

  const params = new URLSearchParams({
    contract_addresses: contractAddresses.join(","),
    vs_currencies: "usd",
  });

  const headers: Record<string, string> = { accept: "application/json" };
  if (apiKey) headers["x-cg-pro-api-key"] = apiKey;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(
      `${baseUrl}/simple/token_price/${platform}?${params}`,
      { headers, signal: controller.signal }
    );

    if (!res.ok) {
      console.warn(`[coingecko] Price API responded ${res.status}`);
      return {};
    }

    // Response shape: { "0xabc...": { usd: 1.23 }, ... }
    const data = (await res.json()) as Record<string, { usd?: number }>;
    const prices: Record<string, number> = {};
    for (const [addr, val] of Object.entries(data)) {
      if (val.usd !== undefined) prices[addr.toLowerCase()] = val.usd;
    }
    return prices;
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      console.warn("[coingecko] Price fetch timed out");
    } else {
      console.error("[coingecko] fetchTokenPrices error:", err);
    }
    return {};
  } finally {
    clearTimeout(timer);
  }
}

// ─── Native Token Price ───────────────────────────────────────────────────────

/**
 * Fetch the USD price of a native coin (e.g. "ethereum", "bitcoin").
 * Uses CoinGecko's /simple/price endpoint by coin ID (not contract address).
 */
export async function fetchNativeTokenPrice(coinId = "ethereum"): Promise<number> {
  const apiKey = process.env.COINGECKO_API_KEY;
  const baseUrl = apiKey ? "https://pro-api.coingecko.com/api/v3" : BASE_URL;
  const headers: Record<string, string> = { accept: "application/json" };
  if (apiKey) headers["x-cg-pro-api-key"] = apiKey;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(
      `${baseUrl}/simple/price?ids=${encodeURIComponent(coinId)}&vs_currencies=usd`,
      { headers, signal: controller.signal }
    );
    if (!res.ok) {
      console.warn(`[coingecko] Native price API responded ${res.status}`);
      return 0;
    }
    const data = (await res.json()) as Record<string, { usd?: number }>;
    return data[coinId]?.usd ?? 0;
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      console.warn("[coingecko] Native price fetch timed out");
    } else {
      console.error("[coingecko] fetchNativeTokenPrice error:", err);
    }
    return 0;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Token Enrichment ─────────────────────────────────────────────────────────

/**
 * Enriches a token list with real USD values from CoinGecko.
 * Skips tokens that already have a usdValue > 0.
 * Processes in batches to stay within API limits.
 */
export async function enrichTokenPrices(
  tokens: TokenBalance[],
  platform = "ethereum"
): Promise<TokenBalance[]> {
  // Only fetch prices for tokens that don't have one yet
  const needsPricing = tokens.filter((t) => t.usdValue === 0 && t.contractAddress);

  if (needsPricing.length === 0) return tokens;

  // Batch the addresses
  const allPrices: Record<string, number> = {};
  for (let i = 0; i < needsPricing.length; i += BATCH_SIZE) {
    const batch = needsPricing
      .slice(i, i + BATCH_SIZE)
      .map((t) => t.contractAddress.toLowerCase());

    const prices = await fetchTokenPrices(batch, platform);
    Object.assign(allPrices, prices);
  }

  // Merge prices back into token list
  return tokens.map((token) => {
    if (token.usdValue > 0) return token; // already priced
    const price = allPrices[token.contractAddress.toLowerCase()];
    if (price === undefined) return token; // no price found — leave as 0
    return { ...token, usdValue: token.balance * price };
  });
}
