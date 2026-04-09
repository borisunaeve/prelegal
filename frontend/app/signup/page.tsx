"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signup, getMe } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getMe().then((res) => {
      if (res.ok) router.replace("/");
      else setChecking(false);
    }).catch(() => setChecking(false));
  }, [router]);

  if (checking) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await signup(name, email, password);
      if (res.ok) {
        router.push("/");
      } else {
        const data = await res.json();
        setError(data.detail || "Signup failed");
      }
    } catch {
      setError("Connection error. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--background)" }}
    >
      {/* Subtle grid */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

      <div className="relative fade-up" style={{ width: "100%", maxWidth: 400, padding: "0 1.5rem" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2rem",
              fontWeight: 300,
              letterSpacing: "0.04em",
              color: "var(--foreground)",
            }}
          >
            Prelegal
          </span>
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.7rem",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--foreground-muted)",
              marginTop: "0.5rem",
            }}
          >
            Create your account
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            padding: "2.5rem",
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label
                htmlFor="name"
                className="form-section-label"
                style={{ marginBottom: "0.75rem", display: "block" }}
              >
                Full Name
              </label>
              <input
                id="name"
                className="field-input"
                type="text"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="form-section-label"
                style={{ marginBottom: "0.75rem", display: "block" }}
              >
                Email
              </label>
              <input
                id="email"
                className="field-input"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="form-section-label"
                style={{ marginBottom: "0.75rem", display: "block" }}
              >
                Password
              </label>
              <input
                id="password"
                className="field-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="form-section-label"
                style={{ marginBottom: "0.75rem", display: "block" }}
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                className="field-input"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            {error && (
              <p
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.8rem",
                  color: "var(--destructive)",
                  margin: 0,
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn-gold"
              disabled={loading}
              style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            fontFamily: "var(--font-ui)",
            fontSize: "0.8rem",
            color: "var(--foreground-muted)",
          }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            style={{ color: "var(--gold)", textDecoration: "none" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
