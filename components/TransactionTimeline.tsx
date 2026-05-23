import type { Transaction } from "@/lib/types";

interface Props {
  transactions: Transaction[];
  walletAddress: string;
  chain?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(unixSec: number): string {
  const delta = Math.floor(Date.now() / 1000) - unixSec;
  if (delta < 60) return "just now";
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
  if (delta < 86400 * 30) return `${Math.floor(delta / 86400)}d ago`;
  if (delta < 86400 * 365) return `${Math.floor(delta / (86400 * 30))}mo ago`;
  return `${Math.floor(delta / (86400 * 365))}y ago`;
}

function shortAddr(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function explorerTxUrl(hash: string, chain: string): string {
  const explorers: Record<string, string> = {
    ethereum: "https://etherscan.io/tx/",
    base:     "https://basescan.org/tx/",
    arbitrum: "https://arbiscan.io/tx/",
    solana:   "https://solscan.io/tx/",
  };
  return (explorers[chain] ?? "https://etherscan.io/tx/") + hash;
}

function explorerAddressUrl(address: string, chain: string): string {
  if (chain === "solana") return `https://solscan.io/account/${address}`;
  const explorers: Record<string, string> = {
    ethereum: "https://etherscan.io/address/",
    base:     "https://basescan.org/address/",
    arbitrum: "https://arbiscan.io/address/",
  };
  return (explorers[chain] ?? "https://etherscan.io/address/") + address;
}

function explorerLabel(chain: string): string {
  const labels: Record<string, string> = {
    ethereum: "Etherscan",
    base:     "Basescan",
    arbitrum: "Arbiscan",
    solana:   "Solscan",
  };
  return labels[chain] ?? "Explorer";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const CATEGORY_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  defi:     { label: "DeFi",     color: "#06C2D9", bg: "rgba(6,194,217,0.10)" },
  transfer: { label: "Transfer", color: "#7B8CDE", bg: "rgba(123,140,222,0.10)" },
  bridge:   { label: "Bridge",   color: "#F4A629", bg: "rgba(244,166,41,0.10)" },
  nft:      { label: "NFT",      color: "#A78BFA", bg: "rgba(167,139,250,0.10)" },
  other:    { label: "Other",    color: "#4A7A93", bg: "rgba(74,122,147,0.10)" },
};

const CHAIN_BADGE: Record<string, { label: string; color: string }> = {
  ethereum: { label: "ETH",  color: "#627EEA" },
  base:     { label: "BASE", color: "#0052FF" },
  arbitrum: { label: "ARB",  color: "#28A0F0" },
};

function TxRow({
  tx,
  walletAddress,
}: {
  tx: Transaction;
  walletAddress: string;
  chain?: string;
}) {
  const cat = CATEGORY_STYLE[tx.category ?? "other"] ?? CATEGORY_STYLE.other;
  const chain = CHAIN_BADGE[tx.chain] ?? { label: tx.chain.toUpperCase(), color: "#4A7A93" };
  const isSent = tx.from.toLowerCase() === walletAddress.toLowerCase();
  const counterparty = isSent ? tx.to : tx.from;
  const valueNum = parseFloat(tx.value);
  const hasValue = valueNum > 0;

  return (
    <a
      href={explorerTxUrl(tx.hash, tx.chain)}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 0",
        borderBottom: "0.5px solid var(--border)",
        textDecoration: "none",
        transition: "opacity 0.15s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.75")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
    >
      {/* Direction indicator */}
      <div style={{
        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
        background: isSent ? "rgba(240,112,112,0.12)" : "rgba(6,194,217,0.12)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, color: isSent ? "var(--red)" : "var(--green)",
      }}>
        {isSent ? "↑" : "↓"}
      </div>

      {/* Category + chain */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3, flexShrink: 0 }}>
        <span style={{
          fontSize: 10, fontWeight: 500, padding: "2px 7px",
          borderRadius: 10, background: cat.bg, color: cat.color,
          letterSpacing: "0.03em",
        }}>{cat.label}</span>
        <span style={{
          fontSize: 9, fontWeight: 600, padding: "1px 6px",
          borderRadius: 8, background: `${chain.color}18`, color: chain.color,
          letterSpacing: "0.04em",
        }}>{chain.label}</span>
      </div>

      {/* Counterparty */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: "var(--text-2)", fontFamily: "var(--font-mono)" }}>
          {isSent ? "→ " : "← "}{shortAddr(counterparty)}
        </div>
        <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 2, fontFamily: "var(--font-mono)" }}>
          {tx.hash.slice(0, 10)}…
        </div>
      </div>

      {/* Value + time */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        {hasValue && (
          <div style={{
            fontSize: 12, fontWeight: 500,
            color: isSent ? "var(--red)" : "var(--green)",
            fontFamily: "var(--font-mono)",
          }}>
            {isSent ? "−" : "+"}{parseFloat(tx.value).toFixed(4)}
          </div>
        )}
        <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: hasValue ? 2 : 0 }}>
          {tx.timestamp ? relativeTime(tx.timestamp) : "—"}
        </div>
      </div>
    </a>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TransactionTimeline({ transactions, walletAddress, chain = "ethereum" }: Props) {
  const sorted = [...transactions].sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);

  return (
    <div style={{
      background: "var(--surface)",
      border: "0.5px solid var(--border-strong)",
      borderRadius: 14,
      padding: "20px 24px",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 4,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 3, height: 14, borderRadius: 2, background: "var(--amber)", opacity: 0.8 }} />
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.10em" }}>
            Recent Transactions
          </div>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-3)" }}>
          {sorted.length} shown
        </div>
      </div>

      {/* Empty state */}
      {sorted.length === 0 && (
        <div style={{
          padding: "32px 0", textAlign: "center",
          color: "var(--text-3)", fontSize: 13,
        }}>
          <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>⛓</div>
          No recent transactions found
        </div>
      )}

      {/* Transaction rows — 5 visible, rest scrollable */}
      <div style={{ maxHeight: 260, overflowY: "auto", scrollbarWidth: "thin" }}>
        {sorted.map((tx) => (
          <TxRow key={tx.hash} tx={tx} walletAddress={walletAddress} />
        ))}
      </div>

      {/* Explorer link */}
      {sorted.length > 0 && (
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <a
            href={explorerAddressUrl(walletAddress, chain)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12, color: "var(--green)",
              textDecoration: "none",
              opacity: 0.8,
            }}
          >
            View full history on {explorerLabel(chain)} ↗
          </a>
        </div>
      )}
    </div>
  );
}
