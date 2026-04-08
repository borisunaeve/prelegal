"use client";

import { useEffect, useRef, useState } from "react";
import { renderDocument } from "@/lib/api";

interface Props {
  values: Record<string, string>;
  documentType: string;
  docName: string;
}

export function GenericDocPreview({ values, documentType, docName }: Props) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Debounce fetches so rapid field changes don't spam the backend
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setLoading(true);
      renderDocument()
        .then((res) => res.json())
        .then((data) => setHtml(data.html ?? ""))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // Re-fetch when values or document type changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values), documentType]);

  return (
    <div
      className="nda-document"
      style={{
        fontFamily: "var(--font-document)",
        fontSize: "0.9rem",
        lineHeight: 1.75,
        color: "#1a1814",
        position: "relative",
        minHeight: 200,
      }}
    >
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.8rem",
            fontWeight: 400,
            letterSpacing: "0.02em",
            color: "#0f0d09",
            marginBottom: "0.4rem",
          }}
        >
          {docName}
        </h1>
        <div
          style={{
            width: 48,
            height: 2,
            background: "#c9a84c",
            margin: "0 auto 0.6rem",
          }}
        />
        <p
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "0.7rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#888",
          }}
        >
          Common Paper Standard
        </p>
      </div>

      {loading && (
        <div
          style={{
            position: "absolute",
            top: "6rem",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            color: "#aaa8a0",
            fontFamily: "var(--font-ui)",
            fontSize: "0.75rem",
          }}
        >
          Rendering…
        </div>
      )}

      <div
        style={{ opacity: loading ? 0.3 : 1, transition: "opacity 0.2s" }}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <p
        style={{
          fontSize: "0.7rem",
          color: "#aaa",
          marginTop: "2rem",
          fontFamily: "var(--font-ui)",
        }}
      >
        Common Paper {docName} free to use under{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#c9a84c" }}
        >
          CC BY 4.0
        </a>
        .
      </p>
    </div>
  );
}
