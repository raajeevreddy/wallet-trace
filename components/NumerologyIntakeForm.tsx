"use client";

import { useState, FormEvent } from "react";
import { generateProfile, NumerologyProfile } from "@/lib/numerology";

interface Props {
  accent?: string;
}

export default function NumerologyIntakeForm({ accent = "#06C2D9" }: Props) {
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [alternateNames, setAlternateNames] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<NumerologyProfile | null>(null);

  function reset() {
    setError("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!fullName.trim()) {
        setError("Enter a person's full name");
        return;
      }
      if (!dateOfBirth.trim()) {
        setError("Enter date of birth (YYYY-MM-DD)");
        return;
      }

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dateOfBirth)) {
        setError("Enter date in YYYY-MM-DD format");
        return;
      }

      // Validate date is valid
      const date = new Date(dateOfBirth);
      if (isNaN(date.getTime())) {
        setError("Enter a valid date");
        return;
      }

      const generatedProfile = generateProfile(fullName, dateOfBirth, alternateNames);
      setProfile(generatedProfile);
    } catch (err) {
      setError("Error generating reading — try again");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Form Container */}
      <div style={{ marginBottom: profile ? 40 : 0 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 8 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.10em", display: "block", marginBottom: 6, fontWeight: 600 }}>
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  reset();
                }}
                placeholder="e.g., John Michael Smith"
                spellCheck={false}
                style={{
                  width: "100%",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  padding: "10px 14px",
                  border: `0.5px solid ${error ? "var(--red)" : `${accent}40`}`,
                  borderRadius: 10,
                  background: "rgba(3,15,28,0.6)",
                  color: "var(--text)",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = accent;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = error ? "var(--red)" : `${accent}40`;
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.10em", display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => {
                    setDateOfBirth(e.target.value);
                    reset();
                  }}
                  style={{
                    width: "100%",
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    padding: "10px 14px",
                    border: `0.5px solid ${error ? "var(--red)" : `${accent}40`}`,
                    borderRadius: 10,
                    background: "rgba(3,15,28,0.6)",
                    color: "var(--text)",
                    outline: "none",
                    transition: "border-color 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = accent;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = error ? "var(--red)" : `${accent}40`;
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.10em", display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Alternate Names (Optional)
                </label>
                <input
                  type="text"
                  value={alternateNames}
                  onChange={(e) => {
                    setAlternateNames(e.target.value);
                    reset();
                  }}
                  placeholder="e.g., Johnny, Michael Smith, Jack"
                  spellCheck={false}
                  style={{
                    width: "100%",
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    padding: "10px 14px",
                    border: `0.5px solid ${accent}40`,
                    borderRadius: 10,
                    background: "rgba(3,15,28,0.6)",
                    color: "var(--text)",
                    outline: "none",
                    transition: "border-color 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = accent;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = `${accent}40`;
                  }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "11px 22px",
              background: loading
                ? `${accent}18`
                : `linear-gradient(135deg, ${accent} 0%, ${accent}CC 100%)`,
              color: loading ? "var(--text-3)" : "white",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
              fontFamily: "var(--font-body)",
              boxShadow: loading ? "none" : `0 0 20px ${accent}40`,
              letterSpacing: "0.01em",
              transition: "all 0.2s",
            }}
          >
            {loading ? "Generating reading…" : "Generate Reading →"}
          </button>

          {error && <p style={{ fontSize: 12, color: "var(--red)", margin: "8px 0 0" }}>{error}</p>}
        </form>
      </div>

      {/* Results Grid */}
      {profile && (
        <div style={{ marginTop: 40 }}>
          {/* Summary Card */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(12,31,52,0.8) 0%, rgba(7,22,39,0.8) 100%)",
              border: `0.5px solid ${accent}35`,
              borderRadius: 16,
              padding: "24px",
              marginBottom: 24,
              boxShadow: `0 0 0 3px ${accent}08, 0 10px 40px rgba(0,0,0,0.3)`,
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.10em", margin: "0 0 8px" }}>
                Numerological Summary
              </p>
              <p style={{ fontSize: 32, fontWeight: 800, color: accent, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                Verdict {profile.summary.primaryVerdictNumber}
              </p>
              <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, margin: 0 }}>
                {profile.summary.overallEssence}
              </p>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {profile.summary.commonKeywords.map((kw, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: 11,
                    padding: "6px 12px",
                    background: `${accent}15`,
                    border: `0.5px solid ${accent}40`,
                    borderRadius: 20,
                    color: "var(--text-2)",
                    fontWeight: 500,
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Individual Readings Grid */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 12, fontWeight: 600 }}>
              Name Variants ({profile.readings.length})
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  typeof window !== "undefined" && window.innerWidth < 768
                    ? "1fr"
                    : "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 16,
              }}
            >
              {profile.readings.map((reading, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "linear-gradient(135deg, rgba(12,31,52,0.7) 0%, rgba(7,22,39,0.7) 100%)",
                    border: `0.5px solid ${accent}30`,
                    borderRadius: 12,
                    padding: "16px",
                    transition: "all 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, rgba(12,31,52,0.85) 0%, rgba(7,22,39,0.85) 100%)`;
                    e.currentTarget.style.borderColor = `${accent}60`;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${accent}08, 0 8px 32px rgba(0,0,0,0.3)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, rgba(12,31,52,0.7) 0%, rgba(7,22,39,0.7) 100%)`;
                    e.currentTarget.style.borderColor = `${accent}30`;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: "0 0 4px" }}>
                      {reading.name}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0 }}>
                      Verdict {reading.chain.final_verdict}
                    </p>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, fontSize: 11 }}>
                      <div style={{ background: `${accent}08`, padding: "8px", borderRadius: 6 }}>
                        <p style={{ color: "var(--text-3)", margin: "0 0 2px", fontSize: 10 }}>Name</p>
                        <p style={{ color: accent, fontWeight: 600, margin: 0 }}>{reading.chain.step1_nameNumber}</p>
                      </div>
                      <div style={{ background: `${accent}08`, padding: "8px", borderRadius: 6 }}>
                        <p style={{ color: "var(--text-3)", margin: "0 0 2px", fontSize: 10 }}>Life Path</p>
                        <p style={{ color: accent, fontWeight: 600, margin: 0 }}>{reading.chain.step2_lifePathNumber}</p>
                      </div>
                      <div style={{ background: `${accent}08`, padding: "8px", borderRadius: 6 }}>
                        <p style={{ color: "var(--text-3)", margin: "0 0 2px", fontSize: 10 }}>Destiny</p>
                        <p style={{ color: accent, fontWeight: 600, margin: 0 }}>{reading.chain.step3_destinyNumber}</p>
                      </div>
                      <div style={{ background: `${accent}08`, padding: "8px", borderRadius: 6 }}>
                        <p style={{ color: "var(--text-3)", margin: "0 0 2px", fontSize: 10 }}>Expression</p>
                        <p style={{ color: accent, fontWeight: 600, margin: 0 }}>{reading.chain.step4_expression}</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.5, margin: 0 }}>
                      <span style={{ fontWeight: 600, color: "var(--text)" }}>{reading.verdict.archetype}</span> — {reading.verdict.essence}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {reading.verdict.keywords.slice(0, 2).map((kw, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: 10,
                          padding: "4px 8px",
                          background: `${accent}20`,
                          borderRadius: 12,
                          color: "var(--text-2)",
                        }}
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Readings Expandable */}
          <details
            style={{
              background: "linear-gradient(135deg, rgba(12,31,52,0.5) 0%, rgba(7,22,39,0.5) 100%)",
              border: `0.5px solid ${accent}25`,
              borderRadius: 12,
              padding: "16px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <summary style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", userSelect: "none", cursor: "pointer" }}>
              📖 View Full Readings
            </summary>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
              {profile.readings.map((reading, idx) => (
                <div key={idx} style={{ paddingTop: 16, borderTop: `0.5px solid ${accent}20` }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: accent, marginBottom: 12, margin: "0 0 12px" }}>
                    {reading.name} — Verdict {reading.chain.final_verdict}
                  </p>
                  <pre
                    style={{
                      fontSize: 11,
                      color: "var(--text-2)",
                      background: `rgba(0,0,0,0.3)`,
                      padding: "12px",
                      borderRadius: 8,
                      overflow: "auto",
                      fontFamily: "var(--font-mono)",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                      margin: 0,
                    }}
                  >
                    {reading.reading}
                  </pre>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
