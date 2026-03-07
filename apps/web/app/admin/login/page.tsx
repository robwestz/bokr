"use client";
import { useState } from "react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setMsg("");
    setLoading(true);
    const api = process.env.NEXT_PUBLIC_API_URL!;
    const res = await fetch(`${api}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) return setMsg("Invalid credentials. Please try again.");
    window.location.href = "/admin";
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 420 }}>
        <div className="card" style={{ marginTop: 48 }}>
          <h1 style={{ marginBottom: 24, textAlign: "center" }}>Admin Login</h1>
          <div style={{ display: "grid", gap: 16 }}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === "Enter" && login()} />
            </div>
            <button className="btn btn-primary" onClick={login} disabled={loading} style={{ width: "100%" }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
          {msg && <div className="msg msg-error" style={{ marginTop: 16 }}>{msg}</div>}
        </div>
      </div>
    </div>
  );
}
