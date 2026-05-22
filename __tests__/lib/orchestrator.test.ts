import { isValidAddress, isValidSolanaAddress, buildWalletProfile } from "../../lib/orchestrator";
import { mockProfile } from "../fixtures";

// ─── Mock all providers ───────────────────────────────────────────────────────

jest.mock("../../lib/providers/alchemy", () => ({
  getTokenBalances: jest.fn().mockResolvedValue([]),
  getTransactionHistory: jest.fn().mockResolvedValue([]),
  getWalletAge: jest.fn().mockResolvedValue({ firstTxTimestamp: 1438214400, walletAgeYears: 9 }),
  resolveENS: jest.fn().mockResolvedValue("vitalik.eth"),
  getNativeBalance: jest.fn().mockResolvedValue(0),
  getNFTs: jest.fn().mockResolvedValue({ totalCount: 0, collections: [] }),
}));

jest.mock("../../lib/providers/helius", () => ({
  getSolanaBalances: jest.fn().mockResolvedValue({ nativeLamports: 0, tokens: [] }),
  getSolanaTransactions: jest.fn().mockResolvedValue([]),
  getSolanaNFTs: jest.fn().mockResolvedValue({ totalCount: 0, collections: [] }),
  getSolanaWalletAge: jest.fn().mockResolvedValue(null),
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
  fetchNativeTokenPrice: jest.fn().mockResolvedValue(0),
  fetchPriceHistory: jest.fn().mockResolvedValue([]),
}));

jest.mock("../../lib/providers/thegraph", () => ({
  getTheGraphDeFiPositions: jest.fn().mockResolvedValue({
    positions: [], totalSuppliedUsd: 0, totalBorrowedUsd: 0, totalLpUsd: 0,
  }),
}));

const mockAlchemy = require("../../lib/providers/alchemy");
const mockDebank = require("../../lib/providers/debank");
const mockEtherscan = require("../../lib/providers/etherscan");
const mockCoingecko = require("../../lib/providers/coingecko");
const mockHelius = require("../../lib/providers/helius");
const mockTheGraph = require("../../lib/providers/thegraph");

const VALID_ADDRESS = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";

const SOLANA_ADDRESS = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";

// ─── isValidSolanaAddress ─────────────────────────────────────────────────────

describe("isValidSolanaAddress", () => {
  it("accepts a valid base58 Solana address", () => {
    expect(isValidSolanaAddress(SOLANA_ADDRESS)).toBe(true);
  });

  it("accepts a 32-character Solana address", () => {
    expect(isValidSolanaAddress("11111111111111111111111111111112")).toBe(true);
  });

  it("rejects an Ethereum address", () => {
    expect(isValidSolanaAddress("0xd8da6bf26964af9d7eed9e03e53415d37aa96045")).toBe(false);
  });

  it("rejects a string with invalid base58 characters (0, O, I, l)", () => {
    expect(isValidSolanaAddress("0xd8da6bf26964af9d7eed9e03e53415d37aa960")).toBe(false);
    expect(isValidSolanaAddress("OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO")).toBe(false);
  });

  it("rejects strings that are too short", () => {
    expect(isValidSolanaAddress("abc12")).toBe(false);
  });

  it("rejects strings that are too long", () => {
    expect(isValidSolanaAddress("A".repeat(45))).toBe(false);
  });
});

// ─── isValidAddress ───────────────────────────────────────────────────────────

describe("isValidAddress", () => {
  it("accepts a valid Solana address", () => {
    expect(isValidAddress(SOLANA_ADDRESS)).toBe(true);
  });

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
    mockAlchemy.getNativeBalance.mockResolvedValue(0);
    mockAlchemy.getNFTs.mockResolvedValue({ totalCount: 0, collections: [] });
    mockHelius.getSolanaBalances.mockResolvedValue({ nativeLamports: 0, tokens: [] });
    mockHelius.getSolanaTransactions.mockResolvedValue([]);
    mockHelius.getSolanaNFTs.mockResolvedValue({ totalCount: 0, collections: [] });
    mockHelius.getSolanaWalletAge.mockResolvedValue(null);
    mockDebank.getProtocolList.mockResolvedValue([]);
    mockDebank.getTotalBalance.mockResolvedValue({ netWorthUsd: 0, chains: [] });
    mockEtherscan.getFirstTransactionTimestamp.mockResolvedValue(null);
    mockCoingecko.enrichTokenPrices.mockImplementation((tokens: unknown) => Promise.resolve(tokens));
    mockCoingecko.fetchNativeTokenPrice.mockResolvedValue(0);
    mockCoingecko.fetchPriceHistory.mockResolvedValue([]);
    mockTheGraph.getTheGraphDeFiPositions.mockResolvedValue({
      positions: [], totalSuppliedUsd: 0, totalBorrowedUsd: 0, totalLpUsd: 0,
    });
  });

  it("returns a WalletProfile with correct address", async () => {
    const profile = await buildWalletProfile(VALID_ADDRESS);
    expect(profile.identity.address).toBe(VALID_ADDRESS);
  });

  it("routes Solana addresses to Helius without calling Alchemy providers", async () => {
    mockHelius.getSolanaBalances.mockResolvedValueOnce({ nativeLamports: 2_000_000_000, tokens: [] });
    mockCoingecko.fetchNativeTokenPrice.mockResolvedValueOnce(150);

    const profile = await buildWalletProfile(SOLANA_ADDRESS);

    expect(profile.identity.address).toBe(SOLANA_ADDRESS);
    expect(profile.chains[0].chain).toBe("solana");
    expect(mockAlchemy.getTokenBalances).not.toHaveBeenCalled();
    expect(mockAlchemy.getTransactionHistory).not.toHaveBeenCalled();
    expect(mockHelius.getSolanaBalances).toHaveBeenCalledWith(SOLANA_ADDRESS);
  });

  it("builds Solana net worth from SOL balance + price", async () => {
    mockHelius.getSolanaBalances.mockResolvedValueOnce({ nativeLamports: 5_000_000_000, tokens: [] }); // 5 SOL
    mockCoingecko.fetchNativeTokenPrice.mockResolvedValueOnce(200); // $200/SOL

    const profile = await buildWalletProfile(SOLANA_ADDRESS);
    expect(profile.netWorthUsd).toBe(1000); // 5 × $200
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

  it("uses DeBank netWorthUsd when key is set and returns a positive value", async () => {
    mockDebank.getTotalBalance.mockResolvedValue({ netWorthUsd: 500_000, chains: [] });
    const profile = await buildWalletProfile(VALID_ADDRESS);
    expect(profile.netWorthUsd).toBe(500_000);
  });

  it("calls enrichTokenPrices with raw ERC-20 token balances", async () => {
    const rawTokens = [
      { symbol: "USDC", name: "USD Coin", balance: 500, usdValue: 0, contractAddress: "0x1", isStablecoin: true },
    ];
    const enrichedTokens = [{ ...rawTokens[0], usdValue: 500 }];
    mockAlchemy.getTokenBalances.mockResolvedValue(rawTokens);
    mockCoingecko.enrichTokenPrices.mockResolvedValue(enrichedTokens);

    const profile = await buildWalletProfile(VALID_ADDRESS);
    expect(mockCoingecko.enrichTokenPrices).toHaveBeenCalledWith(rawTokens);
  });

  it("prepends native ETH token when balance >= 0.0001", async () => {
    mockAlchemy.getNativeBalance.mockResolvedValue(5.25);
    mockCoingecko.fetchNativeTokenPrice.mockResolvedValue(3_000);

    const profile = await buildWalletProfile(VALID_ADDRESS);
    const eth = profile.tokens.find((t) => t.symbol === "ETH");
    expect(eth).toBeDefined();
    expect(eth!.balance).toBe(5.25);
    expect(eth!.usdValue).toBe(5.25 * 3_000);
    expect(eth!.contractAddress).toBe("native");
  });

  it("omits native ETH token when balance < 0.0001", async () => {
    mockAlchemy.getNativeBalance.mockResolvedValue(0.00001);
    mockCoingecko.fetchNativeTokenPrice.mockResolvedValue(3_000);

    const profile = await buildWalletProfile(VALID_ADDRESS);
    const eth = profile.tokens.find((t) => t.symbol === "ETH" && t.contractAddress === "native");
    expect(eth).toBeUndefined();
  });

  it("sums token usdValues for netWorthUsd when no DeBank key is set", async () => {
    mockAlchemy.getNativeBalance.mockResolvedValue(10);
    mockCoingecko.fetchNativeTokenPrice.mockResolvedValue(3_000);
    mockDebank.getTotalBalance.mockResolvedValue({ netWorthUsd: 0, chains: [] });

    const profile = await buildWalletProfile(VALID_ADDRESS);
    expect(profile.netWorthUsd).toBe(30_000);
  });

  it("sums enriched token usdValues including ERC-20s when no DeBank key is set", async () => {
    mockAlchemy.getNativeBalance.mockResolvedValue(10);
    mockCoingecko.fetchNativeTokenPrice.mockResolvedValue(3_000);
    const enrichedErc20 = [
      { symbol: "USDC", name: "USD Coin", balance: 5000, usdValue: 5_000, contractAddress: "0x2", isStablecoin: true },
    ];
    mockAlchemy.getTokenBalances.mockResolvedValue([]);
    mockCoingecko.enrichTokenPrices.mockResolvedValue(enrichedErc20);
    mockDebank.getTotalBalance.mockResolvedValue({ netWorthUsd: 0, chains: [] });

    const profile = await buildWalletProfile(VALID_ADDRESS);
    // ETH (30_000) + USDC (5_000)
    expect(profile.netWorthUsd).toBe(35_000);
  });

  it("uses DeBank chain breakdown when key is set", async () => {
    const chains = [{ chain: "ethereum" as const, txCount: 0, percentage: 100, netWorthUsd: 500_000 }];
    mockDebank.getTotalBalance.mockResolvedValue({ netWorthUsd: 500_000, chains });
    const profile = await buildWalletProfile(VALID_ADDRESS);
    expect(profile.chains).toEqual(chains);
  });

  it("builds chain activity from Alchemy transactions when no DeBank key is set", async () => {
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
