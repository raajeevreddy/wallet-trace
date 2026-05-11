import type {
  WalletProfile,
  WalletTag,
  SophisticationScore,
  RiskProfile,
  RiskLevel,
  ProtocolInteraction,
  StablecoinSummary,
  TokenBalance,
  ChainActivity,
} from "./types";

// ─── Behavioral Tags ─────────────────────────────────────────────────────────

export function classifyTags(
  protocols: ProtocolInteraction[],
  stablecoins: StablecoinSummary,
  netWorthUsd: number,
  totalTransactions: number,
  walletAgeYears: number,
  chains: ChainActivity[]
): WalletTag[] {
  const tags: WalletTag[] = [];

  // Yield Farmer: heavy use of yield protocols
  const yieldProtocols = protocols.filter((p) =>
    ["yield", "lending"].includes(p.category)
  );
  if (yieldProtocols.length >= 2 || yieldProtocols.some((p) => p.interactionCount > 20)) {
    tags.push("Yield Farmer");
  }

  // Treasury Wallet: high stablecoin % + large balance
  if (stablecoins.portfolioPercentage > 50 && netWorthUsd > 100_000) {
    tags.push("Treasury Wallet");
  }

  // Whale: net worth over $1M
  if (netWorthUsd >= 1_000_000) {
    tags.push("Whale");
  }

  // DeFi Power User: 5+ protocols
  if (protocols.length >= 5) {
    tags.push("DeFi Power User");
  }

  // Bridge User: bridge interactions
  const hasBridge = protocols.some((p) => p.category === "bridge");
  const isMultiChain = chains.length >= 2;
  if (hasBridge || isMultiChain) {
    tags.push("Bridge User");
  }

  // Long-Term Holder: old wallet, low tx frequency
  const txPerYear = walletAgeYears > 0 ? totalTransactions / walletAgeYears : 0;
  if (walletAgeYears >= 3 && txPerYear < 100) {
    tags.push("Long-Term Holder");
  }

  // Retail Trader: low balance, high tx frequency, no DeFi
  if (
    netWorthUsd < 50_000 &&
    txPerYear > 200 &&
    protocols.every((p) => p.category !== "lending")
  ) {
    tags.push("Retail Trader");
  }

  // Market Maker: high DEX volume + perps
  const hasDex = protocols.some((p) => p.category === "dex");
  const hasPerps = protocols.some((p) => p.category === "perps");
  if (hasDex && hasPerps) {
    tags.push("Market Maker");
  }

  return [...new Set(tags)].slice(0, 4); // max 4 tags
}

// ─── Sophistication Score ─────────────────────────────────────────────────────

export function scoreSophistication(
  walletAgeYears: number,
  protocols: ProtocolInteraction[],
  totalTransactions: number,
  chains: ChainActivity[]
): SophisticationScore {
  // Wallet age: max 25 pts — saturates at 5 years
  const walletAge = Math.min(25, (walletAgeYears / 5) * 25);

  // Protocol diversity: max 35 pts — saturates at 10 unique protocols
  const protocolDiversity = Math.min(35, (protocols.length / 10) * 35);

  // Transaction frequency: max 20 pts — saturates at 500 txns
  const transactionFrequency = Math.min(20, (totalTransactions / 500) * 20);

  // Multi-chain: max 20 pts — full points at 3+ chains; 0 for single chain
  const multiChainActivity = Math.min(20, Math.max(0, ((chains.length - 1) / 2) * 20));

  const score = Math.round(
    walletAge + protocolDiversity + transactionFrequency + multiChainActivity
  );

  let label: SophisticationScore["label"] = "Novice";
  if (score >= 75) label = "Institutional";
  else if (score >= 50) label = "Advanced";
  else if (score >= 25) label = "Intermediate";

  return {
    score,
    label,
    breakdown: {
      walletAge: Math.round(walletAge),
      protocolDiversity: Math.round(protocolDiversity),
      transactionFrequency: Math.round(transactionFrequency),
      multiChainActivity: Math.round(multiChainActivity),
    },
  };
}

// ─── Risk Profile ─────────────────────────────────────────────────────────────

export function assessRisk(
  tokens: TokenBalance[],
  protocols: ProtocolInteraction[],
  stablecoins: StablecoinSummary,
  chains: ChainActivity[],
  netWorthUsd: number
): RiskProfile {
  // Concentration risk: top holding as % of portfolio
  const sortedByValue = [...tokens].sort((a, b) => b.usdValue - a.usdValue);
  const topHoldingPct =
    netWorthUsd > 0 && sortedByValue.length > 0
      ? sortedByValue[0].usdValue / netWorthUsd
      : 0;
  const concentrationRisk = riskLevel(topHoldingPct, 0.5, 0.75);

  // Bridge exposure
  const bridgeCount = protocols.filter((p) => p.category === "bridge").length;
  const bridgeExposure = riskLevel(bridgeCount, 2, 5);

  // Protocol diversification (inverse — more = lower risk)
  const protocolCount = protocols.length;
  const protocolDiversification =
    protocolCount >= 5 ? "low" : protocolCount >= 2 ? "medium" : "high";

  // Stablecoin dependence (medium risk on both ends: too high or too low)
  const stablePct = stablecoins.portfolioPercentage;
  const stablecoinDependence =
    stablePct > 90 || stablePct < 5 ? "high" : stablePct > 60 ? "medium" : "low";

  // Leverage indicators (look for perps)
  const hasLeverage = protocols.some((p) => p.category === "perps");
  const leverageIndicators: RiskLevel = hasLeverage ? "medium" : "low";

  // Smart contract risk (more protocols = more exposure)
  const smartContractRisk = riskLevel(protocolCount, 3, 8);

  const riskPoints: Record<RiskLevel, number> = { low: 0, medium: 1, high: 2 };
  const factors = [
    concentrationRisk,
    bridgeExposure,
    smartContractRisk,
    leverageIndicators,
  ];
  const rawScore = factors.reduce((s, f) => s + riskPoints[f], 0);
  const overallScore = Math.round((rawScore / (factors.length * 2)) * 100);

  return {
    concentrationRisk,
    bridgeExposure,
    protocolDiversification,
    stablecoinDependence,
    leverageIndicators,
    smartContractRisk,
    overallScore,
  };
}

// ─── Stablecoin Summary ───────────────────────────────────────────────────────

export function summarizeStablecoins(
  tokens: TokenBalance[],
  netWorthUsd: number
): StablecoinSummary {
  const stables = tokens.filter((t) => t.isStablecoin && t.usdValue > 0);
  const totalUsdValue = stables.reduce((s, t) => s + t.usdValue, 0);
  const portfolioPercentage = netWorthUsd > 0 ? (totalUsdValue / netWorthUsd) * 100 : 0;

  const breakdown = stables
    .sort((a, b) => b.usdValue - a.usdValue)
    .slice(0, 5)
    .map((t) => ({
      symbol: t.symbol,
      usdValue: t.usdValue,
      percentage: totalUsdValue > 0 ? (t.usdValue / totalUsdValue) * 100 : 0,
    }));

  return {
    totalUsdValue,
    portfolioPercentage,
    breakdown,
    isTreasuryLike: portfolioPercentage > 50 && netWorthUsd > 100_000,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function riskLevel(value: number, medThreshold: number, highThreshold: number): RiskLevel {
  if (value >= highThreshold) return "high";
  if (value >= medThreshold) return "medium";
  return "low";
}
