import {
  getCachedAnalysis,
  setCachedAnalysis,
  clearCache,
  getCacheSize,
} from "../../lib/cache";
import { mockProfile } from "../fixtures";

const MOCK_RESPONSE = {
  profile: mockProfile,
  narrative: {
    summary: "Test",
    behaviorType: "DeFi Power User",
    keyInsights: [],
    riskFlags: [],
  },
  cached: false,
  analysisMs: 1200,
};

const ADDR = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";

describe("analysis cache", () => {
  beforeEach(() => clearCache());

  // ─── getCachedAnalysis ──────────────────────────────────────────────────

  it("returns null for an address not in cache", () => {
    expect(getCachedAnalysis(ADDR)).toBeNull();
  });

  it("returns the cached response after set", () => {
    setCachedAnalysis(ADDR, MOCK_RESPONSE);
    const result = getCachedAnalysis(ADDR);
    expect(result).toEqual(MOCK_RESPONSE);
  });

  it("is case-insensitive — stores and retrieves by lowercase key", () => {
    setCachedAnalysis(ADDR.toUpperCase(), MOCK_RESPONSE);
    expect(getCachedAnalysis(ADDR.toLowerCase())).toEqual(MOCK_RESPONSE);
  });

  it("returns null for an expired entry", () => {
    jest.useFakeTimers();
    setCachedAnalysis(ADDR, MOCK_RESPONSE);

    // Advance past the 1-hour TTL
    jest.advanceTimersByTime(61 * 60 * 1000);

    expect(getCachedAnalysis(ADDR)).toBeNull();
    jest.useRealTimers();
  });

  it("removes the expired entry from the store after read", () => {
    jest.useFakeTimers();
    setCachedAnalysis(ADDR, MOCK_RESPONSE);
    jest.advanceTimersByTime(61 * 60 * 1000);
    getCachedAnalysis(ADDR); // triggers deletion
    expect(getCacheSize()).toBe(0);
    jest.useRealTimers();
  });

  it("returns fresh entry that has not yet expired", () => {
    jest.useFakeTimers();
    setCachedAnalysis(ADDR, MOCK_RESPONSE);
    jest.advanceTimersByTime(59 * 60 * 1000); // 59 min — not expired
    expect(getCachedAnalysis(ADDR)).toEqual(MOCK_RESPONSE);
    jest.useRealTimers();
  });

  // ─── setCachedAnalysis ──────────────────────────────────────────────────

  it("increments cache size after set", () => {
    expect(getCacheSize()).toBe(0);
    setCachedAnalysis(ADDR, MOCK_RESPONSE);
    expect(getCacheSize()).toBe(1);
  });

  it("overwrites existing entry for the same address", () => {
    const updated = { ...MOCK_RESPONSE, analysisMs: 999 };
    setCachedAnalysis(ADDR, MOCK_RESPONSE);
    setCachedAnalysis(ADDR, updated);
    expect(getCacheSize()).toBe(1);
    expect(getCachedAnalysis(ADDR)?.analysisMs).toBe(999);
  });

  it("evicts oldest entry when at MAX_ENTRIES capacity", () => {
    // Fill up 500 entries
    for (let i = 0; i < 500; i++) {
      setCachedAnalysis(`0x${String(i).padStart(40, "0")}`, MOCK_RESPONSE);
    }
    expect(getCacheSize()).toBe(500);

    // Adding one more should evict the oldest
    setCachedAnalysis(`0x${"f".repeat(40)}`, MOCK_RESPONSE);
    expect(getCacheSize()).toBe(500); // still 500, not 501
  });

  // ─── clearCache ─────────────────────────────────────────────────────────

  it("clears all entries", () => {
    setCachedAnalysis(ADDR, MOCK_RESPONSE);
    setCachedAnalysis("0x" + "a".repeat(40), MOCK_RESPONSE);
    clearCache();
    expect(getCacheSize()).toBe(0);
    expect(getCachedAnalysis(ADDR)).toBeNull();
  });
});
