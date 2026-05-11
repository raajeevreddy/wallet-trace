import {
  classifyTags,
  scoreSophistication,
  assessRisk,
  summarizeStablecoins,
} from "../../lib/classifiers";
import type { ProtocolInteraction, TokenBalance, ChainActivity } from "../../lib/types";
import { mockTokens, mockProtocols, mockChains, mockStablecoins } from "../fixtures";

// ─── classifyTags ─────────────────────────────────────────────────────────────

describe("classifyTags", () => {
  const baseArgs = {
    protocols: [] as ProtocolInteraction[],
    stablecoins: mockStablecoins,
    netWorthUsd: 50_000,
    totalTransactions: 200,
    walletAgeYears: 1,
    chains: [{ chain: "ethereum" as const, txCount: 200, percentage: 100, netWorthUsd: 50_000 }],
  };

  it("tags Yield Farmer when 2+ yield/lending protocols exist", () => {
    const protocols: ProtocolInteraction[] = [
      { protocol: "Aave", category: "lending", interactionCount: 5, chains: ["ethereum"] },
      { protocol: "Pendle", category: "yield", interactionCount: 5, chains: ["ethereum"] },
    ];
    const tags = classifyTags(protocols, baseArgs.stablecoins, baseArgs.netWorthUsd, baseArgs.totalTransactions, baseArgs.walletAgeYears, baseArgs.chains);
    expect(tags).toContain("Yield Farmer");
  });

  it("tags Yield Farmer when a single yield protocol has >20 interactions", () => {
    const protocols: ProtocolInteraction[] = [
      { protocol: "Yearn", category: "yield", interactionCount: 21, chains: ["ethereum"] },
    ];
    const tags = classifyTags(protocols, baseArgs.stablecoins, 50_000, 200, 1, baseArgs.chains);
    expect(tags).toContain("Yield Farmer");
  });

  it("tags Treasury Wallet when stablecoin % >50 and netWorth >100k", () => {
    const treasuryStables = { ...mockStablecoins, portfolioPercentage: 60 };
    const tags = classifyTags([], treasuryStables, 200_000, 50, 2, baseArgs.chains);
    expect(tags).toContain("Treasury Wallet");
  });

  it("does NOT tag Treasury Wallet when netWorth is below 100k", () => {
    const stables = { ...mockStablecoins, portfolioPercentage: 60 };
    const tags = classifyTags([], stables, 99_999, 50, 2, baseArgs.chains);
    expect(tags).not.toContain("Treasury Wallet");
  });

  it("tags Whale when netWorthUsd >= 1M", () => {
    const tags = classifyTags([], mockStablecoins, 1_000_000, 100, 2, baseArgs.chains);
    expect(tags).toContain("Whale");
  });

  it("does NOT tag Whale below 1M", () => {
    const tags = classifyTags([], mockStablecoins, 999_999, 100, 2, baseArgs.chains);
    expect(tags).not.toContain("Whale");
  });

  it("tags DeFi Power User with 5+ protocols", () => {
    const tags = classifyTags(mockProtocols, mockStablecoins, 50_000, 200, 1, baseArgs.chains);
    expect(tags).toContain("DeFi Power User");
  });

  it("does NOT tag DeFi Power User with fewer than 5 protocols", () => {
    const tags = classifyTags(mockProtocols.slice(0, 4), mockStablecoins, 50_000, 200, 1, baseArgs.chains);
    expect(tags).not.toContain("DeFi Power User");
  });

  it("tags Bridge User when a bridge protocol exists", () => {
    const protocols: ProtocolInteraction[] = [
      { protocol: "Hop Bridge", category: "bridge", interactionCount: 5, chains: ["ethereum"] },
    ];
    const tags = classifyTags(protocols, mockStablecoins, 50_000, 200, 1, baseArgs.chains);
    expect(tags).toContain("Bridge User");
  });

  it("tags Bridge User when 2+ chains are active", () => {
    const tags = classifyTags([], mockStablecoins, 50_000, 200, 1, mockChains);
    expect(tags).toContain("Bridge User");
  });

  it("tags Long-Term Holder for old wallet with low tx frequency", () => {
    const tags = classifyTags([], mockStablecoins, 50_000, 200, 4, baseArgs.chains);
    expect(tags).toContain("Long-Term Holder");
  });

  it("does NOT tag Long-Term Holder if wallet age < 3 years", () => {
    const tags = classifyTags([], mockStablecoins, 50_000, 200, 2, baseArgs.chains);
    expect(tags).not.toContain("Long-Term Holder");
  });

  it("tags Retail Trader for low-wealth, high-frequency wallet with no lending", () => {
    const protocols: ProtocolInteraction[] = [
      { protocol: "Uniswap", category: "dex", interactionCount: 50, chains: ["ethereum"] },
    ];
    const tags = classifyTags(protocols, mockStablecoins, 10_000, 300, 1, baseArgs.chains);
    expect(tags).toContain("Retail Trader");
  });

  it("tags Market Maker when dex + perps both present", () => {
    const protocols: ProtocolInteraction[] = [
      { protocol: "Uniswap", category: "dex", interactionCount: 100, chains: ["ethereum"] },
      { protocol: "GMX", category: "perps", interactionCount: 50, chains: ["arbitrum"] },
    ];
    const tags = classifyTags(protocols, mockStablecoins, 500_000, 1000, 2, mockChains);
    expect(tags).toContain("Market Maker");
  });

  it("returns no more than 4 tags", () => {
    const tags = classifyTags(mockProtocols, { ...mockStablecoins, portfolioPercentage: 60 }, 2_000_000, 500, 5, mockChains);
    expect(tags.length).toBeLessThanOrEqual(4);
  });

  it("returns no duplicate tags", () => {
    const tags = classifyTags(mockProtocols, mockStablecoins, 1_500_000, 200, 5, mockChains);
    expect(new Set(tags).size).toBe(tags.length);
  });

  it("returns empty array when no conditions are met", () => {
    const tags = classifyTags([], mockStablecoins, 10_000, 10, 1, baseArgs.chains);
    expect(tags).toEqual([]);
  });
});

// ─── scoreSophistication ──────────────────────────────────────────────────────

describe("scoreSophistication", () => {
  it("returns Novice label and score 0 for a wallet with no history", () => {
    // 0 age=0, 0 protocols=0, 0 txns=0, 0 chains=0 → score 0
    const result = scoreSophistication(0, [], 0, []);
    expect(result.label).toBe("Novice");
    expect(result.score).toBe(0);
  });

  it("returns Intermediate label for score 25–49", () => {
    // 3yr age=15, 4 protocols=14, 0 txns=0, 0 chains=0 → 29pts
    const protocols = mockProtocols.slice(0, 4);
    const result = scoreSophistication(3, protocols, 0, []);
    expect(result.score).toBe(29);
    expect(result.label).toBe("Intermediate");
  });

  it("returns Advanced label for score 50–74", () => {
    // 5yr age=25, 6 protocols=21, 250txns=10, 0 chains=0 → 56pts
    const result = scoreSophistication(5, mockProtocols, 250, []);
    expect(result.score).toBe(56);
    expect(result.label).toBe("Advanced");
  });

  it("returns Institutional label for score >= 75", () => {
    const result = scoreSophistication(5, mockProtocols, 500, mockChains);
    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.label).toBe("Institutional");
  });

  it("caps walletAge contribution at 25 points (saturates at 5 years)", () => {
    const result10yr = scoreSophistication(10, [], 0, []);
    const result5yr = scoreSophistication(5, [], 0, []);
    expect(result10yr.breakdown.walletAge).toBe(25);
    expect(result5yr.breakdown.walletAge).toBe(25);
  });

  it("caps protocolDiversity at 35 points (saturates at 10 protocols)", () => {
    const manyProtocols: ProtocolInteraction[] = Array.from({ length: 15 }, (_, i) => ({
      protocol: `Protocol${i}`,
      category: "dex" as const,
      interactionCount: 5,
      chains: ["ethereum" as const],
    }));
    const result = scoreSophistication(0, manyProtocols, 0, []);
    expect(result.breakdown.protocolDiversity).toBe(35);
  });

  it("caps transactionFrequency at 20 points (saturates at 500 txns)", () => {
    const result = scoreSophistication(0, [], 1000, []);
    expect(result.breakdown.transactionFrequency).toBe(20);
  });

  it("caps multiChainActivity at 20 points (saturates at 3 chains)", () => {
    const result = scoreSophistication(0, [], 0, mockChains);
    expect(result.breakdown.multiChainActivity).toBe(20);
  });

  it("returns 0 multiChainActivity for single chain", () => {
    const result = scoreSophistication(0, [], 0, [mockChains[0]]);
    expect(result.breakdown.multiChainActivity).toBe(0);
  });

  it("overall score never exceeds 100", () => {
    const manyProtocols: ProtocolInteraction[] = Array.from({ length: 20 }, (_, i) => ({
      protocol: `P${i}`,
      category: "dex" as const,
      interactionCount: 10,
      chains: ["ethereum" as const],
    }));
    const result = scoreSophistication(10, manyProtocols, 1000, mockChains);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("breakdown values sum to overall score", () => {
    const result = scoreSophistication(3, mockProtocols.slice(0, 3), 150, mockChains.slice(0, 2));
    const sum = result.breakdown.walletAge + result.breakdown.protocolDiversity +
      result.breakdown.transactionFrequency + result.breakdown.multiChainActivity;
    expect(result.score).toBe(sum);
  });
});

// ─── assessRisk ───────────────────────────────────────────────────────────────

describe("assessRisk", () => {
  it("returns low concentrationRisk when top holding is <50% of portfolio", () => {
    const result = assessRisk(mockTokens, mockProtocols, mockStablecoins, mockChains, 165_000);
    expect(result.concentrationRisk).toBe("low");
  });

  it("returns medium concentrationRisk when top holding is 50–74% of portfolio", () => {
    const tokens: TokenBalance[] = [
      { symbol: "ETH", name: "Ether", balance: 1, usdValue: 60_000, contractAddress: "0x1", isStablecoin: false },
      { symbol: "USDC", name: "USD Coin", balance: 40_000, usdValue: 40_000, contractAddress: "0x2", isStablecoin: true },
    ];
    const result = assessRisk(tokens, [], mockStablecoins, mockChains, 100_000);
    expect(result.concentrationRisk).toBe("medium");
  });

  it("returns high concentrationRisk when top holding is >=75% of portfolio", () => {
    const tokens: TokenBalance[] = [
      { symbol: "ETH", name: "Ether", balance: 1, usdValue: 80_000, contractAddress: "0x1", isStablecoin: false },
      { symbol: "USDC", name: "USD Coin", balance: 20_000, usdValue: 20_000, contractAddress: "0x2", isStablecoin: true },
    ];
    const result = assessRisk(tokens, [], mockStablecoins, mockChains, 100_000);
    expect(result.concentrationRisk).toBe("high");
  });

  it("returns low bridgeExposure for 0–1 bridge protocols", () => {
    const result = assessRisk(mockTokens, mockProtocols.filter(p => p.category !== "bridge"), mockStablecoins, mockChains, 165_000);
    expect(result.bridgeExposure).toBe("low");
  });

  it("returns medium bridgeExposure for 2–4 bridge protocols", () => {
    const protocols: ProtocolInteraction[] = Array.from({ length: 3 }, (_, i) => ({
      protocol: `Bridge${i}`,
      category: "bridge" as const,
      interactionCount: 5,
      chains: ["ethereum" as const],
    }));
    const result = assessRisk(mockTokens, protocols, mockStablecoins, mockChains, 165_000);
    expect(result.bridgeExposure).toBe("medium");
  });

  it("returns high bridgeExposure for 5+ bridge protocols", () => {
    const protocols: ProtocolInteraction[] = Array.from({ length: 5 }, (_, i) => ({
      protocol: `Bridge${i}`,
      category: "bridge" as const,
      interactionCount: 5,
      chains: ["ethereum" as const],
    }));
    const result = assessRisk(mockTokens, protocols, mockStablecoins, mockChains, 165_000);
    expect(result.bridgeExposure).toBe("high");
  });

  it("returns low protocolDiversification for 5+ protocols", () => {
    const result = assessRisk(mockTokens, mockProtocols, mockStablecoins, mockChains, 165_000);
    expect(result.protocolDiversification).toBe("low");
  });

  it("returns medium protocolDiversification for 2–4 protocols", () => {
    const result = assessRisk(mockTokens, mockProtocols.slice(0, 3), mockStablecoins, mockChains, 165_000);
    expect(result.protocolDiversification).toBe("medium");
  });

  it("returns high protocolDiversification for 0–1 protocols", () => {
    const result = assessRisk(mockTokens, [], mockStablecoins, mockChains, 165_000);
    expect(result.protocolDiversification).toBe("high");
  });

  it("returns high stablecoinDependence when >90% in stables", () => {
    const stables = { ...mockStablecoins, portfolioPercentage: 95 };
    const result = assessRisk(mockTokens, mockProtocols, stables, mockChains, 165_000);
    expect(result.stablecoinDependence).toBe("high");
  });

  it("returns high stablecoinDependence when <5% in stables", () => {
    const stables = { ...mockStablecoins, portfolioPercentage: 3 };
    const result = assessRisk(mockTokens, mockProtocols, stables, mockChains, 165_000);
    expect(result.stablecoinDependence).toBe("high");
  });

  it("returns medium stablecoinDependence for 60–90%", () => {
    const stables = { ...mockStablecoins, portfolioPercentage: 70 };
    const result = assessRisk(mockTokens, mockProtocols, stables, mockChains, 165_000);
    expect(result.stablecoinDependence).toBe("medium");
  });

  it("returns low stablecoinDependence for 5–60%", () => {
    const result = assessRisk(mockTokens, mockProtocols, mockStablecoins, mockChains, 165_000);
    expect(result.stablecoinDependence).toBe("low");
  });

  it("returns medium leverageIndicators when perps protocol present", () => {
    const protocols: ProtocolInteraction[] = [
      ...mockProtocols,
      { protocol: "GMX", category: "perps", interactionCount: 20, chains: ["arbitrum"] },
    ];
    const result = assessRisk(mockTokens, protocols, mockStablecoins, mockChains, 165_000);
    expect(result.leverageIndicators).toBe("medium");
  });

  it("returns low leverageIndicators with no perps", () => {
    const result = assessRisk(mockTokens, mockProtocols, mockStablecoins, mockChains, 165_000);
    expect(result.leverageIndicators).toBe("low");
  });

  it("returns overallScore in 0–100 range", () => {
    const result = assessRisk(mockTokens, mockProtocols, mockStablecoins, mockChains, 165_000);
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
  });

  it("handles empty tokens array without throwing", () => {
    expect(() => assessRisk([], [], mockStablecoins, mockChains, 0)).not.toThrow();
  });
});

// ─── summarizeStablecoins ─────────────────────────────────────────────────────

describe("summarizeStablecoins", () => {
  it("calculates totalUsdValue from stablecoin tokens only", () => {
    const result = summarizeStablecoins(mockTokens, 165_000);
    expect(result.totalUsdValue).toBe(70_000);
  });

  it("calculates portfolioPercentage correctly", () => {
    const result = summarizeStablecoins(mockTokens, 100_000);
    expect(result.portfolioPercentage).toBeCloseTo(70);
  });

  it("returns 0 portfolioPercentage when netWorthUsd is 0", () => {
    const result = summarizeStablecoins(mockTokens, 0);
    expect(result.portfolioPercentage).toBe(0);
  });

  it("excludes tokens with usdValue 0", () => {
    const tokens: TokenBalance[] = [
      ...mockTokens,
      { symbol: "FRAX", name: "Frax", balance: 1000, usdValue: 0, contractAddress: "0xfrax", isStablecoin: true },
    ];
    const result = summarizeStablecoins(tokens, 165_000);
    expect(result.breakdown.every(b => b.usdValue > 0)).toBe(true);
  });

  it("limits breakdown to top 5 stablecoins", () => {
    const manyStables: TokenBalance[] = Array.from({ length: 8 }, (_, i) => ({
      symbol: `STABLE${i}`,
      name: `Stable ${i}`,
      balance: 1000,
      usdValue: 1000,
      contractAddress: `0x${i}`,
      isStablecoin: true,
    }));
    const result = summarizeStablecoins(manyStables, 10_000);
    expect(result.breakdown.length).toBeLessThanOrEqual(5);
  });

  it("sorts breakdown by usdValue descending", () => {
    const result = summarizeStablecoins(mockTokens, 165_000);
    for (let i = 1; i < result.breakdown.length; i++) {
      expect(result.breakdown[i - 1].usdValue).toBeGreaterThanOrEqual(result.breakdown[i].usdValue);
    }
  });

  it("marks isTreasuryLike when >50% stables and netWorth >100k", () => {
    const tokens: TokenBalance[] = [
      { symbol: "USDC", name: "USD Coin", balance: 60_000, usdValue: 60_000, contractAddress: "0xa", isStablecoin: true },
      { symbol: "ETH", name: "Ether", balance: 10, usdValue: 40_000, contractAddress: "0xb", isStablecoin: false },
    ];
    const result = summarizeStablecoins(tokens, 100_001);
    expect(result.isTreasuryLike).toBe(true);
  });

  it("does NOT mark isTreasuryLike when netWorth <= 100k", () => {
    const tokens: TokenBalance[] = [
      { symbol: "USDC", name: "USD Coin", balance: 60_000, usdValue: 60_000, contractAddress: "0xa", isStablecoin: true },
      { symbol: "ETH", name: "Ether", balance: 5, usdValue: 30_000, contractAddress: "0xb", isStablecoin: false },
    ];
    const result = summarizeStablecoins(tokens, 90_000);
    expect(result.isTreasuryLike).toBe(false);
  });

  it("returns correct breakdown percentages that sum to 100", () => {
    const result = summarizeStablecoins(mockTokens, 165_000);
    const total = result.breakdown.reduce((s, b) => s + b.percentage, 0);
    expect(total).toBeCloseTo(100);
  });

  it("handles no stablecoin tokens", () => {
    const nonStables = mockTokens.filter(t => !t.isStablecoin);
    const result = summarizeStablecoins(nonStables, 95_000);
    expect(result.totalUsdValue).toBe(0);
    expect(result.portfolioPercentage).toBe(0);
    expect(result.breakdown).toEqual([]);
    expect(result.isTreasuryLike).toBe(false);
  });
});
