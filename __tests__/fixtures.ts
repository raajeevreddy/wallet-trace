import type {
  WalletProfile,
  ProtocolInteraction,
  TokenBalance,
  ChainActivity,
  StablecoinSummary,
  NftSummary,
  DeFiPortfolio,
  PricePoint,
} from "../lib/types";

export const mockTokens: TokenBalance[] = [
  { symbol: "ETH", name: "Ether", balance: 10, usdValue: 30_000, contractAddress: "0xeeee", isStablecoin: false },
  { symbol: "USDC", name: "USD Coin", balance: 50_000, usdValue: 50_000, contractAddress: "0xa0b8", isStablecoin: true },
  { symbol: "USDT", name: "Tether", balance: 20_000, usdValue: 20_000, contractAddress: "0xdac1", isStablecoin: true },
  { symbol: "WBTC", name: "Wrapped Bitcoin", balance: 1, usdValue: 65_000, contractAddress: "0x2260", isStablecoin: false },
];

export const mockProtocols: ProtocolInteraction[] = [
  { protocol: "Aave V3", category: "lending", interactionCount: 47, chains: ["ethereum"] },
  { protocol: "Uniswap V3", category: "dex", interactionCount: 31, chains: ["ethereum", "arbitrum"] },
  { protocol: "Pendle", category: "yield", interactionCount: 24, chains: ["ethereum"] },
  { protocol: "MakerDAO", category: "lending", interactionCount: 18, chains: ["ethereum"] },
  { protocol: "Hop Bridge", category: "bridge", interactionCount: 11, chains: ["ethereum", "base"] },
  { protocol: "Lido", category: "staking", interactionCount: 8, chains: ["ethereum"] },
];

export const mockChains: ChainActivity[] = [
  { chain: "ethereum", txCount: 300, percentage: 75, netWorthUsd: 120_000 },
  { chain: "arbitrum", txCount: 80, percentage: 20, netWorthUsd: 30_000 },
  { chain: "base", txCount: 20, percentage: 5, netWorthUsd: 15_000 },
];

export const mockStablecoins: StablecoinSummary = {
  totalUsdValue: 70_000,
  portfolioPercentage: 42,
  breakdown: [
    { symbol: "USDC", usdValue: 50_000, percentage: 71.4 },
    { symbol: "USDT", usdValue: 20_000, percentage: 28.6 },
  ],
  isTreasuryLike: false,
};

export const mockNfts: NftSummary = {
  totalCount: 5,
  collections: [
    {
      contractAddress: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
      name: "Bored Ape Yacht Club",
      count: 2,
      sampleImageUrl: "https://example.com/bayc.png",
      tokenType: "ERC721",
    },
    {
      contractAddress: "0x60e4d786628fea6478f785a6d7e704777c86a7c6",
      name: "Mutant Ape Yacht Club",
      count: 3,
      sampleImageUrl: undefined,
      tokenType: "ERC721",
    },
  ],
};

export const mockDefiPortfolio: DeFiPortfolio = {
  positions: [
    { protocol: "Aave V3", positionType: "supply", asset: "USDC", amount: 50_000, usdValue: 50_000 },
    { protocol: "Aave V3", positionType: "borrow", asset: "ETH", amount: 2, usdValue: 6_000 },
    { protocol: "Uniswap V3", positionType: "lp", asset: "ETH", asset2: "USDC", amount: 1, amount2: 3_000, usdValue: 6_000 },
  ],
  totalSuppliedUsd: 50_000,
  totalBorrowedUsd: 6_000,
  totalLpUsd: 6_000,
};

export const mockNetWorthHistory: PricePoint[] = [
  { timestamp: Date.now() - 30 * 86_400_000, usdValue: 150_000 },
  { timestamp: Date.now() - 20 * 86_400_000, usdValue: 160_000 },
  { timestamp: Date.now() - 10 * 86_400_000, usdValue: 155_000 },
  { timestamp: Date.now(), usdValue: 165_000 },
];

export const mockProfile: WalletProfile = {
  identity: {
    address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    ens: "vitalik.eth",
    firstTxTimestamp: 1438214400,
    walletAgeYears: 9,
  },
  netWorthUsd: 165_000,
  totalTransactions: 400,
  tokens: mockTokens,
  stablecoins: mockStablecoins,
  protocols: mockProtocols,
  chains: mockChains,
  risk: {
    concentrationRisk: "medium",
    bridgeExposure: "low",
    protocolDiversification: "low",
    stablecoinDependence: "low",
    leverageIndicators: "low",
    smartContractRisk: "medium",
    overallScore: 25,
  },
  tags: ["DeFi Power User", "Bridge User"],
  sophistication: {
    score: 80,
    label: "Institutional",
    breakdown: { walletAge: 25, protocolDiversity: 21, transactionFrequency: 16, multiChainActivity: 20 },
  },
  recentTransactions: [],
  nfts: mockNfts,
  defiPositions: mockDefiPortfolio,
  netWorthHistory: mockNetWorthHistory,
  analyzedAt: Date.now(),
};
