export default function DashboardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header skeleton */}
      <div
        style={{
          background: "var(--surface)",
          border: "0.5px solid var(--border)",
          borderRadius: 14,
          padding: "24px 28px",
          display: "flex",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 22, width: 180, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 14, width: 120, marginBottom: 14 }} />
          <div style={{ display: "flex", gap: 6 }}>
            {[80, 110, 70].map((w, i) => (
              <div key={i} className="skeleton" style={{ height: 24, width: w, borderRadius: 20 }} />
            ))}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="skeleton" style={{ height: 52, width: 80, marginBottom: 8, marginLeft: "auto" }} />
          <div className="skeleton" style={{ height: 12, width: 100 }} />
        </div>
      </div>

      {/* Metrics skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: "var(--surface-2)",
              borderRadius: 10,
              padding: "16px 20px",
            }}
          >
            <div className="skeleton" style={{ height: 11, width: 80, marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 28, width: 70 }} />
          </div>
        ))}
      </div>

      {/* Two columns skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div
          style={{
            background: "var(--surface)",
            border: "0.5px solid var(--border)",
            borderRadius: 14,
            padding: "20px 24px",
          }}
        >
          <div className="skeleton" style={{ height: 11, width: 120, marginBottom: 16 }} />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div className="skeleton" style={{ width: 8, height: 8, borderRadius: "50%" }} />
              <div className="skeleton" style={{ height: 13, flex: 1 }} />
              <div className="skeleton" style={{ height: 6, width: 80, borderRadius: 3 }} />
              <div className="skeleton" style={{ height: 13, width: 32 }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[120, 100].map((h, i) => (
            <div
              key={i}
              style={{
                background: "var(--surface)",
                border: "0.5px solid var(--border)",
                borderRadius: 14,
                padding: "20px 24px",
                height: h,
              }}
            >
              <div className="skeleton" style={{ height: 11, width: 140, marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 36, width: 100 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Risk skeleton */}
      <div
        style={{
          background: "var(--surface)",
          border: "0.5px solid var(--border)",
          borderRadius: 14,
          padding: "20px 24px",
        }}
      >
        <div className="skeleton" style={{ height: 11, width: 90, marginBottom: 16 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12, borderBottom: "0.5px solid var(--border)" }}>
              <div className="skeleton" style={{ height: 13, width: 120 }} />
              <div className="skeleton" style={{ height: 22, width: 60, borderRadius: 20 }} />
            </div>
          ))}
        </div>
      </div>

      {/* AI narrative skeleton */}
      <div
        style={{
          background: "var(--surface)",
          border: "0.5px solid var(--border)",
          borderRadius: 14,
          padding: "24px 28px",
        }}
      >
        <div className="skeleton" style={{ height: 11, width: 100, marginBottom: 16 }} />
        <div style={{ borderLeft: "2px solid var(--border)", paddingLeft: 16, marginBottom: 16 }}>
          <div className="skeleton" style={{ height: 15, width: "95%", marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 15, width: "88%", marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 15, width: "72%" }} />
        </div>
        <div className="skeleton" style={{ height: 13, width: 200, marginBottom: 10 }} />
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
            <div className="skeleton" style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0 }} />
            <div className="skeleton" style={{ height: 13, flex: 1 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
