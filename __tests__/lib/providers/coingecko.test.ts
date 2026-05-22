import { fetchTokenPrices, enrichTokenPrices, fetchNativeTokenPrice, fetchPriceHistory } from "../../../lib/providers/coingecko";
import type { TokenBalance } from "../../../lib/types";

const mockFetch = jest.fn();
global.fetch = mockFetch;

const ADDR_USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const ADDR_WBTC = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
const ADDR_UNKNOWN = "0x1234567890123456789012345678901234567890";

function makeToken(overrides: Partial<TokenBalance> = {}): TokenBalance {
  return {
    symbol: "USDC",
    name: "USD Coin",
    balance: 1000,
    usdValue: 0,
    contractAddress: ADDR_USDC,
    isStablecoin: true,
    ...overrides,
  };
}

function mockOkResponse(data: Record<string, { usd: number }>) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: jest.fn().mockResolvedValue(data),
  });
}

// ─── fetchTokenPrices ────────────────────────────────────────────────────────

describe("fetchTokenPrices", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.COINGECKO_API_KEY;
  });

  it("returns empty object for empty address list", async () => {
    const result = await fetchTokenPrices([]);
    expect(result).toEqual({});
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("calls the free CoinGecko API when no API key is set", async () => {
    mockOkResponse({ [ADDR_USDC]: { usd: 1.0 } });
    await fetchTokenPrices([ADDR_USDC]);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("api.coingecko.com/api/v3"),
      expect.any(Object)
    );
  });

  it("calls the pro CoinGecko API when API key is set", async () => {
    process.env.COINGECKO_API_KEY = "pro-key-123";
    mockOkResponse({ [ADDR_USDC]: { usd: 1.0 } });
    await fetchTokenPrices([ADDR_USDC]);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("pro-api.coingecko.com"),
      expect.objectContaining({
        headers: expect.objectContaining({ "x-cg-pro-api-key": "pro-key-123" }),
      })
    );
  });

  it("includes contract addresses and usd as query params", async () => {
    mockOkResponse({});
    await fetchTokenPrices([ADDR_USDC, ADDR_WBTC]);
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain(ADDR_USDC);
    expect(url).toContain(ADDR_WBTC);
    expect(url).toContain("vs_currencies=usd");
  });

  it("returns a price map with lowercase addresses as keys", async () => {
    mockOkResponse({ [ADDR_USDC.toUpperCase()]: { usd: 1.0 } });
    const result = await fetchTokenPrices([ADDR_USDC]);
    expect(result[ADDR_USDC.toLowerCase()]).toBe(1.0);
  });

  it("parses multiple token prices correctly", async () => {
    mockOkResponse({
      [ADDR_USDC]: { usd: 1.0 },
      [ADDR_WBTC]: { usd: 65000 },
    });
    const result = await fetchTokenPrices([ADDR_USDC, ADDR_WBTC]);
    expect(result[ADDR_USDC]).toBe(1.0);
    expect(result[ADDR_WBTC]).toBe(65000);
  });

  it("skips entries with no usd field", async () => {
    mockOkResponse({ [ADDR_USDC]: {} as { usd: number } });
    const result = await fetchTokenPrices([ADDR_USDC]);
    expect(result[ADDR_USDC]).toBeUndefined();
  });

  it("returns empty object when API responds with non-ok status", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 429 });
    const result = await fetchTokenPrices([ADDR_USDC]);
    expect(result).toEqual({});
  });

  it("returns empty object when fetch throws a network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    const result = await fetchTokenPrices([ADDR_USDC]);
    expect(result).toEqual({});
  });

  it("returns empty object on timeout (AbortError)", async () => {
    mockFetch.mockRejectedValueOnce(
      Object.assign(new Error("Aborted"), { name: "AbortError" })
    );
    const result = await fetchTokenPrices([ADDR_USDC]);
    expect(result).toEqual({});
  });

  it("uses the provided platform in the URL", async () => {
    mockOkResponse({});
    await fetchTokenPrices([ADDR_USDC], "base");
    expect(mockFetch.mock.calls[0][0]).toContain("/base?");
  });
});

// ─── fetchNativeTokenPrice ────────────────────────────────────────────────────

describe("fetchNativeTokenPrice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.COINGECKO_API_KEY;
  });

  it("returns the ETH USD price from CoinGecko", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ ethereum: { usd: 3500 } }),
    });
    const price = await fetchNativeTokenPrice("ethereum");
    expect(price).toBe(3500);
  });

  it("calls the correct CoinGecko simple/price endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ ethereum: { usd: 3500 } }),
    });
    await fetchNativeTokenPrice("ethereum");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/simple/price?ids=ethereum&vs_currencies=usd"),
      expect.any(Object)
    );
  });

  it("uses the pro API URL when COINGECKO_API_KEY is set", async () => {
    process.env.COINGECKO_API_KEY = "pro-key";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ ethereum: { usd: 3500 } }),
    });
    await fetchNativeTokenPrice("ethereum");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("pro-api.coingecko.com"),
      expect.objectContaining({
        headers: expect.objectContaining({ "x-cg-pro-api-key": "pro-key" }),
      })
    );
  });

  it("returns 0 when API responds with non-ok status", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 429 });
    const price = await fetchNativeTokenPrice("ethereum");
    expect(price).toBe(0);
  });

  it("returns 0 when fetch throws", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    const price = await fetchNativeTokenPrice("ethereum");
    expect(price).toBe(0);
  });

  it("returns 0 when response has no usd field", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ ethereum: {} }),
    });
    const price = await fetchNativeTokenPrice("ethereum");
    expect(price).toBe(0);
  });

  it("defaults to 'ethereum' coin id when no argument is passed", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ ethereum: { usd: 3500 } }),
    });
    const price = await fetchNativeTokenPrice();
    expect(price).toBe(3500);
  });
});

// ─── enrichTokenPrices ───────────────────────────────────────────────────────

describe("enrichTokenPrices", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.COINGECKO_API_KEY;
  });

  it("returns tokens unchanged when all already have usdValue > 0", async () => {
    const tokens = [makeToken({ usdValue: 1000 })];
    const result = await enrichTokenPrices(tokens);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(result[0].usdValue).toBe(1000);
  });

  it("fetches prices for tokens with usdValue of 0", async () => {
    mockOkResponse({ [ADDR_USDC]: { usd: 1.0 } });
    const tokens = [makeToken({ balance: 500, usdValue: 0 })];
    await enrichTokenPrices(tokens);
    expect(mockFetch).toHaveBeenCalled();
  });

  it("calculates usdValue as balance × price", async () => {
    mockOkResponse({ [ADDR_USDC]: { usd: 1.0 } });
    const tokens = [makeToken({ balance: 5000, usdValue: 0 })];
    const result = await enrichTokenPrices(tokens);
    expect(result[0].usdValue).toBe(5000);
  });

  it("calculates usdValue correctly for non-stablecoin", async () => {
    mockOkResponse({ [ADDR_WBTC]: { usd: 65_000 } });
    const tokens = [makeToken({ symbol: "WBTC", balance: 0.5, usdValue: 0, contractAddress: ADDR_WBTC, isStablecoin: false })];
    const result = await enrichTokenPrices(tokens);
    expect(result[0].usdValue).toBe(32_500);
  });

  it("leaves usdValue as 0 when CoinGecko has no price for the token", async () => {
    mockOkResponse({});
    const tokens = [makeToken({ contractAddress: ADDR_UNKNOWN, usdValue: 0 })];
    const result = await enrichTokenPrices(tokens);
    expect(result[0].usdValue).toBe(0);
  });

  it("preserves already-priced tokens alongside newly-priced ones", async () => {
    mockOkResponse({ [ADDR_WBTC]: { usd: 65_000 } });
    const tokens = [
      makeToken({ usdValue: 1000 }),                                                // already priced
      makeToken({ symbol: "WBTC", balance: 1, usdValue: 0, contractAddress: ADDR_WBTC, isStablecoin: false }),
    ];
    const result = await enrichTokenPrices(tokens);
    expect(result[0].usdValue).toBe(1000);
    expect(result[1].usdValue).toBe(65_000);
  });

  it("returns original tokens when fetch fails (graceful fallback)", async () => {
    mockFetch.mockRejectedValueOnce(new Error("API down"));
    const tokens = [makeToken({ balance: 1000, usdValue: 0 })];
    const result = await enrichTokenPrices(tokens);
    expect(result[0].usdValue).toBe(0);
  });

  it("does not mutate the original token objects", async () => {
    mockOkResponse({ [ADDR_USDC]: { usd: 1.0 } });
    const original = makeToken({ balance: 100, usdValue: 0 });
    const tokens = [original];
    await enrichTokenPrices(tokens);
    expect(original.usdValue).toBe(0); // unchanged
  });

  it("handles an empty token list without calling fetch", async () => {
    const result = await enrichTokenPrices([]);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it("batches requests when token count exceeds BATCH_SIZE", async () => {
    // Create 55 tokens — should result in 2 fetch calls (50 + 5)
    const tokens: TokenBalance[] = Array.from({ length: 55 }, (_, i) => ({
      symbol: `TKN${i}`,
      name: `Token ${i}`,
      balance: 10,
      usdValue: 0,
      contractAddress: `0x${String(i).padStart(40, "0")}`,
      isStablecoin: false,
    }));
    mockOkResponse({});
    mockOkResponse({});
    await enrichTokenPrices(tokens);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

// ─── fetchPriceHistory ───────────────────────────────────────────────────────

describe("fetchPriceHistory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.COINGECKO_API_KEY;
  });

  function mockHistoryOk(prices: [number, number][]) {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ prices }),
    });
  }

  it("returns mapped price points from response", async () => {
    const now = Date.now();
    mockHistoryOk([
      [now - 2 * 86_400_000, 3000],
      [now - 86_400_000, 3100],
      [now, 3200],
    ]);
    const result = await fetchPriceHistory("ethereum");
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ timestamp: now - 2 * 86_400_000, price: 3000 });
    expect(result[2]).toEqual({ timestamp: now, price: 3200 });
  });

  it("calls the market_chart endpoint with correct params", async () => {
    mockHistoryOk([]);
    await fetchPriceHistory("solana", 30);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/coins/solana/market_chart?vs_currency=usd&days=30&interval=daily"),
      expect.any(Object)
    );
  });

  it("returns empty array on non-ok HTTP response", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 429 });
    const result = await fetchPriceHistory("ethereum");
    expect(result).toEqual([]);
  });

  it("returns empty array when prices field is missing", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });
    const result = await fetchPriceHistory("ethereum");
    expect(result).toEqual([]);
  });

  it("returns empty array on network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("network"));
    const result = await fetchPriceHistory("ethereum");
    expect(result).toEqual([]);
  });

  it("uses pro API URL when COINGECKO_API_KEY is set", async () => {
    process.env.COINGECKO_API_KEY = "pro-key";
    mockHistoryOk([]);
    await fetchPriceHistory("ethereum");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("pro-api.coingecko.com"),
      expect.objectContaining({
        headers: expect.objectContaining({ "x-cg-pro-api-key": "pro-key" }),
      })
    );
  });
});
