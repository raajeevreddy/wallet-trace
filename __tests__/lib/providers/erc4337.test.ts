import { analyzeSmartWallet } from "../../../lib/providers/erc4337";

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  process.env.ALCHEMY_API_KEY = "test-key";
});

function makeEthGetCodeResponse(code: string) {
  return { ok: true, json: async () => ({ jsonrpc: "2.0", result: code }) };
}

function makeUserOpsResponse(ops: object[]) {
  return {
    ok: true,
    json: async () => ({
      jsonrpc: "2.0",
      result: { userOperations: ops },
    }),
  };
}

const SAMPLE_OP = {
  userOperationHash: "0xabc123",
  transactionHash: "0xtx123",
  blockNumber: "0x123456",
  initCode: "0x",
  paymasterAndData: "0x3fE285B57D95Ca7c3ee03e8e7d0949012E882Ee0deadbeef",
};

describe("analyzeSmartWallet", () => {
  it("detects EOA when no bytecode and no UserOps", async () => {
    // eth_getCode → "0x" (EOA), then two empty UserOps responses (v0.6, v0.7)
    mockFetch
      .mockResolvedValueOnce(makeEthGetCodeResponse("0x"))
      .mockResolvedValueOnce(makeUserOpsResponse([]))
      .mockResolvedValueOnce(makeUserOpsResponse([]));

    const result = await analyzeSmartWallet("0xabc0000000000000000000000000000000000001");

    expect(result.isSmartWallet).toBe(false);
    expect(result.isERC4337).toBe(false);
    expect(result.totalUserOps).toBe(0);
  });

  it("detects smart wallet with bytecode", async () => {
    mockFetch
      .mockResolvedValueOnce(makeEthGetCodeResponse("0x6080604052"))
      .mockResolvedValueOnce(makeUserOpsResponse([]))
      .mockResolvedValueOnce(makeUserOpsResponse([]));

    const result = await analyzeSmartWallet("0xabc0000000000000000000000000000000000002");

    expect(result.isSmartWallet).toBe(true);
    expect(result.isERC4337).toBe(false);
  });

  it("detects ERC-4337 wallet with UserOps", async () => {
    mockFetch
      .mockResolvedValueOnce(makeEthGetCodeResponse("0x6080604052"))
      .mockResolvedValueOnce(makeUserOpsResponse([SAMPLE_OP]))
      .mockResolvedValueOnce(makeUserOpsResponse([]));

    const result = await analyzeSmartWallet("0xabc0000000000000000000000000000000000003");

    expect(result.isERC4337).toBe(true);
    expect(result.totalUserOps).toBe(1);
    expect(result.sponsoredOps).toBe(1);
  });

  it("extracts paymaster from paymasterAndData correctly", async () => {
    mockFetch
      .mockResolvedValueOnce(makeEthGetCodeResponse("0x6080604052"))
      .mockResolvedValueOnce(makeUserOpsResponse([SAMPLE_OP]))
      .mockResolvedValueOnce(makeUserOpsResponse([]));

    const result = await analyzeSmartWallet("0xabc0000000000000000000000000000000000004");

    expect(result.paymasters[0].name).toBe("Pimlico");
    expect(result.paymasters[0].opsCount).toBe(1);
  });

  it("counts self-paid ops when paymasterAndData is empty", async () => {
    const selfPaidOp = { ...SAMPLE_OP, paymasterAndData: "0x", userOperationHash: "0xself" };
    mockFetch
      .mockResolvedValueOnce(makeEthGetCodeResponse("0x6080604052"))
      .mockResolvedValueOnce(makeUserOpsResponse([selfPaidOp]))
      .mockResolvedValueOnce(makeUserOpsResponse([]));

    const result = await analyzeSmartWallet("0xabc0000000000000000000000000000000000005");

    expect(result.selfPaidOps).toBe(1);
    expect(result.sponsoredOps).toBe(0);
    expect(result.paymasters[0].name).toBe("Self-paid");
  });

  it("deduplicates UserOps across entrypoints", async () => {
    mockFetch
      .mockResolvedValueOnce(makeEthGetCodeResponse("0x6080604052"))
      .mockResolvedValueOnce(makeUserOpsResponse([SAMPLE_OP]))
      .mockResolvedValueOnce(makeUserOpsResponse([SAMPLE_OP])); // same op from v0.7

    const result = await analyzeSmartWallet("0xabc0000000000000000000000000000000000006");

    expect(result.totalUserOps).toBe(1); // deduped
  });

  it("handles Alchemy RPC failures gracefully", async () => {
    mockFetch.mockRejectedValue(new Error("network down"));

    const result = await analyzeSmartWallet("0xabc0000000000000000000000000000000000007");

    expect(result.isSmartWallet).toBe(false);
    expect(result.totalUserOps).toBe(0);
  });

  it("returns correct paymaster breakdown percentages", async () => {
    const op1 = { ...SAMPLE_OP, userOperationHash: "0xop1" };
    const op2 = { ...SAMPLE_OP, userOperationHash: "0xop2", paymasterAndData: "0x" };
    mockFetch
      .mockResolvedValueOnce(makeEthGetCodeResponse("0x6080604052"))
      .mockResolvedValueOnce(makeUserOpsResponse([op1, op2]))
      .mockResolvedValueOnce(makeUserOpsResponse([]));

    const result = await analyzeSmartWallet("0xabc0000000000000000000000000000000000008");

    expect(result.paymasters).toHaveLength(2);
    expect(result.paymasters[0].percentage).toBe(50);
    expect(result.paymasters[1].percentage).toBe(50);
  });
});
