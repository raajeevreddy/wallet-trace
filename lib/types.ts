// ─── Wallet Identity ────────────────────────────────────────────────────────

export interface WalletIdentity {
  address: string;
  ens?: string;
  firstTxTimestamp?: number; // unix seconds
  walletAgeYears?: number;
}

// ─── Token & Asset ───────────────────────────────────────────────────────────

export interface NftCollection {
  contractAddress: string;
  name: string;
  count: number;
  sampleImageUrl?: string;
  tokenType: "ERC721" | "ERC1155";
}

export interface NftSummary {
  totalCount: number;
  collections: NftCollection[];
}

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

// ─── DeFi Positions ─────────────────────────────────────────────────────────

export interface DeFiPosition {
  protocol: string;
  positionType: "supply" | "borrow" | "lp";
  asset: string;
  asset2?: string;  // second token for LP positions
  amount: number;
  amount2?: number; // second token amount for LP positions
  usdValue: number;
  apy?: number;
}

export interface DeFiPortfolio {
  positions: DeFiPosition[];
  totalSuppliedUsd: number;
  totalBorrowedUsd: number;
  totalLpUsd: number;
}

// ─── Price History ───────────────────────────────────────────────────────────

export interface PricePoint {
  timestamp: number; // unix ms
  usdValue: number;
}

// ─── AI Narrative ────────────────────────────────────────────────────────────

export interface AIAnalysis {
  summary: string;
  behaviorType: string;
  keyInsights: string[];
  riskFlags: string[];
  analystNote?: string;
  isQuotaError?: boolean;
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
  nfts: NftSummary;
  defiPositions: DeFiPortfolio;
  netWorthHistory: PricePoint[];
  analyzedAt: number; // unix ms
}

// ─── Smart Wallet / ERC-4337 ─────────────────────────────────────────────────

export interface UserOperation {
  userOpHash: string;
  transactionHash: string;
  blockNumber: number;
  paymaster: string;      // "0x0000…" = self-paid
  paymasterName: string;  // human-readable label
  sponsored: boolean;     // true if paymaster != zero address
  factory: string;        // wallet factory (from initCode), empty if already deployed
  factoryName: string;
}

export interface PaymasterBreakdown {
  name: string;
  address: string;
  opsCount: number;
  percentage: number;
}

export interface SmartWalletProfile {
  address: string;
  isSmartWallet: boolean;     // has on-chain bytecode
  isERC4337: boolean;         // has UserOps via EntryPoint
  totalUserOps: number;
  sponsoredOps: number;       // ops where paymaster != zero
  selfPaidOps: number;
  factory: string;            // deploying factory address
  factoryName: string;        // human-readable
  paymasters: PaymasterBreakdown[];
  recentOps: UserOperation[];
  narrative: string;          // AI-generated summary
}

export interface SmartWalletResponse {
  data: SmartWalletProfile;
  analysisMs: number;
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
