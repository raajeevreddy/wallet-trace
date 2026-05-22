import { getTheGraphDeFiPositions } from "../../../lib/providers/thegraph";

const mockFetch = jest.fn();
global.fetch = mockFetch;

const ETH_ADDR = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";

function mockOk(data: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: jest.fn().mockResolvedValue(data),
  });
}

function mockErr(status = 500) {
  mockFetch.mockResolvedValueOnce({ ok: false, status });
}

function aaveResponse(userReserves: unknown[]) {
  return { data: { userReserves } };
}

function uniswapResponse(positions: unknown[]) {
  return { data: { positions } };
}

beforeEach(() => jest.clearAllMocks());

describe("getTheGraphDeFiPositions", () => {
  it("returns empty portfolio when both subgraphs fail", async () => {
    mockErr(); // Aave
    mockErr(); // Uniswap
    const result = await getTheGraphDeFiPositions(ETH_ADDR);
    expect(result.positions).toHaveLength(0);
    expect(result.totalSuppliedUsd).toBe(0);
    expect(result.totalBorrowedUsd).toBe(0);
    expect(result.totalLpUsd).toBe(0);
  });

  it("returns empty portfolio when subgraphs return GraphQL errors", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ errors: [{ message: "subgraph error" }] }),
    });
    const result = await getTheGraphDeFiPositions(ETH_ADDR);
    expect(result.positions).toHaveLength(0);
  });

  it("parses Aave V3 supply positions correctly", async () => {
    mockOk(aaveResponse([
      {
        currentATokenBalance: "1000000000", // 1000 USDC (6 decimals)
        currentVariableDebt: "0",
        currentStableDebt: "0",
        reserve: { symbol: "USDC", decimals: "6", priceInUSD: "1" },
      },
    ]));
    mockOk(uniswapResponse([]));

    const result = await getTheGraphDeFiPositions(ETH_ADDR);
    expect(result.positions).toHaveLength(1);
    expect(result.positions[0]).toMatchObject({
      protocol: "Aave V3",
      positionType: "supply",
      asset: "USDC",
      amount: 1000,
      usdValue: 1000,
    });
    expect(result.totalSuppliedUsd).toBe(1000);
  });

  it("parses Aave V3 borrow positions correctly", async () => {
    mockOk(aaveResponse([
      {
        currentATokenBalance: "0",
        currentVariableDebt: "2000000000000000000", // 2 ETH (18 decimals)
        currentStableDebt: "0",
        reserve: { symbol: "WETH", decimals: "18", priceInUSD: "3000" },
      },
    ]));
    mockOk(uniswapResponse([]));

    const result = await getTheGraphDeFiPositions(ETH_ADDR);
    expect(result.positions).toHaveLength(1);
    expect(result.positions[0]).toMatchObject({
      protocol: "Aave V3",
      positionType: "borrow",
      asset: "WETH",
      amount: 2,
      usdValue: 6000,
    });
    expect(result.totalBorrowedUsd).toBe(6000);
  });

  it("sums variable and stable debt for borrow position", async () => {
    mockOk(aaveResponse([
      {
        currentATokenBalance: "0",
        currentVariableDebt: "500000000", // 500 USDC
        currentStableDebt: "500000000",  // 500 USDC
        reserve: { symbol: "USDC", decimals: "6", priceInUSD: "1" },
      },
    ]));
    mockOk(uniswapResponse([]));

    const result = await getTheGraphDeFiPositions(ETH_ADDR);
    expect(result.positions[0].amount).toBeCloseTo(1000, 0);
    expect(result.positions[0].usdValue).toBeCloseTo(1000, 0);
  });

  it("skips Aave positions below dust threshold", async () => {
    mockOk(aaveResponse([
      {
        currentATokenBalance: "1",       // 0.000001 USDC — below 0.0001 threshold
        currentVariableDebt: "0",
        currentStableDebt: "0",
        reserve: { symbol: "USDC", decimals: "6", priceInUSD: "1" },
      },
    ]));
    mockOk(uniswapResponse([]));

    const result = await getTheGraphDeFiPositions(ETH_ADDR);
    expect(result.positions).toHaveLength(0);
  });

  it("parses Uniswap V3 LP positions correctly", async () => {
    mockOk(aaveResponse([]));
    mockOk(uniswapResponse([
      {
        id: "1",
        token0: { symbol: "ETH" },
        token1: { symbol: "USDC" },
        depositedToken0: "2",
        depositedToken1: "6000",
        withdrawnToken0: "0",
        withdrawnToken1: "0",
        pool: { token0Price: "3000" }, // 1 ETH = 3000 USDC
      },
    ]));

    const result = await getTheGraphDeFiPositions(ETH_ADDR);
    expect(result.positions).toHaveLength(1);
    expect(result.positions[0]).toMatchObject({
      protocol: "Uniswap V3",
      positionType: "lp",
      asset: "ETH",
      asset2: "USDC",
      amount: 2,
      amount2: 6000,
    });
    expect(result.totalLpUsd).toBeGreaterThan(0);
  });

  it("filters Uniswap positions where net amounts are zero", async () => {
    mockOk(aaveResponse([]));
    mockOk(uniswapResponse([
      {
        id: "2",
        token0: { symbol: "ETH" },
        token1: { symbol: "DAI" },
        depositedToken0: "1",
        depositedToken1: "3000",
        withdrawnToken0: "1", // fully withdrawn
        withdrawnToken1: "3000",
        pool: { token0Price: "3000" },
      },
    ]));

    const result = await getTheGraphDeFiPositions(ETH_ADDR);
    expect(result.positions).toHaveLength(0);
  });

  it("combines Aave and Uniswap positions", async () => {
    mockOk(aaveResponse([
      {
        currentATokenBalance: "1000000000",
        currentVariableDebt: "0",
        currentStableDebt: "0",
        reserve: { symbol: "USDC", decimals: "6", priceInUSD: "1" },
      },
    ]));
    mockOk(uniswapResponse([
      {
        id: "3",
        token0: { symbol: "ETH" },
        token1: { symbol: "USDC" },
        depositedToken0: "1",
        depositedToken1: "3000",
        withdrawnToken0: "0",
        withdrawnToken1: "0",
        pool: { token0Price: "3000" },
      },
    ]));

    const result = await getTheGraphDeFiPositions(ETH_ADDR);
    expect(result.positions).toHaveLength(2);
    expect(result.totalSuppliedUsd).toBe(1000);
    expect(result.totalLpUsd).toBeGreaterThan(0);
  });

  it("returns empty when Uniswap returns null result", async () => {
    mockOk(aaveResponse([]));
    mockOk({ data: { positions: null } });

    const result = await getTheGraphDeFiPositions(ETH_ADDR);
    expect(result.positions).toHaveLength(0);
  });

  it("handles fetch network errors gracefully", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));
    const result = await getTheGraphDeFiPositions(ETH_ADDR);
    expect(result.positions).toHaveLength(0);
    expect(result.totalSuppliedUsd).toBe(0);
  });
});
