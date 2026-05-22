import { Alchemy, Network, AssetTransfersCategory, SortingOrder, NftFilters } from "alchemy-sdk";
import type { TokenBalance, Transaction, SupportedChain, NftSummary, NftCollection } from "../types";

const STABLECOIN_SYMBOLS = new Set([
  "USDC", "USDT", "DAI", "BUSD", "FRAX", "LUSD", "USDB",
  "cUSDC", "aUSDC", "aUSDT", "sDAI", "PYUSD", "GUSD",
]);

function makeClient(network: Network): Alchemy {
  return new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY!,
    network,
  });
}

const clients: Record<Exclude<SupportedChain, "solana">, Alchemy> = {
  ethereum: makeClient(Network.ETH_MAINNET),
  base:     makeClient(Network.BASE_MAINNET),
  arbitrum: makeClient(Network.ARB_MAINNET),
};

// ─── Token Balances ──────────────────────────────────────────────────────────

export async function getTokenBalances(
  address: string,
  chain: Exclude<SupportedChain, "solana"> = "ethereum"
): Promise<TokenBalance[]> {
  const client = clients[chain];

  try {
    const response = await client.core.getTokenBalances(address);
    const metadataPromises = response.tokenBalances.map((t) =>
      client.core.getTokenMetadata(t.contractAddress)
    );
    const metadata = await Promise.allSettled(metadataPromises);

    const balances: TokenBalance[] = [];

    for (let i = 0; i < response.tokenBalances.length; i++) {
      const token = response.tokenBalances[i];
      const meta = metadata[i];
      if (meta.status !== "fulfilled") continue;

      const m = meta.value;
      const decimals = m.decimals ?? 18;
      const rawBalance = BigInt(token.tokenBalance ?? "0");
      const balance = Number(rawBalance) / Math.pow(10, decimals);

      if (balance < 0.001) continue; // skip dust

      const symbol = m.symbol ?? "UNKNOWN";

      balances.push({
        symbol,
        name: m.name ?? symbol,
        balance,
        usdValue: 0, // enriched later via CoinGecko
        contractAddress: token.contractAddress,
        isStablecoin: STABLECOIN_SYMBOLS.has(symbol.toUpperCase()),
      });
    }

    return balances;
  } catch (err) {
    console.error(`[alchemy] getTokenBalances error for ${chain}:`, err);
    return [];
  }
}

// ─── Transaction History ─────────────────────────────────────────────────────

export async function getTransactionHistory(
  address: string,
  chain: Exclude<SupportedChain, "solana"> = "ethereum",
  maxCount = 100
): Promise<Transaction[]> {
  const client = clients[chain];

  try {
    const response = await client.core.getAssetTransfers({
      fromAddress: address,
      category: [
        AssetTransfersCategory.EXTERNAL,
        AssetTransfersCategory.ERC20,
        AssetTransfersCategory.ERC721,
        AssetTransfersCategory.ERC1155,
        AssetTransfersCategory.INTERNAL,
      ],
      order: SortingOrder.DESCENDING,
      maxCount,
      withMetadata: true,
    });

    return response.transfers.map((t) => ({
      hash: t.hash,
      timestamp: t.metadata.blockTimestamp
        ? new Date(t.metadata.blockTimestamp).getTime() / 1000
        : 0,
      from: t.from,
      to: t.to ?? "",
      value: t.value?.toString() ?? "0",
      chain,
      category: categorizeTx(t),
    }));
  } catch (err) {
    console.error(`[alchemy] getTransactionHistory error for ${chain}:`, err);
    return [];
  }
}

// ─── Wallet Age ───────────────────────────────────────────────────────────────

export async function getWalletAge(
  address: string
): Promise<{ firstTxTimestamp: number; walletAgeYears: number } | null> {
  const client = clients["ethereum"];

  try {
    const response = await client.core.getAssetTransfers({
      toAddress: address,
      category: [AssetTransfersCategory.EXTERNAL],
      order: SortingOrder.ASCENDING,
      maxCount: 1,
      withMetadata: true,
    });

    if (!response.transfers.length) return null;

    const firstTs = new Date(
      response.transfers[0].metadata.blockTimestamp!
    ).getTime() / 1000;

    const nowSec = Date.now() / 1000;
    const walletAgeYears = (nowSec - firstTs) / (365.25 * 24 * 3600);

    return { firstTxTimestamp: firstTs, walletAgeYears };
  } catch {
    return null;
  }
}

// ─── ENS ─────────────────────────────────────────────────────────────────────

/** Reverse lookup: address → ENS name (e.g. "vitalik.eth") */
export async function resolveENS(address: string): Promise<string | undefined> {
  try {
    const name = await clients["ethereum"].core.lookupAddress(address);
    return name ?? undefined;
  } catch {
    return undefined;
  }
}

/** Forward lookup: ENS name → address (e.g. "vitalik.eth" → "0xd8da...") */
export async function resolveENSName(name: string): Promise<string | null> {
  try {
    const address = await clients["ethereum"].core.resolveName(name);
    return address ?? null;
  } catch {
    return null;
  }
}

// ─── Native Balance ───────────────────────────────────────────────────────────

/** Returns the native token balance (ETH, etc.) in human-readable units. */
export async function getNativeBalance(
  address: string,
  chain: Exclude<SupportedChain, "solana"> = "ethereum"
): Promise<number> {
  try {
    const balanceWei = await clients[chain].core.getBalance(address);
    return Number(balanceWei) / 1e18;
  } catch {
    return 0;
  }
}

// ─── NFT Holdings ────────────────────────────────────────────────────────────

export async function getNFTs(address: string): Promise<NftSummary> {
  const client = clients["ethereum"];
  try {
    const response = await client.nft.getNftsForOwner(address, {
      pageSize: 100,
      excludeFilters: [NftFilters.SPAM],
    });

    const collectionMap = new Map<string, NftCollection>();

    for (const nft of response.ownedNfts) {
      const addr = nft.contract.address.toLowerCase();
      const tokenType = nft.tokenType === "ERC1155" ? "ERC1155" as const : "ERC721" as const;
      const qty = nft.tokenType === "ERC1155" ? parseInt(nft.balance ?? "1", 10) : 1;

      if (!collectionMap.has(addr)) {
        collectionMap.set(addr, {
          contractAddress: addr,
          name: nft.contract.name ?? nft.contract.symbol ?? "Unknown Collection",
          count: 0,
          sampleImageUrl: nft.image?.thumbnailUrl ?? nft.image?.cachedUrl,
          tokenType,
        });
      }

      const col = collectionMap.get(addr)!;
      col.count += qty;
      if (!col.sampleImageUrl) {
        col.sampleImageUrl = nft.image?.thumbnailUrl ?? nft.image?.cachedUrl;
      }
    }

    const collections = Array.from(collectionMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    return { totalCount: response.totalCount, collections };
  } catch (err) {
    console.error("[alchemy] getNFTs error:", err);
    return { totalCount: 0, collections: [] };
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function categorizeTx(t: { asset?: string | null; to?: string | null }): Transaction["category"] {
  const asset = (t.asset ?? "").toUpperCase();
  if (STABLECOIN_SYMBOLS.has(asset)) return "defi";
  if (asset === "ETH" && !t.to) return "other";
  return "transfer";
}
