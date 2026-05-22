import { getNFTs } from "../../../lib/providers/alchemy";

// ─── Mock alchemy-sdk ─────────────────────────────────────────────────────────
// jest.mock is hoisted, so we define mock functions inside the factory and
// expose them via a custom property on the Alchemy constructor for test access.

jest.mock("alchemy-sdk", () => {
  const nftFn = jest.fn();
  const AlchemyMock = jest.fn().mockImplementation(() => ({
    nft: { getNftsForOwner: nftFn },
    core: {
      getTokenBalances: jest.fn(),
      getTokenMetadata: jest.fn(),
      getAssetTransfers: jest.fn(),
      getBalance: jest.fn(),
      lookupAddress: jest.fn(),
      resolveName: jest.fn(),
    },
  }));
  (AlchemyMock as unknown as Record<string, unknown>).__nftFn = nftFn;
  return {
    Alchemy: AlchemyMock,
    Network: { ETH_MAINNET: "eth-mainnet", BASE_MAINNET: "base-mainnet", ARB_MAINNET: "arb-mainnet" },
    NftFilters: { SPAM: "SPAM", AIRDROPS: "AIRDROPS" },
    AssetTransfersCategory: { EXTERNAL: "external", ERC20: "erc20", ERC721: "erc721", ERC1155: "erc1155", INTERNAL: "internal" },
    SortingOrder: { DESCENDING: "desc", ASCENDING: "asc" },
  };
});

// Access mock after jest.mock registration
const mockGetNftsForOwner = (require("alchemy-sdk").Alchemy as unknown as Record<string, unknown>).__nftFn as jest.Mock;

const WALLET = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";

function makeNft(overrides: {
  contractAddress?: string;
  contractName?: string;
  tokenId?: string;
  tokenType?: string;
  balance?: string;
  thumbnailUrl?: string;
  cachedUrl?: string;
} = {}) {
  return {
    contract: {
      address: overrides.contractAddress ?? "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
      name: overrides.contractName ?? "Bored Ape Yacht Club",
      symbol: "BAYC",
      tokenType: overrides.tokenType ?? "ERC721",
    },
    tokenId: overrides.tokenId ?? "1",
    tokenType: overrides.tokenType ?? "ERC721",
    balance: overrides.balance ?? "1",
    image: {
      thumbnailUrl: overrides.thumbnailUrl,
      cachedUrl: overrides.cachedUrl,
    },
    name: `BAYC #${overrides.tokenId ?? "1"}`,
    timeLastUpdated: new Date().toISOString(),
    raw: { metadata: {} },
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("getNFTs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns empty summary when wallet owns no NFTs", async () => {
    mockGetNftsForOwner.mockResolvedValueOnce({ ownedNfts: [], totalCount: 0 });
    const result = await getNFTs(WALLET);
    expect(result).toEqual({ totalCount: 0, collections: [] });
  });

  it("groups NFTs by contract address", async () => {
    mockGetNftsForOwner.mockResolvedValueOnce({
      ownedNfts: [
        makeNft({ contractAddress: "0xaaa", tokenId: "1" }),
        makeNft({ contractAddress: "0xaaa", tokenId: "2" }),
        makeNft({ contractAddress: "0xbbb", contractName: "CryptoPunks", tokenId: "3" }),
      ],
      totalCount: 3,
    });

    const result = await getNFTs(WALLET);
    expect(result.collections).toHaveLength(2);
    expect(result.totalCount).toBe(3);
  });

  it("counts ERC-721 tokens as 1 each", async () => {
    mockGetNftsForOwner.mockResolvedValueOnce({
      ownedNfts: [
        makeNft({ contractAddress: "0xaaa", tokenType: "ERC721", balance: "1" }),
        makeNft({ contractAddress: "0xaaa", tokenType: "ERC721", balance: "1", tokenId: "2" }),
      ],
      totalCount: 2,
    });

    const result = await getNFTs(WALLET);
    expect(result.collections[0].count).toBe(2);
  });

  it("counts ERC-1155 tokens using balance field", async () => {
    mockGetNftsForOwner.mockResolvedValueOnce({
      ownedNfts: [
        makeNft({ contractAddress: "0xaaa", tokenType: "ERC1155", balance: "10" }),
      ],
      totalCount: 1,
    });

    const result = await getNFTs(WALLET);
    expect(result.collections[0].count).toBe(10);
    expect(result.collections[0].tokenType).toBe("ERC1155");
  });

  it("uses thumbnailUrl for sampleImageUrl when available", async () => {
    mockGetNftsForOwner.mockResolvedValueOnce({
      ownedNfts: [
        makeNft({ thumbnailUrl: "https://thumb.example.com/1.png", cachedUrl: "https://cache.example.com/1.png" }),
      ],
      totalCount: 1,
    });

    const result = await getNFTs(WALLET);
    expect(result.collections[0].sampleImageUrl).toBe("https://thumb.example.com/1.png");
  });

  it("falls back to cachedUrl when thumbnailUrl is absent", async () => {
    mockGetNftsForOwner.mockResolvedValueOnce({
      ownedNfts: [
        makeNft({ thumbnailUrl: undefined, cachedUrl: "https://cache.example.com/1.png" }),
      ],
      totalCount: 1,
    });

    const result = await getNFTs(WALLET);
    expect(result.collections[0].sampleImageUrl).toBe("https://cache.example.com/1.png");
  });

  it("sets sampleImageUrl to undefined when no image urls are present", async () => {
    mockGetNftsForOwner.mockResolvedValueOnce({
      ownedNfts: [makeNft({ thumbnailUrl: undefined, cachedUrl: undefined })],
      totalCount: 1,
    });

    const result = await getNFTs(WALLET);
    expect(result.collections[0].sampleImageUrl).toBeUndefined();
  });

  it("sorts collections by count descending", async () => {
    mockGetNftsForOwner.mockResolvedValueOnce({
      ownedNfts: [
        makeNft({ contractAddress: "0xaaa", tokenId: "1" }),
        makeNft({ contractAddress: "0xbbb", contractName: "CryptoPunks", tokenId: "2" }),
        makeNft({ contractAddress: "0xbbb", contractName: "CryptoPunks", tokenId: "3" }),
        makeNft({ contractAddress: "0xbbb", contractName: "CryptoPunks", tokenId: "4" }),
      ],
      totalCount: 4,
    });

    const result = await getNFTs(WALLET);
    expect(result.collections[0].contractAddress).toBe("0xbbb");
    expect(result.collections[0].count).toBe(3);
    expect(result.collections[1].contractAddress).toBe("0xaaa");
  });

  it("limits output to 20 collections", async () => {
    const manyNfts = Array.from({ length: 25 }, (_, i) =>
      makeNft({ contractAddress: `0x${String(i).padStart(40, "0")}`, contractName: `Collection ${i}`, tokenId: String(i) })
    );
    mockGetNftsForOwner.mockResolvedValueOnce({ ownedNfts: manyNfts, totalCount: 25 });

    const result = await getNFTs(WALLET);
    expect(result.collections.length).toBeLessThanOrEqual(20);
  });

  it("normalizes contract addresses to lowercase", async () => {
    mockGetNftsForOwner.mockResolvedValueOnce({
      ownedNfts: [makeNft({ contractAddress: "0xBC4CA0EDA7647A8AB7C2061C2E118A18A936F13D" })],
      totalCount: 1,
    });

    const result = await getNFTs(WALLET);
    expect(result.collections[0].contractAddress).toBe("0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d");
  });

  it("passes excludeFilters with SPAM to the Alchemy API", async () => {
    mockGetNftsForOwner.mockResolvedValueOnce({ ownedNfts: [], totalCount: 0 });
    await getNFTs(WALLET);
    expect(mockGetNftsForOwner).toHaveBeenCalledWith(
      WALLET,
      expect.objectContaining({ excludeFilters: expect.arrayContaining(["SPAM"]) })
    );
  });

  it("returns empty summary and does not throw when API fails", async () => {
    mockGetNftsForOwner.mockRejectedValueOnce(new Error("API error"));
    const result = await getNFTs(WALLET);
    expect(result).toEqual({ totalCount: 0, collections: [] });
  });

  it("uses contract name, falling back to symbol for collection name", async () => {
    const nft = makeNft({ contractName: undefined });
    // contract.name is undefined — should use symbol ("BAYC")
    (nft.contract as Record<string, unknown>).name = undefined;
    mockGetNftsForOwner.mockResolvedValueOnce({ ownedNfts: [nft], totalCount: 1 });

    const result = await getNFTs(WALLET);
    expect(result.collections[0].name).toBe("BAYC");
  });
});
