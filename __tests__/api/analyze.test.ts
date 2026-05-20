import { GET, POST } from "../../app/api/analyze/route";
import { mockProfile } from "../fixtures";
import { clearCache } from "../../lib/cache";
import { resetLimiter } from "../../lib/rateLimit";

// ─── Mock dependencies ────────────────────────────────────────────────────────

jest.mock("../../lib/orchestrator", () => ({
  isValidAddress: jest.fn(),
  buildWalletProfile: jest.fn(),
}));

jest.mock("../../lib/ai/narrator", () => ({
  generateNarrative: jest.fn(),
}));

jest.mock("../../lib/cache", () => ({
  getCachedAnalysis: jest.fn().mockReturnValue(null),
  setCachedAnalysis: jest.fn(),
  clearCache: jest.fn(),
}));

jest.mock("../../lib/rateLimit", () => ({
  isRateLimited: jest.fn().mockReturnValue(false),
  getRemainingRequests: jest.fn().mockReturnValue(9),
  purgeExpired: jest.fn(),
  resetLimiter: jest.fn(),
}));

const mockOrchestrator = require("../../lib/orchestrator");
const mockNarrator = require("../../lib/ai/narrator");
const mockCache = require("../../lib/cache");
const mockRateLimit = require("../../lib/rateLimit");

const VALID_ADDRESS = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";

const MOCK_NARRATIVE = {
  summary: "Test summary.",
  behaviorType: "DeFi Power User",
  keyInsights: ["Insight 1"],
  riskFlags: ["Flag 1"],
};

const MOCK_CACHED_RESPONSE = {
  profile: mockProfile,
  narrative: MOCK_NARRATIVE,
  cached: false,
  analysisMs: 500,
};

function makeRequest(body: unknown, method = "POST", extraHeaders: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/analyze", {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "1.2.3.4",
      ...extraHeaders,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

// ─── GET ──────────────────────────────────────────────────────────────────────

describe("GET /api/analyze", () => {
  it("returns status ok with a timestamp", async () => {
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
    mockCache.getCachedAnalysis.mockReturnValue(null);
    mockCache.setCachedAnalysis.mockImplementation(() => {});
    mockRateLimit.isRateLimited.mockReturnValue(false);
    mockRateLimit.getRemainingRequests.mockReturnValue(9);
    mockRateLimit.purgeExpired.mockImplementation(() => {});
  });

  // ─── Rate limiting ─────────────────────────────────────────────────────

  it("returns 429 RATE_LIMIT when IP is rate limited", async () => {
    mockRateLimit.isRateLimited.mockReturnValue(true);
    const req = makeRequest({ address: VALID_ADDRESS });
    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.code).toBe("RATE_LIMIT");
    expect(response.headers.get("Retry-After")).toBe("60");
  });

  it("does not call buildWalletProfile when rate limited", async () => {
    mockRateLimit.isRateLimited.mockReturnValue(true);
    await POST(makeRequest({ address: VALID_ADDRESS }) as any);
    expect(mockOrchestrator.buildWalletProfile).not.toHaveBeenCalled();
  });

  // ─── IP extraction ──────────────────────────────────────────────────────

  it("prefers x-real-ip over x-forwarded-for for rate limiting", async () => {
    const req = makeRequest(
      { address: VALID_ADDRESS },
      "POST",
      { "x-real-ip": "5.6.7.8", "x-forwarded-for": "1.2.3.4" }
    );
    await POST(req as any);
    // isRateLimited should have been called with the real IP
    expect(mockRateLimit.isRateLimited).toHaveBeenCalledWith("5.6.7.8");
  });

  it("uses the last entry in x-forwarded-for when x-real-ip is absent", async () => {
    const req = makeRequest(
      { address: VALID_ADDRESS },
      "POST",
      { "x-forwarded-for": "1.1.1.1, 2.2.2.2, 3.3.3.3" }
    );
    await POST(req as any);
    expect(mockRateLimit.isRateLimited).toHaveBeenCalledWith("3.3.3.3");
  });

  // ─── Body size limit ───────────────────────────────────────────────────

  it("returns 413 when Content-Length exceeds 2048 bytes", async () => {
    const req = makeRequest(
      { address: VALID_ADDRESS },
      "POST",
      { "content-length": "9999" }
    );
    const response = await POST(req as any);
    expect(response.status).toBe(413);
  });

  it("proceeds normally when Content-Length is within limit", async () => {
    const req = makeRequest(
      { address: VALID_ADDRESS },
      "POST",
      { "content-length": "100" }
    );
    const response = await POST(req as any);
    expect(response.status).toBe(200);
  });

  it("proceeds normally when Content-Length header is absent", async () => {
    const req = makeRequest({ address: VALID_ADDRESS });
    const response = await POST(req as any);
    expect(response.status).toBe(200);
  });

  // ─── Cache ─────────────────────────────────────────────────────────────

  it("returns cached response with cached: true when cache hits", async () => {
    mockCache.getCachedAnalysis.mockReturnValue(MOCK_CACHED_RESPONSE);
    const req = makeRequest({ address: VALID_ADDRESS });
    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.cached).toBe(true);
    expect(response.headers.get("X-Cache")).toBe("HIT");
  });

  it("does not call buildWalletProfile on a cache hit", async () => {
    mockCache.getCachedAnalysis.mockReturnValue(MOCK_CACHED_RESPONSE);
    await POST(makeRequest({ address: VALID_ADDRESS }) as any);
    expect(mockOrchestrator.buildWalletProfile).not.toHaveBeenCalled();
  });

  it("calls setCachedAnalysis after a fresh analysis", async () => {
    const req = makeRequest({ address: VALID_ADDRESS });
    await POST(req as any);
    expect(mockCache.setCachedAnalysis).toHaveBeenCalledWith(
      VALID_ADDRESS,
      expect.objectContaining({ cached: false })
    );
  });

  it("returns X-Cache: MISS on a fresh analysis", async () => {
    const req = makeRequest({ address: VALID_ADDRESS });
    const response = await POST(req as any);
    expect(response.headers.get("X-Cache")).toBe("MISS");
  });

  it("includes X-Remaining-Requests header", async () => {
    const req = makeRequest({ address: VALID_ADDRESS });
    const response = await POST(req as any);
    expect(response.headers.get("X-Remaining-Requests")).toBe("9");
  });

  // ─── Validation ────────────────────────────────────────────────────────

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

  it("returns 400 INVALID_ADDRESS when address is a number", async () => {
    const req = makeRequest({ address: 12345 });
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
    expect(mockOrchestrator.isValidAddress).toHaveBeenCalledWith(VALID_ADDRESS);
  });

  it("calls buildWalletProfile with the normalized address", async () => {
    await POST(makeRequest({ address: VALID_ADDRESS }) as any);
    expect(mockOrchestrator.buildWalletProfile).toHaveBeenCalledWith(VALID_ADDRESS);
  });

  it("calls generateNarrative with the built profile", async () => {
    await POST(makeRequest({ address: VALID_ADDRESS }) as any);
    expect(mockNarrator.generateNarrative).toHaveBeenCalledWith(mockProfile);
  });

  it("returns 500 PROVIDER_ERROR when buildWalletProfile throws", async () => {
    mockOrchestrator.buildWalletProfile.mockRejectedValue(new Error("Provider failure"));
    const response = await POST(makeRequest({ address: VALID_ADDRESS }) as any);
    const data = await response.json();
    expect(response.status).toBe(500);
    expect(data.code).toBe("PROVIDER_ERROR");
  });

  it("returns 500 PROVIDER_ERROR when generateNarrative throws", async () => {
    mockNarrator.generateNarrative.mockRejectedValue(new Error("AI failure"));
    const response = await POST(makeRequest({ address: VALID_ADDRESS }) as any);
    const data = await response.json();
    expect(response.status).toBe(500);
    expect(data.code).toBe("PROVIDER_ERROR");
  });

  it("includes Cache-Control header on successful responses", async () => {
    const response = await POST(makeRequest({ address: VALID_ADDRESS }) as any);
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=3600");
  });
});
