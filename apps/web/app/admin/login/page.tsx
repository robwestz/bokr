"use client";
import { useState } from "react";

export default function AdminLogin() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin123!");
  const [msg, setMsg] = useState("");

  async function login() {
    setMsg("");
    const api = process.env.NEXT_PUBLIC_API_URL!;
    const res = await fetch(`${api}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return setMsg("Login failed");
    window.location.href = "/admin";
  }

  return (
    <main>
      <h1>Admin login</h1>
      <div style={{ display: "grid", gap: 8, maxWidth: 360 }}>
        <label>Email<input value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
        <button onClick={login}>Login</button>
      </div>
      {msg ? <p>{msg}</p> : null}
    </main>
  );
}
