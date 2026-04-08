"use client";

// Label formatter: camelCase → "Camel Case"
function toLabel(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).trim();
}

interface Props {
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}

export function GenericDocForm({ values, onChange }: Props) {
  function set(key: string, value: string) {
    onChange({ ...values, [key]: value });
  }

  const entries = Object.entries(values);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {entries.map(([key, value]) => (
        <div key={key} style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <label
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.68rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--foreground-muted)",
            }}
          >
            {toLabel(key)}
          </label>
          {value.length > 60 ? (
            <textarea
              className="field-textarea"
              rows={3}
              value={value}
              onChange={(e) => set(key, e.target.value)}
              style={{ resize: "vertical" }}
            />
          ) : (
            <input
              type="text"
              className="field-input"
              value={value}
              onChange={(e) => set(key, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
