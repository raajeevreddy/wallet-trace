import {
  saveRecentWallet,
  getRecentWallets,
  clearRecentWallets,
  shortAddress,
} from "../../lib/recentWallets";

// ─── localStorage mock ────────────────────────────────────────────────────────

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, "localStorage", { value: localStorageMock, writable: true });
// Make sure `window` is defined so SSR guards pass
Object.defineProperty(global, "window", { value: global, writable: true });

const ADDR_A = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";
const ADDR_B = "0x25f2226b597e8f9514b3f68f00f494cf4f286491";
const ADDR_C = "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be";
const ADDR_D = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const ADDR_E = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const ADDR_F = "0xcccccccccccccccccccccccccccccccccccccccc";

// ─── getRecentWallets ─────────────────────────────────────────────────────────

describe("getRecentWallets", () => {
  beforeEach(() => localStorageMock.clear());

  it("returns empty array when localStorage is empty", () => {
    expect(getRecentWallets()).toEqual([]);
  });

  it("returns parsed wallets when key is present", () => {
    const wallets = [{ address: ADDR_A, analyzedAt: 1000 }];
    localStorageMock.setItem("wt-recent", JSON.stringify(wallets));
    const result = getRecentWallets();
    expect(result).toHaveLength(1);
    expect(result[0].address).toBe(ADDR_A);
  });

  it("returns empty array for corrupt JSON", () => {
    localStorageMock.setItem("wt-recent", "not-json{{{");
    expect(getRecentWallets()).toEqual([]);
  });

  it("returns empty array when stored value is not an array", () => {
    localStorageMock.setItem("wt-recent", JSON.stringify({ address: ADDR_A }));
    expect(getRecentWallets()).toEqual([]);
  });

  it("filters out entries missing required fields", () => {
    const wallets = [
      { address: ADDR_A, analyzedAt: 1000 },
      { notAnAddress: true },
      null,
      { address: ADDR_B }, // missing analyzedAt
    ];
    localStorageMock.setItem("wt-recent", JSON.stringify(wallets));
    const result = getRecentWallets();
    expect(result).toHaveLength(1);
    expect(result[0].address).toBe(ADDR_A);
  });
});

// ─── saveRecentWallet ─────────────────────────────────────────────────────────

describe("saveRecentWallet", () => {
  beforeEach(() => localStorageMock.clear());

  it("saves a new wallet to localStorage", () => {
    saveRecentWallet(ADDR_A);
    const result = getRecentWallets();
    expect(result).toHaveLength(1);
    expect(result[0].address).toBe(ADDR_A);
  });

  it("saves ENS name alongside address", () => {
    saveRecentWallet(ADDR_A, "vitalik.eth");
    const result = getRecentWallets();
    expect(result[0].ens).toBe("vitalik.eth");
  });

  it("stores analyzedAt as a number", () => {
    const before = Date.now();
    saveRecentWallet(ADDR_A);
    const result = getRecentWallets();
    expect(result[0].analyzedAt).toBeGreaterThanOrEqual(before);
  });

  it("prepends new wallet to the front of the list", () => {
    saveRecentWallet(ADDR_A);
    saveRecentWallet(ADDR_B);
    const result = getRecentWallets();
    expect(result[0].address).toBe(ADDR_B);
    expect(result[1].address).toBe(ADDR_A);
  });

  it("deduplicates — re-saving an address moves it to front", () => {
    saveRecentWallet(ADDR_A);
    saveRecentWallet(ADDR_B);
    saveRecentWallet(ADDR_A); // should move A to front and remove old entry
    const result = getRecentWallets();
    expect(result[0].address).toBe(ADDR_A);
    expect(result).toHaveLength(2); // no duplicate
  });

  it("caps the list at 5 entries", () => {
    [ADDR_A, ADDR_B, ADDR_C, ADDR_D, ADDR_E, ADDR_F].forEach((a) => saveRecentWallet(a));
    const result = getRecentWallets();
    expect(result).toHaveLength(5);
  });

  it("drops the oldest entry when the list is full", () => {
    [ADDR_A, ADDR_B, ADDR_C, ADDR_D, ADDR_E, ADDR_F].forEach((a) => saveRecentWallet(a));
    const result = getRecentWallets();
    // ADDR_A was saved first → should be dropped
    expect(result.map((w) => w.address)).not.toContain(ADDR_A);
    // ADDR_F was saved last → should be first
    expect(result[0].address).toBe(ADDR_F);
  });
});

// ─── clearRecentWallets ───────────────────────────────────────────────────────

describe("clearRecentWallets", () => {
  beforeEach(() => localStorageMock.clear());

  it("removes all recent wallets", () => {
    saveRecentWallet(ADDR_A);
    saveRecentWallet(ADDR_B);
    clearRecentWallets();
    expect(getRecentWallets()).toEqual([]);
  });

  it("does not throw when localStorage is already empty", () => {
    expect(() => clearRecentWallets()).not.toThrow();
  });
});

// ─── shortAddress ─────────────────────────────────────────────────────────────

describe("shortAddress", () => {
  it("formats a full 42-char address as 0x1234…abcd", () => {
    const result = shortAddress("0xd8da6bf26964af9d7eed9e03e53415d37aa96045");
    expect(result).toBe("0xd8da…6045");
  });

  it("returns the address unchanged when it is very short", () => {
    expect(shortAddress("0x123")).toBe("0x123");
  });

  it("still formats an 11-char string (length > 10)", () => {
    const s = "0xabcde1234";
    const result = shortAddress(s);
    expect(result).toContain("…");
  });
});
