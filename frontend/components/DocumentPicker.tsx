"use client";

import { useEffect, useState } from "react";
import { getDocTypes, selectDocType } from "@/lib/api";
import type { DocType } from "@/lib/doc-types";

interface Props {
  onSelect: () => void;
}

// Map each document key to a simple icon character
const DOC_ICONS: Record<string, string> = {
  "Mutual-NDA": "🤝",
  "Mutual-NDA-coverpage": "📄",
  "CSA": "☁️",
  "design-partner-agreement": "🔬",
  "sla": "📊",
  "psa": "🛠️",
  "DPA": "🔒",
  "Partnership-Agreement": "🤝",
  "Software-License-Agreement": "💻",
  "Pilot-Agreement": "🚀",
  "BAA": "🏥",
  "AI-Addendum": "🤖",
};

export function DocumentPicker({ onSelect }: Props) {
  const [docTypes, setDocTypes] = useState<DocType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    getDocTypes()
      .then((res) => res.json())
      .then(setDocTypes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSelect(key: string) {
    setSelecting(key);
    try {
      await selectDocType(key);
      onSelect();
    } catch {
      setSelecting(null);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 2rem",
        background: "var(--background)",
      }}
    >
      {/* Grid background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 900 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2.4rem",
              fontWeight: 300,
              letterSpacing: "0.04em",
              color: "var(--foreground)",
              marginBottom: "0.5rem",
            }}
          >
            Prelegal
          </h1>
          <div
            style={{
              width: 48,
              height: 1,
              background: "var(--gold)",
              margin: "0 auto 1rem",
            }}
          />
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.8rem",
              color: "var(--foreground-muted)",
              letterSpacing: "0.05em",
            }}
          >
            Choose a legal document to draft
          </p>
        </div>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              color: "var(--foreground-muted)",
              fontFamily: "var(--font-ui)",
              fontSize: "0.8rem",
            }}
          >
            Loading…
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "1rem",
            }}
          >
            {docTypes.map((dt) => (
              <DocCard
                key={dt.key}
                doc={dt}
                icon={DOC_ICONS[dt.key] ?? "📋"}
                loading={selecting === dt.key}
                disabled={selecting !== null && selecting !== dt.key}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DocCard({
  doc,
  icon,
  loading,
  disabled,
  onSelect,
}: {
  doc: DocType;
  icon: string;
  loading: boolean;
  disabled: boolean;
  onSelect: (key: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => onSelect(doc.key)}
      disabled={disabled || loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "var(--surface-raised)" : "var(--surface)",
        border: `1px solid ${hovered ? "var(--gold)" : "var(--border)"}`,
        borderRadius: 4,
        padding: "1.25rem",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        textAlign: "left",
        transition: "border-color 0.2s, background 0.2s",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>{icon}</span>
      <span
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: "0.82rem",
          fontWeight: 600,
          color: loading ? "var(--gold)" : "var(--foreground)",
          lineHeight: 1.3,
        }}
      >
        {loading ? "Setting up…" : doc.name}
      </span>
      <span
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: "0.7rem",
          color: "var(--foreground-muted)",
          lineHeight: 1.5,
        }}
      >
        {doc.description}
      </span>
    </button>
  );
}
