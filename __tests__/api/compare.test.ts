import { POST } from "../../app/api/compare/route";
import { NextRequest } from "next/server";

const ADDR1 = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";
const ADDR2 = "0x503828976d22510aad0201ac7ec88293211d23da";

jest.mock("../../lib/orchestrator", () => ({
  isValidAddress: jest.fn((addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr) || /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr)),
  buildWalletProfile: jest.fn().mockResolvedValue({ identity: { address: "0x1" }, netWorthUsd: 1000 }),
}));

jest.mock("../../lib/ai/narrator", () => ({
  generateNarrative: jest.fn().mockResolvedValue({ summary: "Test", behaviorType: "DeFi Power User", keyInsights: [], riskFlags: [] }),
}));

jest.mock("../../lib/ai/compareWallets", () => ({
  compareWallets: jest.fn().mockResolvedValue({
    riskTolerance: { winner: "wallet1", explanation: "..." },
    nftTaste: { winner: "wallet2", explanation: "..." },
    defiBehavior: { winner: "wallet1", explanation: "..." },
    chainPreferences: { winner: "wallet2", explanation: "..." },
    verdict: "wallet1 wins overall",
  }),
}));

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/compare", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 400 for missing address1", async () => {
    const res = await POST(makeRequest({ address2: ADDR2 }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/required/i);
  });

  it("returns 400 for missing address2", async () => {
    const res = await POST(makeRequest({ address1: ADDR1 }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/required/i);
  });

  it("returns 400 for invalid address1", async () => {
    const res = await POST(makeRequest({ address1: "not-an-address", address2: ADDR2 }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe("INVALID_ADDRESS");
  });

  it("returns 400 for invalid address2", async () => {
    const res = await POST(makeRequest({ address1: ADDR1, address2: "not-an-address" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe("INVALID_ADDRESS");
  });

  it("returns 400 when both addresses are the same", async () => {
    const res = await POST(makeRequest({ address1: ADDR1, address2: ADDR1 }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe("INVALID_ADDRESS");
  });

  it("returns 200 with wallet1, wallet2, and comparison for valid addresses", async () => {
    const res = await POST(makeRequest({ address1: ADDR1, address2: ADDR2 }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.wallet1).toBeDefined();
    expect(json.wallet2).toBeDefined();
    expect(json.comparison).toBeDefined();
    expect(json.comparison.verdict).toBe("wallet1 wins overall");
    expect(json.analysisMs).toBeGreaterThanOrEqual(0);
  });

  it("fetches both profiles in parallel (buildWalletProfile called twice)", async () => {
    const { buildWalletProfile } = require("../../lib/orchestrator");
    await POST(makeRequest({ address1: ADDR1, address2: ADDR2 }));
    expect(buildWalletProfile).toHaveBeenCalledTimes(2);
    expect(buildWalletProfile).toHaveBeenCalledWith(ADDR1);
    expect(buildWalletProfile).toHaveBeenCalledWith(ADDR2);
  });

  it("returns 400 for ENS names (client must resolve before calling API)", async () => {
    const res = await POST(makeRequest({ address1: "vitalik.eth", address2: ADDR2 }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe("INVALID_ADDRESS");
  });

  it("returns 500 when buildWalletProfile throws", async () => {
    const { buildWalletProfile } = require("../../lib/orchestrator");
    buildWalletProfile.mockRejectedValueOnce(new Error("Provider error"));
    jest.spyOn(console, "error").mockImplementationOnce(() => {});
    const res = await POST(makeRequest({ address1: ADDR1, address2: ADDR2 }));
    expect(res.status).toBe(500);
  });

  it("returns 400 for invalid JSON body", async () => {
    const req = new NextRequest("http://localhost/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
