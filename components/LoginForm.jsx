"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Login failed.");
      }

      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <div style={{ fontSize: 11, fontWeight: 800, color: "#6c6548", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 12 }}>
          Private Budget Access
        </div>
        <h1 className="login-title">CodexPaycheckDashboard</h1>
        <p className="login-copy">
          Same paycheck dashboard model, but stored in a shared backend so your phone and desktop see the same live numbers.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            className="input"
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error ? <div className="login-error">{error}</div> : null}

          <button className="btn btn-primary" type="submit" disabled={pending} style={{ width: "100%", marginTop: 4 }}>
            {pending ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </section>
    </main>
  );
}
