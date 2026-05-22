import type { DeFiPortfolio, DeFiPosition } from "../types";

const TIMEOUT_MS = 10_000;

// The Graph hosted-service endpoints (free, no key required)
const AAVE_V3_SUBGRAPH =
  "https://api.thegraph.com/subgraphs/name/aave/protocol-v3";
const UNISWAP_V3_SUBGRAPH =
  "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";

// ─── Generic GraphQL Query ────────────────────────────────────────────────────

async function querySubgraph<T>(url: string, query: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.warn(`[thegraph] ${url} responded ${res.status}`);
      return null;
    }
    const json = (await res.json()) as { data?: T; errors?: unknown[] };
    if (json.errors?.length) {
      console.warn("[thegraph] GraphQL errors:", json.errors);
      return null;
    }
    return json.data ?? null;
  } catch (err) {
    console.error(`[thegraph] querySubgraph error for ${url}:`, err);
    return null;
  }
}

// ─── Aave V3 ──────────────────────────────────────────────────────────────────

interface AaveUserReserves {
  userReserves: Array<{
    currentATokenBalance: string;
    currentVariableDebt: string;
    currentStableDebt: string;
    reserve: {
      symbol: string;
      decimals: string;
      priceInUSD: string;
    };
  }>;
}

async function getAavePositions(address: string): Promise<DeFiPosition[]> {
  const data = await querySubgraph<AaveUserReserves>(
    AAVE_V3_SUBGRAPH,
    `{
      userReserves(where: { user: "${address}" }, first: 50) {
        currentATokenBalance
        currentVariableDebt
        currentStableDebt
        reserve { symbol decimals priceInUSD }
      }
    }`
  );

  if (!data?.userReserves) return [];

  const positions: DeFiPosition[] = [];
  for (const ur of data.userReserves) {
    const decimals = parseInt(ur.reserve.decimals, 10);
    const priceUsd = parseFloat(ur.reserve.priceInUSD);
    const pow = Math.pow(10, decimals);

    const supplyAmt = parseFloat(ur.currentATokenBalance) / pow;
    const borrowAmt =
      (parseFloat(ur.currentVariableDebt) + parseFloat(ur.currentStableDebt)) /
      pow;

    if (supplyAmt > 0.0001) {
      positions.push({
        protocol: "Aave V3",
        positionType: "supply",
        asset: ur.reserve.symbol,
        amount: supplyAmt,
        usdValue: supplyAmt * priceUsd,
      });
    }
    if (borrowAmt > 0.0001) {
      positions.push({
        protocol: "Aave V3",
        positionType: "borrow",
        asset: ur.reserve.symbol,
        amount: borrowAmt,
        usdValue: borrowAmt * priceUsd,
      });
    }
  }
  return positions;
}

// ─── Uniswap V3 ───────────────────────────────────────────────────────────────

interface UniswapPositionsData {
  positions: Array<{
    id: string;
    token0: { symbol: string };
    token1: { symbol: string };
    depositedToken0: string;
    depositedToken1: string;
    withdrawnToken0: string;
    withdrawnToken1: string;
    pool: { token0Price: string };
  }>;
}

async function getUniswapPositions(address: string): Promise<DeFiPosition[]> {
  const data = await querySubgraph<UniswapPositionsData>(
    UNISWAP_V3_SUBGRAPH,
    `{
      positions(where: { owner: "${address}", liquidity_gt: "0" }, first: 20) {
        id
        token0 { symbol }
        token1 { symbol }
        depositedToken0
        depositedToken1
        withdrawnToken0
        withdrawnToken1
        pool { token0Price }
      }
    }`
  );

  if (!data?.positions) return [];

  return data.positions
    .map((pos) => {
      const amt0 =
        parseFloat(pos.depositedToken0) - parseFloat(pos.withdrawnToken0);
      const amt1 =
        parseFloat(pos.depositedToken1) - parseFloat(pos.withdrawnToken1);
      // Approximate USD using token0Price (token1 per token0), treat token1 as base
      const price0 = parseFloat(pos.pool.token0Price);
      const usdValue = Math.max(0, amt0 * price0 + amt1);

      return {
        protocol: "Uniswap V3",
        positionType: "lp" as const,
        asset: pos.token0.symbol,
        asset2: pos.token1.symbol,
        amount: Math.max(0, amt0),
        amount2: Math.max(0, amt1),
        usdValue,
      };
    })
    .filter((p) => p.amount > 0 || (p.amount2 ?? 0) > 0);
}

// ─── Public Entry Point ───────────────────────────────────────────────────────

export async function getTheGraphDeFiPositions(
  address: string
): Promise<DeFiPortfolio> {
  const [aavePositions, uniswapPositions] = await Promise.all([
    getAavePositions(address).catch(() => [] as DeFiPosition[]),
    getUniswapPositions(address).catch(() => [] as DeFiPosition[]),
  ]);

  const positions = [...aavePositions, ...uniswapPositions];

  const totalSuppliedUsd = positions
    .filter((p) => p.positionType === "supply")
    .reduce((s, p) => s + p.usdValue, 0);
  const totalBorrowedUsd = positions
    .filter((p) => p.positionType === "borrow")
    .reduce((s, p) => s + p.usdValue, 0);
  const totalLpUsd = positions
    .filter((p) => p.positionType === "lp")
    .reduce((s, p) => s + p.usdValue, 0);

  return { positions, totalSuppliedUsd, totalBorrowedUsd, totalLpUsd };
}
