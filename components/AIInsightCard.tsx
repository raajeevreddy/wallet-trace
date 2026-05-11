import type { AIAnalysis } from "@/lib/types";

interface Props {
  narrative: AIAnalysis;
}

export default function AIInsightCard({ narrative }: Props) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "0.5px solid var(--border-strong)",
        borderRadius: 14,
        padding: "24px 28px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "var(--green-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 1L7.5 4.5L11 5L8.5 7.5L9 11L6 9.5L3 11L3.5 7.5L1 5L4.5 4.5L6 1Z"
              fill="var(--green)"
            />
          </svg>
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "var(--text-3)",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}
        >
          AI Analysis
        </div>
      </div>

      {/* Main summary */}
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.7,
          color: "var(--text)",
          margin: "0 0 20px",
          borderLeft: "2px solid var(--green)",
          paddingLeft: 16,
        }}
      >
        {narrative.summary}
      </p>

      {/* Key insights + risk flags side by side */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
          marginBottom: narrative.analystNote ? 20 : 0,
        }}
      >
        {/* Key insights */}
        {narrative.keyInsights.length > 0 && (
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "var(--text-3)",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                marginBottom: 10,
              }}
            >
              Key insights
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {narrative.keyInsights.map((insight, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "var(--green-bg)",
                      color: "var(--green-dim)",
                      fontSize: 10,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {i + 1}
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--text-2)", margin: 0 }}>
                    {insight}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk flags */}
        {narrative.riskFlags.length > 0 && (
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "var(--text-3)",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                marginBottom: 10,
              }}
            >
              Risk flags
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {narrative.riskFlags.map((flag, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "var(--amber-bg)",
                      color: "var(--amber)",
                      fontSize: 11,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    ⚠
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--text-2)", margin: 0 }}>
                    {flag}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Analyst note */}
      {narrative.analystNote && (
        <div
          style={{
            marginTop: 16,
            padding: "12px 16px",
            background: "var(--surface-2)",
            borderRadius: 8,
            fontSize: 13,
            color: "var(--text-2)",
            lineHeight: 1.6,
          }}
        >
          <span
            style={{
              fontWeight: 500,
              color: "var(--text-3)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              display: "block",
              marginBottom: 4,
            }}
          >
            Analyst note
          </span>
          {narrative.analystNote}
        </div>
      )}
    </div>
  );
}
