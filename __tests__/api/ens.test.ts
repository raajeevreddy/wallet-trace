import { GET } from "../../app/api/ens/route";

jest.mock("../../lib/providers/alchemy", () => ({
  resolveENSName: jest.fn(),
  // keep other exports intact
  getTokenBalances: jest.fn(),
  getTransactionHistory: jest.fn(),
  getWalletAge: jest.fn(),
  resolveENS: jest.fn(),
}));

const mockAlchemy = require("../../lib/providers/alchemy");

const RESOLVED_ADDRESS = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";

function makeRequest(name?: string): Request {
  const url = name
    ? `http://localhost/api/ens?name=${encodeURIComponent(name)}`
    : "http://localhost/api/ens";
  return new Request(url);
}

describe("GET /api/ens", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 400 when name param is missing", async () => {
    const res = await GET(makeRequest() as any);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/required/i);
  });

  it("returns 400 for input without a dot", async () => {
    const res = await GET(makeRequest("notanens") as any);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/invalid/i);
  });

  it("resolves a valid ENS name and returns address", async () => {
    mockAlchemy.resolveENSName.mockResolvedValue(RESOLVED_ADDRESS);
    const res = await GET(makeRequest("vitalik.eth") as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.address).toBe(RESOLVED_ADDRESS);
    expect(data.name).toBe("vitalik.eth");
  });

  it("lowercases the ENS name before resolving", async () => {
    mockAlchemy.resolveENSName.mockResolvedValue(RESOLVED_ADDRESS);
    await GET(makeRequest("Vitalik.ETH") as any);
    expect(mockAlchemy.resolveENSName).toHaveBeenCalledWith("vitalik.eth");
  });

  it("returns 404 when ENS name cannot be resolved", async () => {
    mockAlchemy.resolveENSName.mockResolvedValue(null);
    const res = await GET(makeRequest("unresolvable.eth") as any);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toMatch(/could not be resolved/i);
  });

  it("returns 500 when resolveENSName throws", async () => {
    mockAlchemy.resolveENSName.mockRejectedValue(new Error("Alchemy down"));
    const res = await GET(makeRequest("vitalik.eth") as any);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toMatch(/failed to resolve/i);
  });

  it("includes Cache-Control header on success", async () => {
    mockAlchemy.resolveENSName.mockResolvedValue(RESOLVED_ADDRESS);
    const res = await GET(makeRequest("vitalik.eth") as any);
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=600");
  });

  it("accepts non-.eth ENS names with a dot (e.g. cb.id)", async () => {
    mockAlchemy.resolveENSName.mockResolvedValue(RESOLVED_ADDRESS);
    const res = await GET(makeRequest("user.cb.id") as any);
    expect(res.status).toBe(200);
  });
});
