import { isValidAddress, buildWalletProfile } from "../../lib/orchestrator";
import { mockProfile } from "../fixtures";

// ─── Mock all providers ───────────────────────────────────────────────────────

jest.mock("../../lib/providers/alchemy", () => ({
  getTokenBalances: jest.fn().mockResolvedValue([]),
  getTransactionHistory: jest.fn().mockResolvedValue([]),
  getWalletAge: jest.fn().mockResolvedValue({ firstTxTimestamp: 1438214400, walletAgeYears: 9 }),
  resolveENS: jest.fn().mockResolvedValue("vitalik.eth"),
}));

jest.mock("../../lib/providers/debank", () => ({
  getProtocolList: jest.fn().mockResolvedValue([]),
  getTotalBalance: jest.fn().mockResolvedValue({ netWorthUsd: 0, chains: [] }),
}));

jest.mock("../../lib/providers/etherscan", () => ({
  getFirstTransactionTimestamp: jest.fn().mockResolvedValue(null),
}));

jest.mock("../../lib/providers/coingecko", () => ({
  enrichTokenPrices: jest.fn().mockImplementation((tokens) => Promise.resolve(tokens)),
}));

const mockAlchemy = require("../../lib/providers/alchemy");
const mockDebank = require("../../lib/providers/debank");
const mockEtherscan = require("../../lib/providers/etherscan");
const mockCoingecko = require("../../lib/providers/coingecko");

const VALID_ADDRESS = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";

// ─── isValidAddress ───────────────────────────────────────────────────────────

describe("isValidAddress", () => {
  it("accepts a valid lowercase 0x address", () => {
    expect(isValidAddress("0xd8da6bf26964af9d7eed9e03e53415d37aa96045")).toBe(true);
  });

  it("accepts a valid mixed-case 0x address", () => {
    expect(isValidAddress("0xD8dA6BF26964aF9D7eEd9e03E53415D37aA96045")).toBe(true);
  });

  it("accepts a valid uppercase hex address", () => {
    expect(isValidAddress("0xABCDEF1234567890ABCDEF1234567890ABCDEF12")).toBe(true);
  });

  it("rejects an address missing the 0x prefix", () => {
    expect(isValidAddress("d8da6bf26964af9d7eed9e03e53415d37aa96045")).toBe(false);
  });

  it("rejects an address that is too short", () => {
    expect(isValidAddress("0xd8da6bf26964af9d7eed9e03e53415d37aa960")).toBe(false);
  });

  it("rejects an address that is too long", () => {
    expect(isValidAddress("0xd8da6bf26964af9d7eed9e03e53415d37aa96045AA")).toBe(false);
  });

  it("rejects an address with invalid hex characters", () => {
    expect(isValidAddress("0xd8da6bf26964af9d7eed9e03e53415d37aa9604Z")).toBe(false);
  });

  it("rejects an ENS name", () => {
    expect(isValidAddress("vitalik.eth")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidAddress("")).toBe(false);
  });

  it("rejects only the 0x prefix", () => {
    expect(isValidAddress("0x")).toBe(false);
  });
});

// ─── buildWalletProfile ───────────────────────────────────────────────────────

describe("buildWalletProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAlchemy.getWalletAge.mockResolvedValue({ firstTxTimestamp: 1438214400, walletAgeYears: 9 });
    mockAlchemy.resolveENS.mockResolvedValue("vitalik.eth");
    mockAlchemy.getTokenBalances.mockResolvedValue([]);
    mockAlchemy.getTransactionHistory.mockResolvedValue([]);
    mockDebank.getProtocolList.mockResolvedValue([]);
    mockDebank.getTotalBalance.mockResolvedValue({ netWorthUsd: 0, chains: [] });
    mockEtherscan.getFirstTransactionTimestamp.mockResolvedValue(null);
    mockCoingecko.enrichTokenPrices.mockImplementation((tokens: unknown) => Promise.resolve(tokens));
  });

  it("returns a WalletProfile with correct address", async () => {
    const profile = await buildWalletProfile(VALID_ADDRESS);
    expect(profile.identity.address).toBe(VALID_ADDRESS);
  });

  it("resolves ENS name from Alchemy", async () => {
    const profile = await buildWalletProfile(VALID_ADDRESS);
    expect(profile.identity.ens).toBe("vitalik.eth");
  });

  it("uses Alchemy wallet age when available", async () => {
    const profile = await buildWalletProfile(VALID_ADDRESS);
    expect(profile.identity.walletAgeYears).toBe(9);
    expect(profile.identity.firstTxTimestamp).toBe(1438214400);
  });

  it("falls back to Etherscan age when Alchemy age fails", async () => {
    mockAlchemy.getWalletAge.mockRejectedValue(new Error("Alchemy down"));
    mockEtherscan.getFirstTransactionTimestamp.mockResolvedValue({ firstTxTimestamp: 1500000000, walletAgeYears: 7 });

    const profile = await buildWalletProfile(VALID_ADDRESS);
    expect(profile.identity.walletAgeYears).toBe(7);
  });

  it("uses DeBank netWorthUsd when it returns a positive value", async () => {
    mockDebank.getTotalBalance.mockResolvedValue({ netWorthUsd: 500_000, chains: [] });
    const profile = await buildWalletProfile(VALID_ADDRESS);
    expect(profile.netWorthUsd).toBe(500_000);
  });

  it("calls enrichTokenPrices with raw token balances", async () => {
    const rawTokens = [
      { symbol: "ETH", name: "Ether", balance: 10, usdValue: 0, contractAddress: "0x1", isStablecoin: false },
    ];
    const enrichedTokens = [
      { ...rawTokens[0], usdValue: 30_000 },
    ];
    mockAlchemy.getTokenBalances.mockResolvedValue(rawTokens);
    mockCoingecko.enrichTokenPrices.mockResolvedValue(enrichedTokens);

    const profile = await buildWalletProfile(VALID_ADDRESS);
    expect(mockCoingecko.enrichTokenPrices).toHaveBeenCalledWith(rawTokens);
    expect(profile.tokens[0].usdValue).toBe(30_000);
  });

  it("falls back to summing enriched token usdValues when DeBank returns 0", async () => {
    const enrichedTokens = [
      { symbol: "ETH", name: "Ether", balance: 10, usdValue: 30_000, contractAddress: "0x1", isStablecoin: false },
      { symbol: "USDC", name: "USD Coin", balance: 5000, usdValue: 5_000, contractAddress: "0x2", isStablecoin: true },
    ];
    mockAlchemy.getTokenBalances.mockResolvedValue([]);
    mockCoingecko.enrichTokenPrices.mockResolvedValue(enrichedTokens);
    mockDebank.getTotalBalance.mockResolvedValue({ netWorthUsd: 0, chains: [] });

    const profile = await buildWalletProfile(VALID_ADDRESS);
    expect(profile.netWorthUsd).toBe(35_000);
  });

  it("uses DeBank chains when provided", async () => {
    const chains = [{ chain: "ethereum" as const, txCount: 0, percentage: 100, netWorthUsd: 500_000 }];
    mockDebank.getTotalBalance.mockResolvedValue({ netWorthUsd: 500_000, chains });
    const profile = await buildWalletProfile(VALID_ADDRESS);
    expect(profile.chains).toEqual(chains);
  });

  it("builds chain activity from transactions when DeBank chains are empty", async () => {
    mockAlchemy.getTransactionHistory
      .mockResolvedValueOnce([{ chain: "ethereum", hash: "0x1", timestamp: 1, from: "0xa", to: "0xb", value: "1" }])
      .mockResolvedValueOnce([{ chain: "base", hash: "0x2", timestamp: 2, from: "0xa", to: "0xb", value: "1" }])
      .mockResolvedValueOnce([]);

    const profile = await buildWalletProfile(VALID_ADDRESS);
    const chainNames = profile.chains.map(c => c.chain);
    expect(chainNames).toContain("ethereum");
    expect(chainNames).toContain("base");
  });

  it("limits tokens array to 20", async () => {
    const manyTokens = Array.from({ length: 30 }, (_, i) => ({
      symbol: `TOKEN${i}`,
      name: `Token ${i}`,
      balance: 100,
      usdValue: 100,
      contractAddress: `0x${i}`,
      isStablecoin: false,
    }));
    mockAlchemy.getTokenBalances.mockResolvedValue(manyTokens);

    const profile = await buildWalletProfile(VALID_ADDRESS);
    expect(profile.tokens.length).toBeLessThanOrEqual(20);
  });

  it("limits recentTransactions to 20", async () => {
    const manyTxs = Array.from({ length: 50 }, (_, i) => ({
      hash: `0x${i}`,
      timestamp: i,
      from: "0xa",
      to: "0xb",
      value: "1",
      chain: "ethereum" as const,
    }));
    mockAlchemy.getTransactionHistory.mockResolvedValue(manyTxs);

    const profile = await buildWalletProfile(VALID_ADDRESS);
    expect(profile.recentTransactions.length).toBeLessThanOrEqual(20);
  });

  it("includes analyzedAt timestamp", async () => {
    const before = Date.now();
    const profile = await buildWalletProfile(VALID_ADDRESS);
    expect(profile.analyzedAt).toBeGreaterThanOrEqual(before);
    expect(profile.analyzedAt).toBeLessThanOrEqual(Date.now());
  });

  it("handles all providers failing gracefully", async () => {
    mockAlchemy.getWalletAge.mockRejectedValue(new Error("fail"));
    mockAlchemy.resolveENS.mockRejectedValue(new Error("fail"));
    mockAlchemy.getTokenBalances.mockRejectedValue(new Error("fail"));
    mockAlchemy.getTransactionHistory.mockRejectedValue(new Error("fail"));
    mockDebank.getTotalBalance.mockRejectedValue(new Error("fail"));
    mockDebank.getProtocolList.mockRejectedValue(new Error("fail"));
    mockEtherscan.getFirstTransactionTimestamp.mockRejectedValue(new Error("fail"));

    await expect(buildWalletProfile(VALID_ADDRESS)).resolves.toBeDefined();
  });
});
