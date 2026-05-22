import type { NftSummary, NftCollection } from "@/lib/types";

interface Props {
  nfts: NftSummary;
}

function collectionColor(name: string): string {
  const colors = [
    "#06C2D9", "#7B8CDE", "#F4A629", "#A78BFA",
    "#34D399", "#F87171", "#7FB3CC", "#FB923C",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return colors[h % colors.length];
}

function CollectionCard({ col }: { col: NftCollection }) {
  const color = collectionColor(col.name);
  const initial = col.name.charAt(0).toUpperCase() || "?";

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "0.5px solid var(--border)",
      borderRadius: 12,
      padding: "12px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      transition: "border-color 0.15s",
    }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = `${color}44`; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; }}
    >
      {/* Thumbnail */}
      <div style={{
        width: "100%",
        paddingBottom: "100%",
        position: "relative",
        borderRadius: 8,
        overflow: "hidden",
        background: `linear-gradient(135deg, ${color}22, ${color}44)`,
        border: `0.5px solid ${color}33`,
        flexShrink: 0,
      }}>
        {col.sampleImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={col.sampleImageUrl}
            alt={col.name}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: 800,
            color,
            fontFamily: "var(--font-display)",
          }}>
            {initial}
          </span>
        )}
      </div>

      {/* Name */}
      <div style={{
        fontSize: 11,
        fontWeight: 500,
        color: "var(--text)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        lineHeight: 1.3,
      }}>
        {col.name}
      </div>

      {/* Count + type */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontSize: 12,
          fontWeight: 600,
          color,
          fontFamily: "var(--font-display)",
        }}>
          {col.count}
        </span>
        <span style={{
          fontSize: 9,
          color: "var(--text-3)",
          padding: "1px 5px",
          background: "rgba(255,255,255,0.05)",
          border: "0.5px solid var(--border)",
          borderRadius: 4,
          letterSpacing: "0.04em",
        }}>
          {col.tokenType === "ERC1155" ? "1155" : "721"}
        </span>
      </div>
    </div>
  );
}

export default function NftHoldings({ nfts }: Props) {
  const visible = nfts.collections.slice(0, 12);
  const hidden = nfts.totalCount - nfts.collections.reduce((s, c) => s + c.count, 0);

  return (
    <div style={{
      background: "var(--surface)",
      border: "0.5px solid var(--border-strong)",
      borderRadius: 14,
      padding: "20px 24px",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 500,
          color: "var(--text-3)",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}>
          NFT Holdings
        </div>
        <div style={{ fontSize: 11, color: "var(--text-3)" }}>
          {nfts.totalCount} item{nfts.totalCount !== 1 ? "s" : ""}
          {nfts.collections.length > 0 && ` · ${nfts.collections.length} collection${nfts.collections.length !== 1 ? "s" : ""}`}
        </div>
      </div>

      {nfts.collections.length === 0 ? (
        <div style={{
          padding: "32px 0",
          textAlign: "center",
          color: "var(--text-3)",
          fontSize: 13,
        }}>
          <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>◈</div>
          No NFTs found
        </div>
      ) : (
        <>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
            gap: 10,
          }}>
            {visible.map((col) => (
              <CollectionCard key={col.contractAddress} col={col} />
            ))}
          </div>

          {hidden > 0 && (
            <div style={{
              marginTop: 12,
              fontSize: 12,
              color: "var(--text-3)",
              textAlign: "center",
            }}>
              + {hidden} more item{hidden !== 1 ? "s" : ""} across collections
            </div>
          )}
        </>
      )}
    </div>
  );
}
