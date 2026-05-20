import { getTokenBalances, getTransactionHistory, getWalletAge, resolveENS, getNativeBalance } from "./providers/alchemy";
import { getProtocolList, getTotalBalance } from "./providers/debank";
import { getFirstTransactionTimestamp } from "./providers/etherscan";
import { enrichTokenPrices, fetchNativeTokenPrice } from "./providers/coingecko";
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
} from "./types";

const CHAINS_TO_SCAN: SupportedChain[] = ["ethereum", "base", "arbitrum"];

// ─── Address Validation ────────────────────────────────────────────────────────

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// ─── Main Orchestrator ────────────────────────────────────────────────────────

export async function buildWalletProfile(address: string): Promise<WalletProfile> {
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

  // Fetch native ETH balance + price and ERC-20 token balances in parallel
  const [nativeBalance, ethPrice, rawTokens] = await Promise.all([
    getNativeBalance(address, "ethereum").catch(() => 0),
    fetchNativeTokenPrice("ethereum").catch(() => 0),
    getTokenBalances(address, "ethereum").catch(() => [] as TokenBalance[]),
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

  // Net worth — use DeBank if available, otherwise sum enriched token values
  const netWorthUsd =
    debankData.netWorthUsd > 0
      ? debankData.netWorthUsd
      : tokens.reduce((s, t) => s + t.usdValue, 0);

  // Stablecoin analysis
  const stablecoins = summarizeStablecoins(tokens, netWorthUsd);

  // Chain activity — merge DeBank data with Alchemy tx counts
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
    analyzedAt: Date.now(),
  };

  console.log(`[orchestrator] Analysis complete in ${Date.now() - start}ms`);
  return profile;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
