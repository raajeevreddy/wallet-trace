import { generateNarrative } from "../../../lib/ai/narrator";
import { mockProfile } from "../../fixtures";

const mockFetch = jest.fn();
global.fetch = mockFetch;

const VALID_API_RESPONSE = {
  content: [
    {
      text: JSON.stringify({
        summary: "Test summary.",
        behaviorType: "DeFi Power User",
        keyInsights: ["Insight 1", "Insight 2"],
        riskFlags: ["Flag 1"],
        analystNote: "Forward note.",
      }),
    },
  ],
};

describe("generateNarrative", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.ANTHROPIC_API_KEY;
  });

  // ─── No API key → mock fallback ───────────────────────────────────────────

  it("returns a mock narrative when ANTHROPIC_API_KEY is not set", async () => {
    const result = await generateNarrative(mockProfile);
    expect(result.summary).toBeDefined();
    expect(result.behaviorType).toBeDefined();
    expect(Array.isArray(result.keyInsights)).toBe(true);
    expect(Array.isArray(result.riskFlags)).toBe(true);
  });

  it("returns Institutional mock narrative for high-sophistication wallets", async () => {
    const highSophisticationProfile = {
      ...mockProfile,
      sophistication: { ...mockProfile.sophistication, score: 70 },
    };
    const result = await generateNarrative(highSophisticationProfile);
    expect(result.behaviorType).toBe("Institutional DeFi Operator");
  });

  it("returns generic mock narrative for lower-sophistication wallets", async () => {
    const lowProfile = {
      ...mockProfile,
      sophistication: { ...mockProfile.sophistication, score: 40, label: "Intermediate" as const },
    };
    const result = await generateNarrative(lowProfile);
    expect(result.behaviorType).toBe("Active DeFi Participant");
  });

  it("does not call fetch when API key is missing", async () => {
    await generateNarrative(mockProfile);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // ─── With API key → real fetch ────────────────────────────────────────────

  it("calls the Anthropic API with correct URL and headers", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key-123";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(VALID_API_RESPONSE),
    });

    await generateNarrative(mockProfile);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.anthropic.com/v1/messages",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "x-api-key": "test-key-123",
          "anthropic-version": "2023-06-01",
        }),
      })
    );
  });

  it("parses and returns the AI response correctly", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key-123";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(VALID_API_RESPONSE),
    });

    const result = await generateNarrative(mockProfile);
    expect(result.summary).toBe("Test summary.");
    expect(result.behaviorType).toBe("DeFi Power User");
    expect(result.keyInsights).toEqual(["Insight 1", "Insight 2"]);
    expect(result.riskFlags).toEqual(["Flag 1"]);
    expect(result.analystNote).toBe("Forward note.");
  });

  it("strips markdown code fences from the API response", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key-123";
    const wrapped = `\`\`\`json\n${JSON.stringify({
      summary: "Fenced summary.",
      behaviorType: "Test Type",
      keyInsights: [],
      riskFlags: [],
    })}\n\`\`\``;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ content: [{ text: wrapped }] }),
    });

    const result = await generateNarrative(mockProfile);
    expect(result.summary).toBe("Fenced summary.");
  });

  it("falls back to mock narrative when API returns a non-ok status", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key-123";
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: jest.fn().mockResolvedValue("Rate limited"),
    });

    const result = await generateNarrative(mockProfile);
    expect(result.summary).toBeDefined();
    expect(result.behaviorType).toBeDefined();
  });

  it("falls back to mock narrative when fetch throws a network error", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key-123";
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await generateNarrative(mockProfile);
    expect(result.summary).toBeDefined();
    expect(result.behaviorType).toBeDefined();
  });

  it("falls back to mock narrative when API response contains invalid JSON", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key-123";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ content: [{ text: "not valid json {{" }] }),
    });

    const result = await generateNarrative(mockProfile);
    expect(result.summary).toBeDefined();
  });

  it("includes the wallet address in the request body prompt", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key-123";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(VALID_API_RESPONSE),
    });

    await generateNarrative(mockProfile);

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.messages[0].content).toContain(mockProfile.identity.address);
  });
});
