import { getProtocolList, getTotalBalance } from "../../../lib/providers/debank";

jest.mock("axios");
const axios = require("axios");

const ADDR = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";

function mockGet(data: unknown) {
  axios.get.mockResolvedValueOnce({ data });
}

function mockGetErr(err = new Error("network error")) {
  axios.get.mockRejectedValueOnce(err);
}

beforeEach(() => {
  jest.clearAllMocks();
  delete process.env.DEBANK_API_KEY;
});

// ─── getProtocolList ──────────────────────────────────────────────────────────

describe("getProtocolList", () => {
  it("returns empty array when no API key is set", async () => {
    const result = await getProtocolList(ADDR);
    expect(result).toEqual([]);
    expect(axios.get).not.toHaveBeenCalled();
  });

  it("maps DeBank protocol data to ProtocolInteraction shape", async () => {
    process.env.DEBANK_API_KEY = "test-key";
    mockGet([
      { id: "aave3", name: "Aave V3", chain: "eth", net_usd_value: 10_000, portfolio_item_list: [{}, {}] },
    ]);
    const result = await getProtocolList(ADDR);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      protocol: "Aave V3",
      category: "lending",
      interactionCount: 2,
      chains: ["ethereum"],
    });
  });

  it("infers category: dex for Uniswap", async () => {
    process.env.DEBANK_API_KEY = "test-key";
    mockGet([{ id: "uni3", name: "Uniswap V3", chain: "eth", net_usd_value: 0, portfolio_item_list: [{}] }]);
    const result = await getProtocolList(ADDR);
    expect(result[0].category).toBe("dex");
  });

  it("infers category: yield for Pendle", async () => {
    process.env.DEBANK_API_KEY = "test-key";
    mockGet([{ id: "pendle", name: "Pendle", chain: "eth", net_usd_value: 0, portfolio_item_list: [] }]);
    const result = await getProtocolList(ADDR);
    expect(result[0].category).toBe("yield");
  });

  it("infers category: bridge for Hop", async () => {
    process.env.DEBANK_API_KEY = "test-key";
    mockGet([{ id: "hop", name: "Hop Bridge", chain: "eth", net_usd_value: 0, portfolio_item_list: [] }]);
    const result = await getProtocolList(ADDR);
    expect(result[0].category).toBe("bridge");
  });

  it("infers category: staking for Lido", async () => {
    process.env.DEBANK_API_KEY = "test-key";
    mockGet([{ id: "lido", name: "Lido", chain: "eth", net_usd_value: 0, portfolio_item_list: [] }]);
    const result = await getProtocolList(ADDR);
    expect(result[0].category).toBe("staking");
  });

  it("infers category: perps for GMX", async () => {
    process.env.DEBANK_API_KEY = "test-key";
    mockGet([{ id: "gmx", name: "GMX", chain: "arb", net_usd_value: 0, portfolio_item_list: [] }]);
    const result = await getProtocolList(ADDR);
    expect(result[0].category).toBe("perps");
  });

  it("maps chain IDs correctly: arb → arbitrum, base → base", async () => {
    process.env.DEBANK_API_KEY = "test-key";
    mockGet([
      { id: "uni3-arb", name: "Uniswap V3", chain: "arb", net_usd_value: 0, portfolio_item_list: [] },
    ]);
    const result = await getProtocolList(ADDR);
    expect(result[0].chains).toContain("arbitrum");
  });

  it("returns empty array gracefully on network error", async () => {
    process.env.DEBANK_API_KEY = "test-key";
    mockGetErr();
    const result = await getProtocolList(ADDR);
    expect(result).toEqual([]);
  });
});

// ─── getTotalBalance ──────────────────────────────────────────────────────────

describe("getTotalBalance", () => {
  it("returns zero balance and empty chains when no API key is set", async () => {
    const result = await getTotalBalance(ADDR);
    expect(result).toEqual({ netWorthUsd: 0, chains: [] });
    expect(axios.get).not.toHaveBeenCalled();
  });

  it("returns total USD value from API response", async () => {
    process.env.DEBANK_API_KEY = "test-key";
    mockGet({ usd_value: 500_000 });
    mockGet([]); // chain_balance returns empty
    const result = await getTotalBalance(ADDR);
    expect(result.netWorthUsd).toBe(500_000);
  });

  it("maps chain balances to ChainActivity with correct percentages", async () => {
    process.env.DEBANK_API_KEY = "test-key";
    mockGet({ usd_value: 100_000 });
    mockGet([
      { id: "eth", usd_value: 80_000 },
      { id: "arb", usd_value: 20_000 },
    ]);
    const result = await getTotalBalance(ADDR);
    expect(result.chains).toHaveLength(2);
    const eth = result.chains.find((c) => c.chain === "ethereum")!;
    expect(eth.percentage).toBeCloseTo(80, 0);
    expect(eth.netWorthUsd).toBe(80_000);
    const arb = result.chains.find((c) => c.chain === "arbitrum")!;
    expect(arb.percentage).toBeCloseTo(20, 0);
  });

  it("filters out chains with zero USD value", async () => {
    process.env.DEBANK_API_KEY = "test-key";
    mockGet({ usd_value: 100_000 });
    mockGet([
      { id: "eth", usd_value: 100_000 },
      { id: "base", usd_value: 0 },
    ]);
    const result = await getTotalBalance(ADDR);
    expect(result.chains).toHaveLength(1);
    expect(result.chains[0].chain).toBe("ethereum");
  });

  it("returns empty result gracefully on network error", async () => {
    process.env.DEBANK_API_KEY = "test-key";
    mockGetErr();
    const result = await getTotalBalance(ADDR);
    expect(result).toEqual({ netWorthUsd: 0, chains: [] });
  });
});
