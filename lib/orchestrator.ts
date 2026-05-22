import { getTokenBalances, getTransactionHistory, getWalletAge, resolveENS, getNativeBalance, getNFTs } from "./providers/alchemy";
import { getProtocolList, getTotalBalance } from "./providers/debank";
import { getFirstTransactionTimestamp } from "./providers/etherscan";
import { enrichTokenPrices, fetchNativeTokenPrice, fetchPriceHistory } from "./providers/coingecko";
import { getSolanaBalances, getSolanaTransactions, getSolanaNFTs, getSolanaWalletAge } from "./providers/helius";
import { getTheGraphDeFiPositions } from "./providers/thegraph";
import {
  classifyTags,
  scoreSophistication,
  assessRisk,
  summarizeStablecoins,
} from "./classifiers";
import type {
  WalletProfile,
  TokenBalance,
  ChainActivity,
  ProtocolInteraction,
  SupportedChain,
  PricePoint,
} from "./types";

const CHAINS_TO_SCAN: Exclude<SupportedChain, "solana">[] = ["ethereum", "base", "arbitrum"];

// ─── Address Validation ────────────────────────────────────────────────────────

export function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address) || isValidSolanaAddress(address);
}

// ─── Solana Profile ───────────────────────────────────────────────────────────

async function buildSolanaProfile(address: string): Promise<WalletProfile> {
  const [{ nativeLamports, tokens: splTokens }, transactions, nfts, solPrice, ageData, priceHistory] =
    await Promise.all([
      getSolanaBalances(address).catch(() => ({ nativeLamports: 0, tokens: [] as TokenBalance[] })),
      getSolanaTransactions(address).catch(() => []),
      getSolanaNFTs(address).catch(() => ({ totalCount: 0, collections: [] })),
      fetchNativeTokenPrice("solana").catch(() => 0),
      getSolanaWalletAge(address).catch(() => null),
      fetchPriceHistory("solana", 30).catch(() => []),
    ]);

  const nativeSol = nativeLamports / 1e9;
  const solToken: TokenBalance | null =
    nativeSol >= 0.001
      ? { symbol: "SOL", name: "Solana", balance: nativeSol, usdValue: nativeSol * solPrice, contractAddress: "native", isStablecoin: false }
      : null;

  const enrichedSpl = await enrichTokenPrices(splTokens, "solana").catch(() => splTokens);
  const tokens: TokenBalance[] = solToken ? [solToken, ...enrichedSpl] : enrichedSpl;
  const netWorthUsd = tokens.reduce((s, t) => s + t.usdValue, 0);
  const stablecoins = summarizeStablecoins(tokens, netWorthUsd);
  const chains: ChainActivity[] = [{ chain: "solana", txCount: transactions.length, percentage: 100, netWorthUsd }];
  const protocols: ProtocolInteraction[] = [];
  const walletAgeYears = ageData?.walletAgeYears ?? 0;
  const firstTxTimestamp = ageData?.firstTxTimestamp;
  const tags = classifyTags(protocols, stablecoins, netWorthUsd, transactions.length, walletAgeYears, chains);
  const sophistication = scoreSophistication(walletAgeYears, protocols, transactions.length, chains);
  const risk = assessRisk(tokens, protocols, stablecoins, chains, netWorthUsd);
  const stablecoinUsd = stablecoins.totalUsdValue;
  const netWorthHistory = buildNetWorthHistory(priceHistory, nativeSol, stablecoinUsd);

  return {
    identity: { address, walletAgeYears, firstTxTimestamp },
    netWorthUsd,
    totalTransactions: transactions.length,
    tokens: tokens.slice(0, 20),
    stablecoins,
    protocols,
    chains,
    risk,
    tags,
    sophistication,
    recentTransactions: transactions.slice(0, 20),
    nfts,
    defiPositions: { positions: [], totalSuppliedUsd: 0, totalBorrowedUsd: 0, totalLpUsd: 0 },
    netWorthHistory,
    analyzedAt: Date.now(),
  };
}

// ─── Main Orchestrator ────────────────────────────────────────────────────────

export async function buildWalletProfile(address: string): Promise<WalletProfile> {
  if (isValidSolanaAddress(address)) {
    console.log(`[orchestrator] Solana address detected — using Helius`);
    return buildSolanaProfile(address);
  }
  console.log(`[orchestrator] Starting analysis for ${address}`);
  const start = Date.now();

  // Fetch all data in parallel
  const [
    alchemyAge,
    etherscanAge,
    ens,
    debankData,
    protocols,
    ...chainData
  ] = await Promise.all([
    getWalletAge(address).catch(() => null),
    getFirstTransactionTimestamp(address).catch(() => null),
    resolveENS(address).catch(() => undefined),
    getTotalBalance(address).catch(() => ({ netWorthUsd: 0, chains: [] as ChainActivity[] })),
    getProtocolList(address).catch(() => [] as ProtocolInteraction[]),
    // Fetch transactions per chain in parallel
    ...CHAINS_TO_SCAN.map((chain) =>
      getTransactionHistory(address, chain, 50).catch(() => [])
    ),
  ]);

  // Collect transactions from all chains
  const allTransactions = chainData.flat();

  // Fetch native ETH balance + price, ERC-20 balances, NFTs, DeFi positions, and price history in parallel
  const [nativeBalance, ethPrice, rawTokens, nfts, defiPositions, priceHistory] = await Promise.all([
    getNativeBalance(address, "ethereum").catch(() => 0),
    fetchNativeTokenPrice("ethereum").catch(() => 0),
    getTokenBalances(address, "ethereum").catch(() => [] as TokenBalance[]),
    getNFTs(address).catch(() => ({ totalCount: 0, collections: [] })),
    getTheGraphDeFiPositions(address).catch(() => ({ positions: [], totalSuppliedUsd: 0, totalBorrowedUsd: 0, totalLpUsd: 0 })),
    fetchPriceHistory("ethereum", 30).catch(() => []),
  ]);

  // Prepend native ETH as a token entry if the wallet holds any
  const nativeToken: TokenBalance | null =
    nativeBalance >= 0.0001
      ? {
          symbol: "ETH",
          name: "Ether",
          balance: nativeBalance,
          usdValue: nativeBalance * ethPrice,
          contractAddress: "native",
          isStablecoin: false,
        }
      : null;

  const enrichedErc20 = await enrichTokenPrices(rawTokens).catch(() => rawTokens);
  const tokens: TokenBalance[] = nativeToken
    ? [nativeToken, ...enrichedErc20]
    : enrichedErc20;

  // Resolve wallet age (prefer Alchemy, fallback to Etherscan)
  const ageData = alchemyAge ?? etherscanAge;
  const walletAgeYears = ageData?.walletAgeYears ?? 0;
  const firstTxTimestamp = ageData?.firstTxTimestamp;

  // Net worth — DeBank if key is set, otherwise sum Alchemy + CoinGecko token values
  const netWorthUsd =
    debankData.netWorthUsd > 0
      ? debankData.netWorthUsd
      : tokens.reduce((s, t) => s + t.usdValue, 0);

  // Net worth history (approximate: current ETH balance × historical price + stablecoins)
  const stablecoinUsd = tokens
    .filter((t) => t.isStablecoin)
    .reduce((s, t) => s + t.usdValue, 0);
  const netWorthHistory = buildNetWorthHistory(priceHistory, nativeBalance, stablecoinUsd);

  // Stablecoin analysis
  const stablecoins = summarizeStablecoins(tokens, netWorthUsd);

  // Chain activity — from DeBank if key is set, otherwise derived from Alchemy tx history
  const chains: ChainActivity[] =
    debankData.chains.length > 0
      ? debankData.chains
      : buildChainActivityFromTxs(allTransactions);

  // Total transactions (sum across chains)
  const totalTransactions = allTransactions.length;

  // Classification
  const tags = classifyTags(
    protocols,
    stablecoins,
    netWorthUsd,
    totalTransactions,
    walletAgeYears,
    chains
  );

  const sophistication = scoreSophistication(
    walletAgeYears,
    protocols,
    totalTransactions,
    chains
  );

  const risk = assessRisk(tokens, protocols, stablecoins, chains, netWorthUsd);

  const profile: WalletProfile = {
    identity: {
      address,
      ens,
      firstTxTimestamp,
      walletAgeYears,
    },
    netWorthUsd,
    totalTransactions,
    tokens: tokens.slice(0, 20), // top 20 tokens
    stablecoins,
    protocols,
    chains,
    risk,
    tags,
    sophistication,
    recentTransactions: allTransactions.slice(0, 20),
    nfts,
    defiPositions,
    netWorthHistory,
    analyzedAt: Date.now(),
  };

  console.log(`[orchestrator] Analysis complete in ${Date.now() - start}ms`);
  return profile;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Approximate portfolio value history: multiply current native balance by each
 * day's historical price and add a fixed stablecoin component.
 * Labelled "approximate" in the UI because balances change over time.
 */
function buildNetWorthHistory(
  priceHistory: { timestamp: number; price: number }[],
  nativeBalance: number,
  stablecoinUsd: number
): PricePoint[] {
  return priceHistory.map(({ timestamp, price }) => ({
    timestamp,
    usdValue: nativeBalance * price + stablecoinUsd,
  }));
}

function buildChainActivityFromTxs(
  txs: { chain: SupportedChain }[]
): ChainActivity[] {
  const counts: Partial<Record<SupportedChain, number>> = {};
  for (const tx of txs) {
    counts[tx.chain] = (counts[tx.chain] ?? 0) + 1;
  }
  const total = txs.length || 1;
  return Object.entries(counts).map(([chain, count]) => ({
    chain: chain as SupportedChain,
    txCount: count,
    percentage: (count / total) * 100,
    netWorthUsd: 0,
  }));
}
