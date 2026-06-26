import { generateTimeMachine } from "../../../lib/ai/timeMachine";
import type { WalletProfile } from "../../../lib/types";

// ─── Minimal profile factory ──────────────────────────────────────────────────

function makeProfile(overrides: Partial<WalletProfile> = {}): WalletProfile {
  return {
    identity: { address: "0xabc", walletAgeYears: 2 },
    netWorthUsd: 10_000,
    totalTransactions: 50,
    tokens: [
      { symbol: "ETH", name: "Ether", balance: 2, usdValue: 4000, contractAddress: "native", isStablecoin: false },
      { symbol: "USDC", name: "USD Coin", balance: 5000, usdValue: 5000, contractAddress: "0xusdc", isStablecoin: true },
    ],
    stablecoins: { totalUsdValue: 5000, portfolioPercentage: 50, breakdown: [], isTreasuryLike: false },
    protocols: [],
    chains: [{ chain: "ethereum", txCount: 50, percentage: 100, netWorthUsd: 10000 }],
    risk: { concentrationRisk: "medium", bridgeExposure: "low", protocolDiversification: "low", stablecoinDependence: "medium", leverageIndicators: "low", smartContractRisk: "low", overallScore: 35 },
    tags: [],
    sophistication: { score: 45, label: "Intermediate", breakdown: { walletAge: 10, protocolDiversity: 5, transactionFrequency: 20, multiChainActivity: 10 } },
    recentTransactions: [],
    nfts: { totalCount: 0, collections: [] },
    defiPositions: { positions: [], totalSuppliedUsd: 0, totalBorrowedUsd: 0, totalLpUsd: 0 },
    netWorthHistory: [],
    analyzedAt: Date.now(),
    ...overrides,
  };
}

// ─── Mock fetch ───────────────────────────────────────────────────────────────

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  delete process.env.ANTHROPIC_API_KEY;
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("generateTimeMachine", () => {
  describe("fallback (no API key)", () => {
    it("returns all four fields", async () => {
      const result = await generateTimeMachine(makeProfile());
      expect(result).toHaveProperty("bestTrade");
      expect(result).toHaveProperty("worstTrade");
      expect(result).toHaveProperty("biggestRegret");
      expect(result).toHaveProperty("survivalInstincts");
    });

    it("all fields are non-empty strings", async () => {
      const result = await generateTimeMachine(makeProfile());
      expect(typeof result.bestTrade).toBe("string");
      expect(result.bestTrade.length).toBeGreaterThan(10);
      expect(result.worstTrade.length).toBeGreaterThan(10);
      expect(result.biggestRegret.length).toBeGreaterThan(10);
      expect(result.survivalInstincts.length).toBeGreaterThan(10);
    });

    it("high stablecoin wallet gets stablecoin-specific survival copy", async () => {
      const profile = makeProfile({
        stablecoins: { totalUsdValue: 9000, portfolioPercentage: 90, breakdown: [], isTreasuryLike: false },
      });
      const result = await generateTimeMachine(profile);
      expect(result.survivalInstincts.toLowerCase()).toMatch(/stable|usdc|cash/);
    });

    it("old wallet mentions years on-chain in regret copy", async () => {
      const profile = makeProfile({
        identity: { address: "0xabc", walletAgeYears: 5 },
      });
      const result = await generateTimeMachine(profile);
      expect(result.biggestRegret).toMatch(/5/);
    });

    it("wallet with many NFTs mentions NFTs in regret copy", async () => {
      const profile = makeProfile({
        nfts: { totalCount: 25, collections: [] },
      });
      const result = await generateTimeMachine(profile);
      expect(result.biggestRegret.toLowerCase()).toMatch(/nft/);
    });
  });

  describe("live API path", () => {
    beforeEach(() => {
      process.env.ANTHROPIC_API_KEY = "test-key";
    });

    it("returns parsed response from API", async () => {
      const mockResult = {
        bestTrade: "Bought ETH at $800 and held through the chaos.",
        worstTrade: "Aped into LUNA two weeks before it died.",
        biggestRegret: "Sold that USDC position right before the rally.",
        survivalInstincts: "When things go red you go full ghost.",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [{ text: JSON.stringify(mockResult) }],
        }),
      });

      const result = await generateTimeMachine(makeProfile());
      expect(result).toEqual(mockResult);
    });

    it("falls back gracefully on API error", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
      const result = await generateTimeMachine(makeProfile());
      expect(result).toHaveProperty("bestTrade");
      expect(result).toHaveProperty("worstTrade");
    });

    it("falls back gracefully on network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("network down"));
      const result = await generateTimeMachine(makeProfile());
      expect(result).toHaveProperty("bestTrade");
    });

    it("falls back on malformed JSON from API", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [{ text: "not valid json {{" }] }),
      });
      const result = await generateTimeMachine(makeProfile());
      expect(result).toHaveProperty("bestTrade");
    });
  });
});
