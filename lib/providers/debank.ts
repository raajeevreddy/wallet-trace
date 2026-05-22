import axios from "axios";
import type { ProtocolInteraction, SupportedChain, ChainActivity } from "../types";

const BASE_URL = "https://pro-openapi.debank.com/v1";
const CHAIN_IDS: Record<SupportedChain, string> = {
  ethereum: "eth",
  base: "base",
  arbitrum: "arb",
  solana: "sol",
};

function headers() {
  return {
    AccessKey: process.env.DEBANK_API_KEY!,
    accept: "application/json",
  };
}

// ─── Protocol List ────────────────────────────────────────────────────────────

export interface DebankProtocol {
  id: string;
  name: string;
  chain: string;
  net_usd_value: number;
  portfolio_item_list: unknown[];
}

export async function getProtocolList(
  address: string
): Promise<ProtocolInteraction[]> {
  if (!process.env.DEBANK_API_KEY) return [];

  try {
    const { data } = await axios.get<DebankProtocol[]>(
      `${BASE_URL}/user/all_complex_protocol_list`,
      {
        headers: headers(),
        params: { id: address },
        timeout: 10_000,
      }
    );

    return data.map((p) => ({
      protocol: p.name,
      category: inferProtocolCategory(p.name),
      interactionCount: p.portfolio_item_list.length,
      chains: [chainIdToSupported(p.chain)].filter(Boolean) as SupportedChain[],
    }));
  } catch (err) {
    console.error("[debank] getProtocolList error:", err);
    return [];
  }
}

// ─── Total Balance ────────────────────────────────────────────────────────────

export async function getTotalBalance(
  address: string
): Promise<{ netWorthUsd: number; chains: ChainActivity[] }> {
  if (!process.env.DEBANK_API_KEY) {
    return { netWorthUsd: 0, chains: [] };
  }

  try {
    const { data } = await axios.get<{ usd_value: number }>(
      `${BASE_URL}/user/total_balance`,
      {
        headers: headers(),
        params: { id: address },
        timeout: 10_000,
      }
    );

    // Also fetch per-chain breakdown
    const { data: chains } = await axios.get<
      { id: string; usd_value: number }[]
    >(`${BASE_URL}/user/chain_balance`, {
      headers: headers(),
      params: { id: address },
      timeout: 10_000,
    });

    const total = data.usd_value;

    const chainActivities: ChainActivity[] = chains
      .filter((c) => c.usd_value > 0)
      .map((c) => ({
        chain: chainIdToSupported(c.id) ?? "ethereum",
        txCount: 0, // enriched by alchemy
        percentage: total > 0 ? (c.usd_value / total) * 100 : 0,
        netWorthUsd: c.usd_value,
      }));

    return { netWorthUsd: total, chains: chainActivities };
  } catch (err) {
    console.error("[debank] getTotalBalance error:", err);
    return { netWorthUsd: 0, chains: [] };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
// DeBank is optional — the app runs fully without it. Net worth and chain
// activity are derived from Alchemy + CoinGecko when no key is set.
// ─────────────────────────────────────────────────────────────────────────────

function chainIdToSupported(id: string): SupportedChain | undefined {
  const map: Record<string, SupportedChain> = {
    eth: "ethereum",
    base: "base",
    arb: "arbitrum",
    sol: "solana",
  };
  return map[id];
}

function inferProtocolCategory(name: string): ProtocolInteraction["category"] {
  const n = name.toLowerCase();
  if (/aave|compound|maker|spark/.test(n)) return "lending";
  if (/uniswap|curve|balancer|sushi|1inch/.test(n)) return "dex";
  if (/pendle|yearn|convex|beefy/.test(n)) return "yield";
  if (/bridge|hop|across|stargate|synapse/.test(n)) return "bridge";
  if (/lido|rocketpool|eigenlayer/.test(n)) return "staking";
  if (/hyperliquid|gmx|dydx|perp/.test(n)) return "perps";
  return "other";
}

