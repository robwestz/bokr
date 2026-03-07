"use client";
import { useState } from "react";

export default function NewRestaurant() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [timezone, setTimezone] = useState("Indian/Maldives");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  }

  async function create() {
    setMsg("");
    setLoading(true);
    const api = process.env.NEXT_PUBLIC_API_URL!;
    const res = await fetch(`${api}/admin/restaurants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, slug, timezone }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setMsg(data.error || "Failed to create restaurant.");
    window.location.href = `/admin/restaurants/${data.restaurant.id}`;
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 520 }}>
        <a href="/admin" className="back-link">← Dashboard</a>

        <div className="card">
          <h1 style={{ marginBottom: 24 }}>New Restaurant</h1>
          <div style={{ display: "grid", gap: 16 }}>
            <div className="form-group">
              <label>Restaurant Name</label>
              <input value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Sunset Grill" />
            </div>
            <div className="form-group">
              <label>URL Slug</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="sunset-grill" />
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Guests will visit: /r/{slug || "..."}
              </span>
            </div>
            <div className="form-group">
              <label>Timezone</label>
              <input value={timezone} onChange={(e) => setTimezone(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={create} disabled={loading || !name || !slug}
              style={{ width: "100%" }}>
              {loading ? "Creating..." : "Create Restaurant"}
            </button>
          </div>
          {msg && <div className="msg msg-error" style={{ marginTop: 16 }}>{msg}</div>}
        </div>
      </div>
    </div>
  );
}
