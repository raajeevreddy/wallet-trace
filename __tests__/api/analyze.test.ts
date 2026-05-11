import { GET, POST } from "../../app/api/analyze/route";
import { mockProfile } from "../fixtures";

// ─── Mock dependencies ────────────────────────────────────────────────────────

jest.mock("../../lib/orchestrator", () => ({
  isValidAddress: jest.fn(),
  buildWalletProfile: jest.fn(),
}));

jest.mock("../../lib/ai/narrator", () => ({
  generateNarrative: jest.fn(),
}));

const mockOrchestrator = require("../../lib/orchestrator");
const mockNarrator = require("../../lib/ai/narrator");

const VALID_ADDRESS = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";

const MOCK_NARRATIVE = {
  summary: "Test summary.",
  behaviorType: "DeFi Power User",
  keyInsights: ["Insight 1"],
  riskFlags: ["Flag 1"],
};

function makeRequest(body: unknown, method = "POST"): Request {
  return new Request("http://localhost/api/analyze", {
    method,
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

// ─── GET ──────────────────────────────────────────────────────────────────────

describe("GET /api/analyze", () => {
  it("returns status ok with a timestamp", async () => {
    const req = new Request("http://localhost/api/analyze");
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("ok");
    expect(typeof data.timestamp).toBe("number");
  });
});

// ─── POST /api/analyze ────────────────────────────────────────────────────────

describe("POST /api/analyze", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOrchestrator.isValidAddress.mockReturnValue(true);
    mockOrchestrator.buildWalletProfile.mockResolvedValue(mockProfile);
    mockNarrator.generateNarrative.mockResolvedValue(MOCK_NARRATIVE);
  });

  it("returns 400 UNKNOWN for malformed JSON", async () => {
    const req = makeRequest("{ this is not json }", "POST");
    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe("UNKNOWN");
  });

  it("returns 400 INVALID_ADDRESS when address is missing", async () => {
    const req = makeRequest({});
    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe("INVALID_ADDRESS");
  });

  it("returns 400 INVALID_ADDRESS when address is only whitespace", async () => {
    mockOrchestrator.isValidAddress.mockReturnValue(false);
    const req = makeRequest({ address: "   " });
    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe("INVALID_ADDRESS");
  });

  it("returns 400 INVALID_ADDRESS for invalid address format", async () => {
    mockOrchestrator.isValidAddress.mockReturnValue(false);
    const req = makeRequest({ address: "not-an-address" });
    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe("INVALID_ADDRESS");
    expect(data.error).toMatch(/invalid ethereum address/i);
  });

  it("returns 200 with full analysis for a valid address", async () => {
    const req = makeRequest({ address: VALID_ADDRESS });
    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.profile).toBeDefined();
    expect(data.narrative).toEqual(MOCK_NARRATIVE);
    expect(data.cached).toBe(false);
    expect(typeof data.analysisMs).toBe("number");
  });

  it("trims and lowercases the address before validation", async () => {
    const req = makeRequest({ address: "  0xD8dA6BF26964aF9D7eEd9e03E53415D37aA96045  " });
    await POST(req as any);

    expect(mockOrchestrator.isValidAddress).toHaveBeenCalledWith(
      "0xd8da6bf26964af9d7eed9e03e53415d37aa96045"
    );
  });

  it("calls buildWalletProfile with the normalized address", async () => {
    const req = makeRequest({ address: VALID_ADDRESS });
    await POST(req as any);
    expect(mockOrchestrator.buildWalletProfile).toHaveBeenCalledWith(VALID_ADDRESS);
  });

  it("calls generateNarrative with the built profile", async () => {
    const req = makeRequest({ address: VALID_ADDRESS });
    await POST(req as any);
    expect(mockNarrator.generateNarrative).toHaveBeenCalledWith(mockProfile);
  });

  it("returns 500 PROVIDER_ERROR when buildWalletProfile throws", async () => {
    mockOrchestrator.buildWalletProfile.mockRejectedValue(new Error("Provider failure"));
    const req = makeRequest({ address: VALID_ADDRESS });
    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.code).toBe("PROVIDER_ERROR");
  });

  it("returns 500 PROVIDER_ERROR when generateNarrative throws", async () => {
    mockNarrator.generateNarrative.mockRejectedValue(new Error("AI failure"));
    const req = makeRequest({ address: VALID_ADDRESS });
    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.code).toBe("PROVIDER_ERROR");
  });

  it("includes Cache-Control header on successful responses", async () => {
    const req = makeRequest({ address: VALID_ADDRESS });
    const response = await POST(req as any);
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=3600");
  });

  it("analysisMs reflects actual elapsed time (>= 0)", async () => {
    const req = makeRequest({ address: VALID_ADDRESS });
    const response = await POST(req as any);
    const data = await response.json();
    expect(data.analysisMs).toBeGreaterThanOrEqual(0);
  });
});
