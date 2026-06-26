import type { UserOperation, PaymasterBreakdown, SmartWalletProfile } from "../types";

const TIMEOUT_MS = 15_000;
const ENTRY_POINTS = [
  "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", // v0.6
  "0x0000000071727De22E5E9d8BAf0edAc6f37da032", // v0.7
];

// ─── Known paymaster labels ───────────────────────────────────────────────────

const PAYMASTER_NAMES: Record<string, string> = {
  "0x0000000000000000000000000000000000000000": "Self-paid",
  "0x3fE285B57D95Ca7c3ee03e8e7d0949012E882Ee0": "Pimlico",
  "0x4685d9587a7F72Da32dc323bfFF17627aa632C61": "Pimlico",
  "0x00000f79b7faf42eebadba19acc07cd08af44789": "Alchemy Gas Manager",
  "0xE93ECa6595fe94091DC1af46aaC2A8b5D7990770": "Biconomy",
  "0x00000000325802Da91f8a1197906dD5aDFaB9DB8": "Stackup",
  "0x7e3a7D96e2dEA5F4bFBe2763d17d6e5CF7B30B09": "Coinbase Paymaster",
  "0x2dcAB2D55F4f4bBBA5E3E27c5bC7CffE3A0B0a23": "Coinbase Paymaster",
};

// ─── Known factory labels ─────────────────────────────────────────────────────

const FACTORY_NAMES: Record<string, string> = {
  "0x9406Cc6185a346906296840746125a0E44976454": "Coinbase Smart Wallet",
  "0x0BA5ED0c6AA8c49038539082a29Bd0fb6B18B35b": "Coinbase Smart Wallet",
  "0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67": "Safe{Wallet}",
  "0xa6221a3c3E5f4FC4fc8B4b89BfB0e5e5CfFf2736": "Safe{Wallet}",
  "0x000000a56Aaca3e9a4C479ea6b6CD0DbcB6634F5": "Zerodev Kernel",
  "0x9775137314fE595c943712B0b336327dfa80aE8A": "Biconomy",
  "0x000000f9eE1842Bb72F6BBDD75E6D3d4e3e9594C": "Alchemy LightAccount",
};

function labelPaymaster(addr: string): string {
  if (!addr || addr === "0x" || addr === "0x0000000000000000000000000000000000000000") return "Self-paid";
  const lower = addr.toLowerCase();
  for (const [key, name] of Object.entries(PAYMASTER_NAMES)) {
    if (key.toLowerCase() === lower) return name;
  }
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function labelFactory(addr: string): string {
  if (!addr) return "Unknown";
  const lower = addr.toLowerCase();
  for (const [key, name] of Object.entries(FACTORY_NAMES)) {
    if (key.toLowerCase() === lower) return name;
  }
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

// ─── Extract paymaster address from paymasterAndData ─────────────────────────

function extractPaymaster(paymasterAndData: string): string {
  if (!paymasterAndData || paymasterAndData === "0x" || paymasterAndData.length < 42) {
    return "0x0000000000000000000000000000000000000000";
  }
  return "0x" + paymasterAndData.slice(2, 42);
}

// ─── Extract factory from initCode ────────────────────────────────────────────

function extractFactory(initCode: string): string {
  if (!initCode || initCode === "0x" || initCode.length < 42) return "";
  return "0x" + initCode.slice(2, 42);
}

// ─── Alchemy JSON-RPC call ────────────────────────────────────────────────────

async function alchemyRpc(
  url: string,
  method: string,
  params: unknown[]
): Promise<unknown> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Alchemy RPC ${res.status}`);
  const json = (await res.json()) as { result?: unknown; error?: { message: string } };
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

// ─── Check if address has contract code ──────────────────────────────────────

async function hasContractCode(address: string, rpcUrl: string): Promise<boolean> {
  try {
    const code = (await alchemyRpc(rpcUrl, "eth_getCode", [address, "latest"])) as string;
    return code !== "0x" && code.length > 2;
  } catch {
    return false;
  }
}

// ─── Fetch UserOperations from Alchemy ───────────────────────────────────────

interface RawUserOp {
  userOperationHash: string;
  transactionHash: string;
  blockNumber: string;
  initCode?: string;
  paymasterAndData?: string;
}

async function fetchUserOps(
  address: string,
  entryPoint: string,
  rpcUrl: string
): Promise<RawUserOp[]> {
  try {
    const result = (await alchemyRpc(rpcUrl, "alchemy_getUserOperationsByAccount", [
      { sender: address, entryPoint },
    ])) as { userOperations?: RawUserOp[] } | null;
    return result?.userOperations ?? [];
  } catch {
    return [];
  }
}

// ─── Build paymaster breakdown ────────────────────────────────────────────────

function buildPaymasterBreakdown(ops: UserOperation[]): PaymasterBreakdown[] {
  const counts: Record<string, { name: string; address: string; count: number }> = {};
  for (const op of ops) {
    const key = op.paymaster.toLowerCase();
    if (!counts[key]) counts[key] = { name: op.paymasterName, address: op.paymaster, count: 0 };
    counts[key].count++;
  }
  const total = ops.length || 1;
  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .map(({ name, address, count }) => ({
      name,
      address,
      opsCount: count,
      percentage: Math.round((count / total) * 100),
    }));
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function analyzeSmartWallet(address: string): Promise<SmartWalletProfile> {
  const apiKey = process.env.ALCHEMY_API_KEY;
  const rpcUrl = apiKey
    ? `https://base-mainnet.g.alchemy.com/v2/${apiKey}`
    : "https://base-mainnet.g.alchemy.com/v2/demo";

  const [isSmartWallet, ...opBatches] = await Promise.all([
    hasContractCode(address, rpcUrl),
    ...ENTRY_POINTS.map((ep) => fetchUserOps(address, ep, rpcUrl)),
  ]);

  const allRaw = opBatches.flat();

  // Deduplicate by userOpHash
  const seen = new Set<string>();
  const uniqueRaw = allRaw.filter((op) => {
    if (seen.has(op.userOperationHash)) return false;
    seen.add(op.userOperationHash);
    return true;
  });

  // Parse into typed UserOperations
  const ops: UserOperation[] = uniqueRaw.map((raw) => {
    const paymaster = extractPaymaster(raw.paymasterAndData ?? "0x");
    const factory = extractFactory(raw.initCode ?? "0x");
    const sponsored = paymaster !== "0x0000000000000000000000000000000000000000";
    return {
      userOpHash: raw.userOperationHash,
      transactionHash: raw.transactionHash,
      blockNumber: parseInt(raw.blockNumber, 16),
      paymaster,
      paymasterName: labelPaymaster(paymaster),
      sponsored,
      factory,
      factoryName: factory ? labelFactory(factory) : "",
    };
  }).sort((a, b) => b.blockNumber - a.blockNumber);

  // Detect factory from earliest deploy op
  const deployOp = [...ops].reverse().find((op) => op.factory);
  const factory = deployOp?.factory ?? "";
  const factoryName = deployOp?.factoryName ?? (isSmartWallet ? "Unknown Factory" : "");

  const sponsored = ops.filter((op) => op.sponsored).length;

  return {
    address,
    isSmartWallet,
    isERC4337: ops.length > 0,
    totalUserOps: ops.length,
    sponsoredOps: sponsored,
    selfPaidOps: ops.length - sponsored,
    factory,
    factoryName,
    paymasters: buildPaymasterBreakdown(ops),
    recentOps: ops.slice(0, 20),
    narrative: "", // filled by AI narrator
  };
}
