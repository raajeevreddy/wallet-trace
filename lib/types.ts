// ─── Wallet Identity ────────────────────────────────────────────────────────

export interface WalletIdentity {
  address: string;
  ens?: string;
  firstTxTimestamp?: number; // unix seconds
  walletAgeYears?: number;
}

// ─── Token & Asset ───────────────────────────────────────────────────────────

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  contractAddress: string;
  isStablecoin: boolean;
}

export interface StablecoinSummary {
  totalUsdValue: number;
  portfolioPercentage: number;
  breakdown: { symbol: string; usdValue: number; percentage: number }[];
  isTreasuryLike: boolean;
}

// ─── Transactions ────────────────────────────────────────────────────────────

export interface Transaction {
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  value: string;
  chain: SupportedChain;
  category?: "defi" | "transfer" | "bridge" | "nft" | "other";
}

// ─── Protocol Usage ──────────────────────────────────────────────────────────

export interface ProtocolInteraction {
  protocol: string;
  category: ProtocolCategory;
  interactionCount: number;
  chains: SupportedChain[];
  lastUsed?: number;
}

export type ProtocolCategory =
  | "lending"
  | "dex"
  | "yield"
  | "bridge"
  | "staking"
  | "perps"
  | "other";

// ─── Chain Usage ─────────────────────────────────────────────────────────────

export type SupportedChain = "ethereum" | "base" | "arbitrum" | "solana";

export interface ChainActivity {
  chain: SupportedChain;
  txCount: number;
  percentage: number;
  netWorthUsd: number;
}

// ─── Risk ────────────────────────────────────────────────────────────────────

export type RiskLevel = "low" | "medium" | "high";

export interface RiskProfile {
  concentrationRisk: RiskLevel;
  bridgeExposure: RiskLevel;
  protocolDiversification: RiskLevel;
  stablecoinDependence: RiskLevel;
  leverageIndicators: RiskLevel;
  smartContractRisk: RiskLevel;
  overallScore: number; // 0-100, higher = riskier
}

// ─── Behavioral Classification ───────────────────────────────────────────────

export type WalletTag =
  | "Yield Farmer"
  | "Treasury Wallet"
  | "Market Maker"
  | "Whale"
  | "Retail Trader"
  | "Long-Term Holder"
  | "Airdrop Hunter"
  | "DeFi Power User"
  | "Bridge User"
  | "NFT Collector";

export interface SophisticationScore {
  score: number; // 0-100
  label: "Novice" | "Intermediate" | "Advanced" | "Institutional";
  breakdown: {
    walletAge: number;
    protocolDiversity: number;
    transactionFrequency: number;
    multiChainActivity: number;
  };
}

// ─── AI Narrative ────────────────────────────────────────────────────────────

export interface AIAnalysis {
  summary: string;
  behaviorType: string;
  keyInsights: string[];
  riskFlags: string[];
  analystNote?: string;
}

// ─── Full Wallet Profile ─────────────────────────────────────────────────────

export interface WalletProfile {
  identity: WalletIdentity;
  netWorthUsd: number;
  totalTransactions: number;
  tokens: TokenBalance[];
  stablecoins: StablecoinSummary;
  protocols: ProtocolInteraction[];
  chains: ChainActivity[];
  risk: RiskProfile;
  tags: WalletTag[];
  sophistication: SophisticationScore;
  recentTransactions: Transaction[];
  analyzedAt: number; // unix ms
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface AnalysisResponse {
  profile: WalletProfile;
  narrative: AIAnalysis;
  cached: boolean;
  analysisMs: number;
}

export interface AnalysisError {
  error: string;
  code: "INVALID_ADDRESS" | "RATE_LIMIT" | "PROVIDER_ERROR" | "UNKNOWN";
}
