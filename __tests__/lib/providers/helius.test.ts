import { getSolanaBalances, getSolanaTransactions, getSolanaNFTs, getSolanaWalletAge } from "../../../lib/providers/helius";

const mockFetch = jest.fn();
global.fetch = mockFetch;

const SOLANA_ADDR = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";

function mockOk(data: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: jest.fn().mockResolvedValue(data),
  });
}

function mockErr(status = 500) {
  mockFetch.mockResolvedValueOnce({ ok: false, status });
}

// ─── getSolanaBalances ────────────────────────────────────────────────────────

describe("getSolanaBalances", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.HELIUS_API_KEY = "test-key";
  });

  afterEach(() => {
    delete process.env.HELIUS_API_KEY;
  });

  it("returns 0 balance and empty tokens when no API key is set", async () => {
    delete process.env.HELIUS_API_KEY;
    const result = await getSolanaBalances(SOLANA_ADDR);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(result).toEqual({ nativeLamports: 0, tokens: [] });
  });

  it("returns native lamports and mapped tokens", async () => {
    mockOk({
      nativeBalance: 5_000_000_000, // 5 SOL
      tokens: [
        { mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", amount: 1_000_000, decimals: 6, tokenAccount: "0xacc", name: "USD Coin", symbol: "USDC" },
      ],
    });
    const result = await getSolanaBalances(SOLANA_ADDR);
    expect(result.nativeLamports).toBe(5_000_000_000);
    expect(result.tokens).toHaveLength(1);
    expect(result.tokens[0].symbol).toBe("USDC");
    expect(result.tokens[0].balance).toBe(1); // 1_000_000 / 10^6
    expect(result.tokens[0].isStablecoin).toBe(true);
  });

  it("includes the api-key in the request URL", async () => {
    mockOk({ nativeBalance: 0, tokens: [] });
    await getSolanaBalances(SOLANA_ADDR);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("api-key=test-key"),
      expect.any(Object)
    );
  });

  it("filters out dust tokens (balance < 0.001)", async () => {
    mockOk({
      nativeBalance: 0,
      tokens: [
        { mint: "0xdust", amount: 1, decimals: 6, tokenAccount: "0xacc" }, // 0.000001 — dust
        { mint: "0xreal", amount: 1_000, decimals: 6, tokenAccount: "0xacc2", symbol: "REAL" }, // 0.001 — threshold
      ],
    });
    const result = await getSolanaBalances(SOLANA_ADDR);
    expect(result.tokens).toHaveLength(1);
    expect(result.tokens[0].contractAddress).toBe("0xreal");
  });

  it("marks USDC mint as stablecoin", async () => {
    mockOk({
      nativeBalance: 0,
      tokens: [{ mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", amount: 1_000_000, decimals: 6, tokenAccount: "0xa" }],
    });
    const result = await getSolanaBalances(SOLANA_ADDR);
    expect(result.tokens[0].isStablecoin).toBe(true);
  });

  it("uses mint address as symbol/name fallback", async () => {
    const mint = "SomeMintWithNoMetadata123";
    mockOk({ nativeBalance: 0, tokens: [{ mint, amount: 1_000_000_000, decimals: 9, tokenAccount: "0xacc" }] });
    const result = await getSolanaBalances(SOLANA_ADDR);
    expect(result.tokens[0].symbol).toBe(mint.slice(0, 6));
    expect(result.tokens[0].contractAddress).toBe(mint);
  });

  it("returns empty result gracefully when API responds with non-ok status", async () => {
    mockErr(429);
    const result = await getSolanaBalances(SOLANA_ADDR);
    expect(result).toEqual({ nativeLamports: 0, tokens: [] });
  });

  it("returns empty result gracefully when fetch throws", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    const result = await getSolanaBalances(SOLANA_ADDR);
    expect(result).toEqual({ nativeLamports: 0, tokens: [] });
  });
});

// ─── getSolanaTransactions ────────────────────────────────────────────────────

describe("getSolanaTransactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.HELIUS_API_KEY = "test-key";
  });

  afterEach(() => {
    delete process.env.HELIUS_API_KEY;
  });

  it("returns empty array when no API key is set", async () => {
    delete process.env.HELIUS_API_KEY;
    const result = await getSolanaTransactions(SOLANA_ADDR);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it("maps Helius transactions to the Transaction type", async () => {
    mockOk([
      { signature: "sig1", timestamp: 1700000000, feePayer: SOLANA_ADDR, type: "TRANSFER", source: "SYSTEM_PROGRAM" },
      { signature: "sig2", timestamp: 1700001000, feePayer: SOLANA_ADDR, type: "SWAP" },
    ]);
    const result = await getSolanaTransactions(SOLANA_ADDR);
    expect(result).toHaveLength(2);
    expect(result[0].hash).toBe("sig1");
    expect(result[0].chain).toBe("solana");
    expect(result[0].from).toBe(SOLANA_ADDR);
    expect(result[0].category).toBe("transfer");
    expect(result[1].category).toBe("defi");
  });

  it("categorizes SWAP type as defi", async () => {
    mockOk([{ signature: "s", timestamp: 0, feePayer: SOLANA_ADDR, type: "SWAP" }]);
    const [tx] = await getSolanaTransactions(SOLANA_ADDR);
    expect(tx.category).toBe("defi");
  });

  it("categorizes NFT_MINT type as nft", async () => {
    mockOk([{ signature: "s", timestamp: 0, feePayer: SOLANA_ADDR, type: "NFT_MINT" }]);
    const [tx] = await getSolanaTransactions(SOLANA_ADDR);
    expect(tx.category).toBe("nft");
  });

  it("returns empty array when fetch throws", async () => {
    mockFetch.mockRejectedValueOnce(new Error("fail"));
    const result = await getSolanaTransactions(SOLANA_ADDR);
    expect(result).toEqual([]);
  });
});

// ─── getSolanaNFTs ────────────────────────────────────────────────────────────

describe("getSolanaNFTs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.HELIUS_API_KEY = "test-key";
  });

  afterEach(() => {
    delete process.env.HELIUS_API_KEY;
  });

  it("returns empty summary when no API key is set", async () => {
    delete process.env.HELIUS_API_KEY;
    const result = await getSolanaNFTs(SOLANA_ADDR);
    expect(result).toEqual({ totalCount: 0, collections: [] });
  });

  it("groups NFTs by collection and counts them", async () => {
    mockOk({
      result: {
        total: 3,
        items: [
          { id: "nft1", grouping: [{ group_key: "collection", group_value: "coll_A" }], content: { metadata: { name: "DeGods #1" } } },
          { id: "nft2", grouping: [{ group_key: "collection", group_value: "coll_A" }], content: { metadata: { name: "DeGods #2" } } },
          { id: "nft3", grouping: [{ group_key: "collection", group_value: "coll_B" }], content: { metadata: { name: "SMB #1" } } },
        ],
      },
    });

    const result = await getSolanaNFTs(SOLANA_ADDR);
    expect(result.totalCount).toBe(3);
    expect(result.collections).toHaveLength(2);

    const collA = result.collections.find((c) => c.contractAddress === "coll_A")!;
    expect(collA.count).toBe(2);
    expect(collA.name).toBe("DeGods");
  });

  it("strips trailing '#number' from NFT names to get collection name", async () => {
    mockOk({
      result: {
        total: 1,
        items: [{ id: "nft1", grouping: [], content: { metadata: { name: "Okay Bears #4567" } } }],
      },
    });
    const result = await getSolanaNFTs(SOLANA_ADDR);
    expect(result.collections[0].name).toBe("Okay Bears");
  });

  it("sorts collections by count descending", async () => {
    mockOk({
      result: {
        total: 4,
        items: [
          { id: "a1", grouping: [{ group_key: "collection", group_value: "small" }], content: { metadata: { name: "Small #1" } } },
          { id: "b1", grouping: [{ group_key: "collection", group_value: "big" }], content: { metadata: { name: "Big #1" } } },
          { id: "b2", grouping: [{ group_key: "collection", group_value: "big" }], content: { metadata: { name: "Big #2" } } },
          { id: "b3", grouping: [{ group_key: "collection", group_value: "big" }], content: { metadata: { name: "Big #3" } } },
        ],
      },
    });
    const result = await getSolanaNFTs(SOLANA_ADDR);
    expect(result.collections[0].contractAddress).toBe("big");
    expect(result.collections[0].count).toBe(3);
  });

  it("uses the NFT id as collection key when no grouping is present", async () => {
    mockOk({
      result: {
        total: 1,
        items: [{ id: "standalone_nft", grouping: [], content: { metadata: { name: "Lone Wolf #1" } } }],
      },
    });
    const result = await getSolanaNFTs(SOLANA_ADDR);
    expect(result.collections[0].contractAddress).toBe("standalone_nft");
  });

  it("returns empty summary gracefully when API fails", async () => {
    mockErr(500);
    const result = await getSolanaNFTs(SOLANA_ADDR);
    expect(result).toEqual({ totalCount: 0, collections: [] });
  });

  it("returns empty summary gracefully when fetch throws", async () => {
    mockFetch.mockRejectedValueOnce(new Error("network error"));
    const result = await getSolanaNFTs(SOLANA_ADDR);
    expect(result).toEqual({ totalCount: 0, collections: [] });
  });
});

// ─── getSolanaWalletAge ───────────────────────────────────────────────────────

describe("getSolanaWalletAge", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.HELIUS_API_KEY = "test-key";
  });
  afterEach(() => { delete process.env.HELIUS_API_KEY; });

  it("returns null when no API key is set", async () => {
    delete process.env.HELIUS_API_KEY;
    const result = await getSolanaWalletAge(SOLANA_ADDR);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it("returns wallet age from oldest signature blockTime", async () => {
    const now = Math.floor(Date.now() / 1000);
    const twoYearsAgo = now - 2 * 365.25 * 24 * 3600;
    mockOk({
      result: [
        { signature: "sig1", blockTime: now },
        { signature: "sig2", blockTime: now - 86400 },
        { signature: "old_sig", blockTime: twoYearsAgo },
      ],
    });
    const result = await getSolanaWalletAge(SOLANA_ADDR);
    expect(result).not.toBeNull();
    expect(result!.firstTxTimestamp).toBe(twoYearsAgo);
    expect(result!.walletAgeYears).toBeGreaterThan(1.9);
    expect(result!.walletAgeYears).toBeLessThan(2.1);
  });

  it("returns null when result array is empty", async () => {
    mockOk({ result: [] });
    const result = await getSolanaWalletAge(SOLANA_ADDR);
    expect(result).toBeNull();
  });

  it("returns null when oldest blockTime is null", async () => {
    mockOk({
      result: [
        { signature: "sig1", blockTime: Math.floor(Date.now() / 1000) },
        { signature: "old_sig", blockTime: null },
      ],
    });
    const result = await getSolanaWalletAge(SOLANA_ADDR);
    expect(result).toBeNull();
  });

  it("uses getSignaturesForAddress RPC method", async () => {
    const blockTime = Math.floor(Date.now() / 1000) - 86400;
    mockOk({ result: [{ signature: "sig1", blockTime }] });
    await getSolanaWalletAge(SOLANA_ADDR);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.method).toBe("getSignaturesForAddress");
    expect(body.params[0]).toBe(SOLANA_ADDR);
    expect(body.params[1].limit).toBe(1000);
  });

  it("returns null gracefully on API error", async () => {
    mockErr(500);
    const result = await getSolanaWalletAge(SOLANA_ADDR);
    expect(result).toBeNull();
  });

  it("returns null gracefully on network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("network"));
    const result = await getSolanaWalletAge(SOLANA_ADDR);
    expect(result).toBeNull();
  });
});
