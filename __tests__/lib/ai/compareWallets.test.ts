import { compareWallets } from "../../../lib/ai/compareWallets";
import type { WalletProfile } from "../../../lib/types";

function makeProfile(overrides: Partial<WalletProfile> = {}): WalletProfile {
  return {
    identity: { address: "0xabc", walletAgeYears: 2 },
    netWorthUsd: 10_000,
    totalTransactions: 50,
    tokens: [
      { symbol: "ETH", name: "Ether", balance: 2, usdValue: 4000, contractAddress: "native", isStablecoin: false },
    ],
    stablecoins: { totalUsdValue: 2000, portfolioPercentage: 20, breakdown: [], isTreasuryLike: false },
    protocols: [{ protocol: "Uniswap", category: "dex", interactionCount: 10, chains: ["ethereum"] }],
    chains: [{ chain: "ethereum", txCount: 50, percentage: 100, netWorthUsd: 10000 }],
    risk: { concentrationRisk: "medium", bridgeExposure: "low", protocolDiversification: "medium", stablecoinDependence: "low", leverageIndicators: "low", smartContractRisk: "low", overallScore: 40 },
    tags: [],
    sophistication: { score: 55, label: "Intermediate", breakdown: { walletAge: 10, protocolDiversity: 15, transactionFrequency: 20, multiChainActivity: 10 } },
    recentTransactions: [],
    nfts: { totalCount: 5, collections: [] },
    defiPositions: { positions: [], totalSuppliedUsd: 0, totalBorrowedUsd: 0, totalLpUsd: 0 },
    netWorthHistory: [],
    analyzedAt: Date.now(),
    ...overrides,
  };
}

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  delete process.env.ANTHROPIC_API_KEY;
});

describe("compareWallets", () => {
  describe("fallback (no API key)", () => {
    it("returns all required comparison fields", async () => {
      const result = await compareWallets(makeProfile(), makeProfile({ identity: { address: "0xdef", walletAgeYears: 3 } }));
      expect(result).toHaveProperty("riskTolerance");
      expect(result).toHaveProperty("nftTaste");
      expect(result).toHaveProperty("defiBehavior");
      expect(result).toHaveProperty("chainPreferences");
      expect(result).toHaveProperty("verdict");
    });

    it("all fields are non-empty strings", async () => {
      const result = await compareWallets(makeProfile(), makeProfile());
      for (const key of ["riskTolerance", "nftTaste", "defiBehavior", "chainPreferences", "verdict"] as const) {
        expect(typeof result[key]).toBe("string");
        expect(result[key].length).toBeGreaterThan(10);
      }
    });

    it("verdict references both wallet net worths", async () => {
      const w1 = makeProfile({ netWorthUsd: 50_000 });
      const w2 = makeProfile({ netWorthUsd: 1_200_000, identity: { address: "0xdef" } });
      const result = await compareWallets(w1, w2);
      expect(result.verdict).toMatch(/50K|50,000|\$50/);
    });

    it("riskTolerance references both risk scores", async () => {
      const w1 = makeProfile({ risk: { concentrationRisk: "low", bridgeExposure: "low", protocolDiversification: "low", stablecoinDependence: "low", leverageIndicators: "low", smartContractRisk: "low", overallScore: 20 } });
      const w2 = makeProfile({ risk: { concentrationRisk: "high", bridgeExposure: "high", protocolDiversification: "low", stablecoinDependence: "low", leverageIndicators: "high", smartContractRisk: "high", overallScore: 85 } });
      const result = await compareWallets(w1, w2);
      expect(result.riskTolerance).toMatch(/20/);
      expect(result.riskTolerance).toMatch(/85/);
    });
  });

  describe("live API path", () => {
    beforeEach(() => {
      process.env.ANTHROPIC_API_KEY = "test-key";
    });

    it("returns parsed API response", async () => {
      const mockResult = {
        riskTolerance: "Wallet A plays it safe at 20/100. Wallet B is reckless at 85/100.",
        nftTaste: "Wallet A collects JPEGs. Wallet B has zero taste.",
        defiBehavior: "Both use Uniswap. Neither is a DeFi native.",
        chainPreferences: "Both ETH maxis. Boring but reliable.",
        verdict: "Wallet B wins on net worth. Wallet A wins on not getting rekt.",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [{ text: JSON.stringify(mockResult) }] }),
      });

      const result = await compareWallets(makeProfile(), makeProfile());
      expect(result).toEqual(mockResult);
    });

    it("falls back on API error", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
      const result = await compareWallets(makeProfile(), makeProfile());
      expect(result).toHaveProperty("verdict");
    });

    it("falls back on network failure", async () => {
      mockFetch.mockRejectedValueOnce(new Error("timeout"));
      const result = await compareWallets(makeProfile(), makeProfile());
      expect(result).toHaveProperty("verdict");
    });
  });
});
