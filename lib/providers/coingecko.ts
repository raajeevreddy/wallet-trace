import type { TokenBalance } from "../types";

const BASE_URL = "https://api.coingecko.com/api/v3";
const DEFILLAMA_URL = "https://coins.llama.fi";
const BATCH_SIZE = 50;
const TIMEOUT_MS = 10_000;

// CoinGecko platform → DeFiLlama chain name
const PLATFORM_TO_CHAIN: Record<string, string> = {
  ethereum:           "ethereum",
  solana:             "solana",
  "arbitrum-one":     "arbitrum",
  "optimistic-ethereum": "optimism",
  "polygon-pos":      "polygon",
  base:               "base",
};

// ─── DeFiLlama ────────────────────────────────────────────────────────────────

async function fetchTokenPricesFromDeFiLlama(
  contractAddresses: string[],
  platform: string
): Promise<Record<string, number>> {
  if (contractAddresses.length === 0) return {};
  const chain = PLATFORM_TO_CHAIN[platform] ?? platform;
  const coins = contractAddresses.map((a) => `${chain}:${a}`).join(",");

  try {
    const res = await fetch(`${DEFILLAMA_URL}/prices/current/${coins}`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return {};

    const data = (await res.json()) as {
      coins: Record<string, { price?: number }>;
    };

    const prices: Record<string, number> = {};
    for (const [key, val] of Object.entries(data.coins ?? {})) {
      if (val.price !== undefined) {
        // key is "chain:address" — extract the address part
        const addr = key.split(":").slice(1).join(":").toLowerCase();
        prices[addr] = val.price;
      }
    }
    return prices;
  } catch {
    return {};
  }
}

async function fetchNativePriceFromDeFiLlama(coinId: string): Promise<number> {
  try {
    const res = await fetch(
      `${DEFILLAMA_URL}/prices/current/coingecko:${encodeURIComponent(coinId)}`,
      { headers: { accept: "application/json" }, signal: AbortSignal.timeout(TIMEOUT_MS) }
    );
    if (!res.ok) return 0;
    const data = (await res.json()) as {
      coins: Record<string, { price?: number }>;
    };
    return data.coins[`coingecko:${coinId}`]?.price ?? 0;
  } catch {
    return 0;
  }
}

// ─── Token Prices ─────────────────────────────────────────────────────────────

export async function fetchTokenPrices(
  contractAddresses: string[],
  platform = "ethereum"
): Promise<Record<string, number>> {
  if (contractAddresses.length === 0) return {};

  const apiKey = process.env.COINGECKO_API_KEY;
  const baseUrl = apiKey ? "https://pro-api.coingecko.com/api/v3" : BASE_URL;
  const headers: Record<string, string> = { accept: "application/json" };
  if (apiKey) headers["x-cg-pro-api-key"] = apiKey;

  const params = new URLSearchParams({
    contract_addresses: contractAddresses.join(","),
    vs_currencies: "usd",
  });

  let prices: Record<string, number> = {};

  try {
    const res = await fetch(
      `${baseUrl}/simple/token_price/${platform}?${params}`,
      { headers, signal: AbortSignal.timeout(TIMEOUT_MS) }
    );

    if (res.ok) {
      const data = (await res.json()) as Record<string, { usd?: number }>;
      for (const [addr, val] of Object.entries(data)) {
        if (val.usd !== undefined) prices[addr.toLowerCase()] = val.usd;
      }
    } else {
      console.warn(`[coingecko] Token price API ${res.status} — falling back to DeFiLlama`);
    }
  } catch (err) {
    console.warn("[coingecko] Token price fetch failed — falling back to DeFiLlama:", (err as Error).message);
  }

  // Fill any missing prices from DeFiLlama
  const missing = contractAddresses.filter((a) => prices[a.toLowerCase()] === undefined);
  if (missing.length > 0) {
    const fallback = await fetchTokenPricesFromDeFiLlama(missing, platform);
    Object.assign(prices, fallback);
  }

  return prices;
}

// ─── Native Token Price ───────────────────────────────────────────────────────

export async function fetchNativeTokenPrice(coinId = "ethereum"): Promise<number> {
  const apiKey = process.env.COINGECKO_API_KEY;
  const baseUrl = apiKey ? "https://pro-api.coingecko.com/api/v3" : BASE_URL;
  const headers: Record<string, string> = { accept: "application/json" };
  if (apiKey) headers["x-cg-pro-api-key"] = apiKey;

  try {
    const res = await fetch(
      `${baseUrl}/simple/price?ids=${encodeURIComponent(coinId)}&vs_currencies=usd`,
      { headers, signal: AbortSignal.timeout(TIMEOUT_MS) }
    );
    if (res.ok) {
      const data = (await res.json()) as Record<string, { usd?: number }>;
      const price = data[coinId]?.usd;
      if (price !== undefined && price > 0) return price;
    } else {
      console.warn(`[coingecko] Native price API ${res.status} — falling back to DeFiLlama`);
    }
  } catch (err) {
    console.warn("[coingecko] Native price fetch failed — falling back to DeFiLlama:", (err as Error).message);
  }

  // DeFiLlama fallback
  return fetchNativePriceFromDeFiLlama(coinId);
}

// ─── Price History ────────────────────────────────────────────────────────────

export async function fetchPriceHistory(
  coinId: string,
  days = 30
): Promise<{ timestamp: number; price: number }[]> {
  const apiKey = process.env.COINGECKO_API_KEY;
  const baseUrl = apiKey ? "https://pro-api.coingecko.com/api/v3" : BASE_URL;
  const headers: Record<string, string> = { accept: "application/json" };
  if (apiKey) headers["x-cg-pro-api-key"] = apiKey;

  try {
    const res = await fetch(
      `${baseUrl}/coins/${encodeURIComponent(coinId)}/market_chart?vs_currency=usd&days=${days}&interval=daily`,
      { headers, signal: AbortSignal.timeout(TIMEOUT_MS) }
    );
    if (!res.ok) {
      console.warn(`[coingecko] Price history API ${res.status}`);
      return [];
    }
    const data = (await res.json()) as { prices?: [number, number][] };
    return (data.prices ?? []).map(([ts, price]) => ({ timestamp: ts, price }));
  } catch (err) {
    if ((err as Error).name !== "TimeoutError") {
      console.error("[coingecko] fetchPriceHistory error:", err);
    }
    return [];
  }
}

// ─── Token Enrichment ─────────────────────────────────────────────────────────

export async function enrichTokenPrices(
  tokens: TokenBalance[],
  platform = "ethereum"
): Promise<TokenBalance[]> {
  const needsPricing = tokens.filter((t) => t.usdValue === 0 && t.contractAddress);
  if (needsPricing.length === 0) return tokens;

  const allPrices: Record<string, number> = {};
  for (let i = 0; i < needsPricing.length; i += BATCH_SIZE) {
    const batch = needsPricing
      .slice(i, i + BATCH_SIZE)
      .map((t) => t.contractAddress.toLowerCase());
    const prices = await fetchTokenPrices(batch, platform);
    Object.assign(allPrices, prices);
  }

  return tokens.map((token) => {
    if (token.usdValue > 0) return token;
    const price = allPrices[token.contractAddress.toLowerCase()];
    if (price === undefined) return token;
    return { ...token, usdValue: token.balance * price };
  });
}
