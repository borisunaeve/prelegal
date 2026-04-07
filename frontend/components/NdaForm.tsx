"use client";

import { NdaFormValues } from "@/lib/nda-types";

interface Props {
  values: NdaFormValues;
  onChange: (values: NdaFormValues) => void;
}

export function NdaForm({ values, onChange }: Props) {
  function set<K extends keyof NdaFormValues>(key: K, value: NdaFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.25rem" }}>

      {/* ── Purpose ── */}
      <Section label="Purpose" hint="How Confidential Information may be used" delay={1}>
        <textarea
          className="field-textarea"
          rows={3}
          value={values.purpose}
          onChange={(e) => set("purpose", e.target.value)}
          placeholder="Evaluating whether to enter into a business relationship…"
        />
      </Section>

      {/* ── Effective Date ── */}
      <Section label="Effective Date" delay={2}>
        <input
          className="field-input"
          type="date"
          value={values.effectiveDate}
          onChange={(e) => set("effectiveDate", e.target.value)}
        />
      </Section>

      {/* ── MNDA Term ── */}
      <Section label="MNDA Term" hint="The length of this MNDA" delay={3}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label className="radio-pill">
            <input
              type="radio"
              checked={values.mndaTermType === "fixed"}
              onChange={() => set("mndaTermType", "fixed")}
            />
            <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.8rem", color: "var(--foreground)", display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
              Expires after
              <input
                className="field-input"
                type="number"
                min={1}
                value={values.mndaTermYears}
                onChange={(e) => set("mndaTermYears", e.target.value)}
                disabled={values.mndaTermType !== "fixed"}
                style={{ width: 40, textAlign: "center", display: "inline-block", padding: "0 0.25rem" }}
              />
              year(s)
            </span>
          </label>
          <label className="radio-pill">
            <input
              type="radio"
              checked={values.mndaTermType === "perpetual"}
              onChange={() => set("mndaTermType", "perpetual")}
            />
            <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.8rem", color: "var(--foreground)" }}>
              Until terminated
            </span>
          </label>
        </div>
      </Section>

      {/* ── Term of Confidentiality ── */}
      <Section label="Confidentiality Term" hint="How long information is protected" delay={4}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label className="radio-pill">
            <input
              type="radio"
              checked={values.confidentialityTermType === "fixed"}
              onChange={() => set("confidentialityTermType", "fixed")}
            />
            <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.8rem", color: "var(--foreground)", display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
              <input
                className="field-input"
                type="number"
                min={1}
                value={values.confidentialityTermYears}
                onChange={(e) => set("confidentialityTermYears", e.target.value)}
                disabled={values.confidentialityTermType !== "fixed"}
                style={{ width: 40, textAlign: "center", display: "inline-block", padding: "0 0.25rem" }}
              />
              year(s) from Effective Date
            </span>
          </label>
          <label className="radio-pill">
            <input
              type="radio"
              checked={values.confidentialityTermType === "perpetual"}
              onChange={() => set("confidentialityTermType", "perpetual")}
            />
            <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.8rem", color: "var(--foreground)" }}>
              In perpetuity
            </span>
          </label>
        </div>
      </Section>

      {/* ── Governing Law & Jurisdiction ── */}
      <Section label="Governing Law" delay={5}>
        <FieldRow label="State">
          <input
            className="field-input"
            value={values.governingLaw}
            onChange={(e) => set("governingLaw", e.target.value)}
            placeholder="e.g. Delaware"
          />
        </FieldRow>
        <FieldRow label="Jurisdiction">
          <input
            className="field-input"
            value={values.jurisdiction}
            onChange={(e) => set("jurisdiction", e.target.value)}
            placeholder="e.g. New Castle, DE"
          />
        </FieldRow>
      </Section>

      {/* ── Party 1 ── */}
      <Section label="Party 1" delay={6}>
        {(
          [
            ["party1Name", "Print Name", "Jane Smith"],
            ["party1Title", "Title", "CEO"],
            ["party1Company", "Company", "Acme Inc."],
            ["party1Address", "Notice Address", "jane@acme.com"],
          ] as const
        ).map(([key, label, placeholder]) => (
          <FieldRow key={key} label={label}>
            <input
              className="field-input"
              value={values[key]}
              onChange={(e) => set(key, e.target.value)}
              placeholder={placeholder}
            />
          </FieldRow>
        ))}
      </Section>

      {/* ── Party 2 ── */}
      <Section label="Party 2" delay={7}>
        {(
          [
            ["party2Name", "Print Name", "John Doe"],
            ["party2Title", "Title", "CTO"],
            ["party2Company", "Company", "Beta Corp."],
            ["party2Address", "Notice Address", "john@betacorp.com"],
          ] as const
        ).map(([key, label, placeholder]) => (
          <FieldRow key={key} label={label}>
            <input
              className="field-input"
              value={values[key]}
              onChange={(e) => set(key, e.target.value)}
              placeholder={placeholder}
            />
          </FieldRow>
        ))}
      </Section>

    </div>
  );
}

function Section({
  label,
  hint,
  delay,
  children,
}: {
  label: string;
  hint?: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <div className={`fade-up fade-up-${delay}`} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div>
        <p className="form-section-label">{label}</p>
        {hint && (
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.7rem",
              color: "var(--foreground-muted)",
              marginTop: "0.25rem",
            }}
          >
            {hint}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
      <p
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: "0.65rem",
          color: "var(--foreground-muted)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}
