import type { TokenBalance, Transaction, NftSummary, NftCollection } from "../types";

const BASE_URL = "https://api.helius.xyz/v0";
const DAS_URL = "https://mainnet.helius-rpc.com";
const TIMEOUT_MS = 12_000;

// Known Solana stablecoin mint addresses
const SOLANA_STABLECOIN_MINTS = new Set([
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",  // USDT
  "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo", // PYUSD
  "EjmyN6qEC1Tf1JxiG1ae7UTJhUxSwk1TCWNWqxWV4J6o", // DAI (Portal)
  "USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX",  // USDH
]);

function apiKey(): string | undefined {
  return process.env.HELIUS_API_KEY;
}

function abortSignal(): AbortSignal {
  return AbortSignal.timeout(TIMEOUT_MS);
}

// ─── Token Balances ───────────────────────────────────────────────────────────

interface HeliusBalanceResponse {
  nativeBalance: number; // lamports
  tokens: Array<{
    mint: string;
    amount: number;
    decimals: number;
    tokenAccount: string;
    name?: string;
    symbol?: string;
    logoURI?: string;
  }>;
}

export async function getSolanaBalances(address: string): Promise<{
  nativeLamports: number;
  tokens: TokenBalance[];
}> {
  const key = apiKey();
  if (!key) {
    console.warn("[helius] No HELIUS_API_KEY — Solana balances unavailable");
    return { nativeLamports: 0, tokens: [] };
  }

  try {
    const res = await fetch(
      `${BASE_URL}/addresses/${address}/balances?api-key=${key}`,
      { headers: { accept: "application/json" }, signal: abortSignal() }
    );
    if (!res.ok) throw new Error(`Helius balances: ${res.status}`);

    const data = (await res.json()) as HeliusBalanceResponse;

    const tokens: TokenBalance[] = data.tokens
      .filter((t) => {
        const balance = t.amount / Math.pow(10, t.decimals);
        return balance >= 0.001;
      })
      .map((t) => ({
        symbol: t.symbol ?? t.mint.slice(0, 6),
        name: t.name ?? t.mint,
        balance: t.amount / Math.pow(10, t.decimals),
        usdValue: 0,
        contractAddress: t.mint,
        isStablecoin: SOLANA_STABLECOIN_MINTS.has(t.mint),
      }));

    return { nativeLamports: data.nativeBalance, tokens };
  } catch (err) {
    console.error("[helius] getSolanaBalances error:", err);
    return { nativeLamports: 0, tokens: [] };
  }
}

// ─── Transaction History ──────────────────────────────────────────────────────

interface HeliusTx {
  signature: string;
  timestamp: number;
  feePayer: string;
  type: string;
  source?: string;
}

export async function getSolanaTransactions(address: string): Promise<Transaction[]> {
  const key = apiKey();
  if (!key) return [];

  try {
    const res = await fetch(
      `${BASE_URL}/addresses/${address}/transactions?api-key=${key}&limit=50`,
      { headers: { accept: "application/json" }, signal: abortSignal() }
    );
    if (!res.ok) throw new Error(`Helius txs: ${res.status}`);

    const data = (await res.json()) as HeliusTx[];

    return data.map((tx) => ({
      hash: tx.signature,
      timestamp: tx.timestamp,
      from: tx.feePayer,
      to: "",
      value: "0",
      chain: "solana" as const,
      category: categorizeSolanaTx(tx.type),
    }));
  } catch (err) {
    console.error("[helius] getSolanaTransactions error:", err);
    return [];
  }
}

// ─── NFTs (DAS API) ───────────────────────────────────────────────────────────

interface DasAsset {
  id: string;
  grouping?: Array<{ group_key: string; group_value: string }>;
  content?: {
    files?: Array<{ uri?: string; cdn_uri?: string }>;
    metadata?: { name?: string };
  };
}

interface DasResponse {
  result?: {
    total: number;
    items: DasAsset[];
  };
}

export async function getSolanaNFTs(address: string): Promise<NftSummary> {
  const key = apiKey();
  if (!key) return { totalCount: 0, collections: [] };

  try {
    const res = await fetch(`${DAS_URL}/?api-key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "nft-query",
        method: "getAssetsByOwner",
        params: {
          ownerAddress: address,
          page: 1,
          limit: 100,
          displayOptions: { showFungible: false, showNativeBalance: false },
        },
      }),
      signal: abortSignal(),
    });

    if (!res.ok) throw new Error(`Helius DAS: ${res.status}`);
    const json = (await res.json()) as DasResponse;
    const result = json.result;
    if (!result) return { totalCount: 0, collections: [] };

    const collectionMap = new Map<string, NftCollection>();
    for (const asset of result.items) {
      const collKey =
        asset.grouping?.find((g) => g.group_key === "collection")?.group_value ??
        asset.id;
      const rawName = asset.content?.metadata?.name ?? "";
      // Strip trailing "#number" to get the collection name
      const name = rawName.replace(/\s*#\d+$/, "").trim() || "Unknown Collection";
      const imageUrl =
        asset.content?.files?.[0]?.cdn_uri ?? asset.content?.files?.[0]?.uri;

      if (!collectionMap.has(collKey)) {
        collectionMap.set(collKey, {
          contractAddress: collKey,
          name,
          count: 0,
          sampleImageUrl: imageUrl,
          tokenType: "ERC721",
        });
      }
      const col = collectionMap.get(collKey)!;
      col.count++;
      if (!col.sampleImageUrl) col.sampleImageUrl = imageUrl;
    }

    const collections = Array.from(collectionMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    return { totalCount: result.total, collections };
  } catch (err) {
    console.error("[helius] getSolanaNFTs error:", err);
    return { totalCount: 0, collections: [] };
  }
}

// ─── Wallet Age ───────────────────────────────────────────────────────────────

interface SignatureResult {
  signature: string;
  blockTime: number | null;
}

export async function getSolanaWalletAge(
  address: string
): Promise<{ walletAgeYears: number; firstTxTimestamp?: number } | null> {
  const key = apiKey();
  if (!key) return null;

  try {
    // Fetch up to 1000 signatures (RPC max per call). They arrive newest-first;
    // the last element in the array is the oldest known transaction.
    const res = await fetch(`${DAS_URL}/?api-key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "age-query",
        method: "getSignaturesForAddress",
        params: [address, { limit: 1000, commitment: "finalized" }],
      }),
      signal: abortSignal(),
    });

    if (!res.ok) throw new Error(`Helius signatures: ${res.status}`);
    const json = await res.json();
    const sigs = (json.result ?? []) as SignatureResult[];
    if (sigs.length === 0) return null;

    const oldest = sigs[sigs.length - 1];
    if (!oldest.blockTime) return null;

    const firstTxTimestamp = oldest.blockTime; // unix seconds
    const ageMs = Date.now() - firstTxTimestamp * 1000;
    const walletAgeYears = ageMs / (1000 * 60 * 60 * 24 * 365.25);

    return { walletAgeYears: Math.max(0, walletAgeYears), firstTxTimestamp };
  } catch (err) {
    console.error("[helius] getSolanaWalletAge error:", err);
    return null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function categorizeSolanaTx(type: string): Transaction["category"] {
  const t = type.toUpperCase();
  if (t.includes("SWAP") || t.includes("DEX") || t.includes("AMM")) return "defi";
  if (t.includes("BRIDGE")) return "bridge";
  if (t.includes("NFT") || t.includes("MINT")) return "nft";
  if (t.includes("TRANSFER")) return "transfer";
  return "other";
}
