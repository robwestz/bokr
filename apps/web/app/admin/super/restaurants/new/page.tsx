"use client";

import { useState } from "react";

export default function NewRestaurant() {
  const [name, setName] = useState("New Restaurant");
  const [slug, setSlug] = useState("new-restaurant");
  const [timezone, setTimezone] = useState("Indian/Maldives");
  const [msg, setMsg] = useState("");

  async function create() {
    setMsg("");
    const api = process.env.NEXT_PUBLIC_API_URL!;
    const res = await fetch(`${api}/admin/restaurants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, slug, timezone }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setMsg(`Error: ${JSON.stringify(data)}`);
    window.location.href = `/admin/restaurants/${data.restaurant.id}`;
  }

  return (
    <main>
      <h1>Create restaurant (superadmin)</h1>
      <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
        <label>Name<input value={name} onChange={e => setName(e.target.value)} /></label>
        <label>Slug<input value={slug} onChange={e => setSlug(e.target.value)} /></label>
        <label>Timezone<input value={timezone} onChange={e => setTimezone(e.target.value)} /></label>
        <button onClick={create}>Create</button>
      </div>
      {msg ? <p style={{ marginTop: 12 }}>{msg}</p> : null}
    </main>
  );
}
