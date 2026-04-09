"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { NdaForm } from "@/components/NdaForm";
import type { NdaFormValues } from "@/lib/nda-types";
import { getChatHistory, patchChatValues, resetChat, sendChatMessage } from "@/lib/api";

export interface ChatMessage {
  id?: number;
  role: "user" | "assistant";
  content: string;
}

interface Props {
  initialMessages: ChatMessage[];
  values: NdaFormValues;
  onChange: (values: NdaFormValues) => void;
}

export function NdaChat({ initialMessages, values, onChange }: Props) {
  const [tab, setTab] = useState<"chat" | "edit">("chat");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await sendChatMessage(text);
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        onChange(data.values as NdaFormValues);
      } else {
        // Roll back the optimistic user message and show an error
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: "Sorry, I couldn't reach the AI service. Please try again." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "Connection error. Please check your connection and try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    await resetChat();
    const res = await getChatHistory();
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages);
      onChange(data.values as NdaFormValues);
    }
  }

  async function handleFormChange(newValues: NdaFormValues) {
    onChange(newValues);
    patchChatValues(newValues as unknown as Record<string, string>).catch(() => {});
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* ── Tab bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1.25rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: "0.25rem", flex: 1 }}>
          {(["chat", "edit"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: tab === t ? "var(--gold-dim)" : "transparent",
                border: `1px solid ${tab === t ? "var(--gold)" : "var(--foreground-subtle)"}`,
                color: tab === t ? "var(--gold)" : "var(--foreground-muted)",
                fontFamily: "var(--font-ui)",
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "0.35rem 0.75rem",
                borderRadius: 2,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {t === "chat" ? "AI Chat" : "Edit"}
            </button>
          ))}
        </div>
        <button
          onClick={handleReset}
          title="Start over"
          style={{
            background: "none",
            border: "none",
            color: "var(--foreground-subtle)",
            fontFamily: "var(--font-ui)",
            fontSize: "0.65rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
            padding: "0.35rem 0",
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--foreground-muted)")}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--foreground-subtle)")}
        >
          Reset
        </button>
      </div>

      {tab === "edit" ? (
        /* ── Edit tab: manual form ── */
        <div style={{ overflowY: "auto", flex: 1 }}>
          <NdaForm values={values} onChange={handleFormChange} />
        </div>
      ) : (
        /* ── Chat tab ── */
        <>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              paddingRight: "0.25rem",
            }}
          >
            {messages.map((m, i) => (
              <ChatBubble key={m.id ?? i} role={m.role} content={m.content} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* ── Input ── */}
          <form
            onSubmit={handleSend}
            style={{
              marginTop: "1rem",
              display: "flex",
              gap: "0.5rem",
              alignItems: "flex-end",
              borderTop: "1px solid var(--border)",
              paddingTop: "1rem",
              flexShrink: 0,
            }}
          >
            <textarea
              className="field-textarea"
              rows={2}
              placeholder="Type your response…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e as unknown as FormEvent);
                }
              }}
              disabled={loading}
              style={{ flex: 1, resize: "none" }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-gold"
              style={{
                flexShrink: 0,
                padding: "0.5rem 0.85rem",
                fontSize: "1rem",
                opacity: loading || !input.trim() ? 0.4 : 1,
              }}
            >
              ↑
            </button>
          </form>
        </>
      )}
    </div>
  );
}

function ChatBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
      <div
        style={{
          maxWidth: "88%",
          padding: "0.6rem 0.9rem",
          borderRadius: isUser ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
          background: isUser ? "var(--gold-dim)" : "var(--surface-raised)",
          border: `1px solid ${isUser ? "rgba(201,168,76,0.3)" : "var(--border)"}`,
          fontFamily: "var(--font-ui)",
          fontSize: "0.8rem",
          lineHeight: 1.6,
          color: "var(--foreground)",
          whiteSpace: "pre-wrap",
        }}
      >
        {content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start" }}>
      <div
        style={{
          padding: "0.7rem 0.9rem",
          borderRadius: "12px 12px 12px 2px",
          background: "var(--surface-raised)",
          border: "1px solid var(--border)",
          display: "flex",
          gap: 5,
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`typing-dot typing-dot-${i}`}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--foreground-muted)",
              display: "inline-block",
            }}
          />
        ))}
      </div>
    </div>
  );
}
