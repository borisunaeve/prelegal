"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NdaChat, type ChatMessage } from "@/components/NdaChat";
import { NdaPreview } from "@/components/NdaPreview";
import { defaultValues } from "@/lib/nda-types";
import type { NdaFormValues } from "@/lib/nda-types";
import { getChatHistory, getMe, logout } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [values, setValues] = useState<NdaFormValues>(defaultValues);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const authRes = await getMe();
        if (!authRes.ok) { router.replace("/login"); return; }

        const user = await authRes.json();
        setUserName(user.name);

        const historyRes = await getChatHistory();
        if (historyRes.ok) {
          const history = await historyRes.json();
          setValues(history.values as NdaFormValues);
          setInitialMessages(history.messages as ChatMessage[]);
        }

        setAuthChecked(true);
      } catch {
        router.replace("/login");
      }
    })();
  }, [router]);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  if (!authChecked) return null;

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "var(--background)" }}>

      {/* ── Header ── */}
      <header
        className="no-print sticky top-0 z-20 flex items-center justify-between px-8 py-4"
        style={{
          background: "rgba(9,9,14,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-3">
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.6rem",
              fontWeight: 300,
              letterSpacing: "0.04em",
              color: "var(--foreground)",
              lineHeight: 1,
            }}
          >
            Prelegal
          </span>
          <span style={{ width: 1, height: 20, background: "var(--foreground-subtle)", display: "inline-block" }} />
          <span
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.7rem",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--foreground-muted)",
            }}
          >
            Mutual NDA Creator
          </span>
        </div>

        <div className="flex items-center gap-4">
          {userName && (
            <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
              {userName}
            </span>
          )}
          <button className="btn-gold" onClick={() => window.print()}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download PDF
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              fontFamily: "var(--font-ui)",
              fontSize: "0.7rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--foreground-muted)",
              cursor: "pointer",
              padding: "0.5rem 0",
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: Chat panel */}
        <aside
          className="no-print flex flex-col overflow-hidden"
          style={{
            width: 340,
            flexShrink: 0,
            background: "var(--surface)",
            borderRight: "1px solid var(--border)",
            padding: "1.5rem",
          }}
        >
          <div style={{ marginBottom: "1.25rem", flexShrink: 0 }}>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.4rem",
                fontWeight: 400,
                color: "var(--foreground)",
                lineHeight: 1.2,
                marginBottom: "0.25rem",
              }}
            >
              Agreement Details
            </p>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "var(--foreground-muted)", lineHeight: 1.5 }}>
              Chat with the AI or edit fields directly.
            </p>
          </div>

          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <NdaChat
              initialMessages={initialMessages}
              values={values}
              onChange={setValues}
            />
          </div>
        </aside>

        {/* Right: Document preview */}
        <main
          className="print-full flex-1 overflow-y-auto"
          style={{ background: "var(--background)", padding: "3rem 2rem" }}
        >
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
          <div
            className="paper-card mx-auto relative z-10 fade-up"
            style={{ maxWidth: 760, padding: "4rem 5rem", borderRadius: 4 }}
          >
            <NdaPreview values={values} />
          </div>
          <p
            className="no-print text-center relative z-10 fade-up fade-up-3"
            style={{
              marginTop: "1.5rem",
              fontFamily: "var(--font-ui)",
              fontSize: "0.65rem",
              color: "var(--foreground-subtle)",
              letterSpacing: "0.05em",
            }}
          >
            Common Paper Mutual NDA Standard v1.0 · CC BY 4.0
          </p>
        </main>
      </div>
    </div>
  );
}
