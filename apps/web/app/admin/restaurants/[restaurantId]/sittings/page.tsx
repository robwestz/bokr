"use client";
import { useEffect, useState } from "react";

type Sitting = {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  dayOfWeek: number | null;
  isActive: boolean;
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function SittingsPage({ params }: { params: { restaurantId: string } }) {
  const api = process.env.NEXT_PUBLIC_API_URL!;
  const [sittings, setSittings] = useState<Sitting[]>([]);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");
  const [showForm, setShowForm] = useState(false);

  // New sitting form
  const [label, setLabel] = useState("");
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("20:00");
  const [maxCapacity, setMaxCapacity] = useState(20);
  const [dayOfWeek, setDayOfWeek] = useState<string>("all");

  async function load() {
    const res = await fetch(`${api}/admin/restaurants/${params.restaurantId}/sittings`, { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setSittings(data.sittings);
    }
  }

  useEffect(() => { load(); }, []);

  async function addSitting() {
    setMsg("");
    const body: any = { label, startTime, endTime, maxCapacity };
    if (dayOfWeek !== "all") body.dayOfWeek = Number(dayOfWeek);

    const res = await fetch(`${api}/admin/restaurants/${params.restaurantId}/sittings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      setMsg("Failed to create sitting.");
      setMsgType("error");
      return;
    }

    setMsg("Sitting created!");
    setMsgType("success");
    setShowForm(false);
    setLabel("");
    load();
  }

  async function toggleActive(sitting: Sitting) {
    await fetch(`${api}/admin/restaurants/${params.restaurantId}/sittings/${sitting.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ isActive: !sitting.isActive }),
    });
    load();
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        <a href={`/admin/restaurants/${params.restaurantId}`} className="back-link">← Back</a>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1>Sittings</h1>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add Sitting"}
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>New Sitting</h3>
            <div style={{ display: "grid", gap: 16 }}>
              <div className="form-group">
                <label>Label</label>
                <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Dinner, Lunch" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label>Start Time</label>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label>Max Capacity</label>
                  <input type="number" value={maxCapacity} onChange={(e) => setMaxCapacity(Number(e.target.value))} min={1} />
                </div>
                <div className="form-group">
                  <label>Day</label>
                  <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
                    <option value="all">Every day</option>
                    {DAYS.map((d, i) => (
                      <option key={i} value={i}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button className="btn btn-primary" onClick={addSitting} disabled={!label}>
                Create Sitting
              </button>
            </div>
          </div>
        )}

        {msg && <div className={`msg msg-${msgType}`} style={{ marginBottom: 16 }}>{msg}</div>}

        {sittings.length > 0 ? (
          <div style={{ display: "grid", gap: 8 }}>
            {sittings.map((s) => (
              <div key={s.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", opacity: s.isActive ? 1 : 0.5 }}>
                <div>
                  <strong>{s.label}</strong>
                  <span style={{ color: "var(--text-muted)", marginLeft: 12, fontSize: "0.9rem" }}>
                    {s.startTime} – {s.endTime}
                  </span>
                  <span style={{ color: "var(--text-muted)", marginLeft: 12, fontSize: "0.85rem" }}>
                    {s.maxCapacity} seats
                  </span>
                  {s.dayOfWeek !== null && (
                    <span className="tag tag-yellow" style={{ marginLeft: 8 }}>{DAYS[s.dayOfWeek]}</span>
                  )}
                </div>
                <button className={`btn btn-sm ${s.isActive ? "btn-secondary" : "btn-primary"}`}
                  onClick={() => toggleActive(s)}>
                  {s.isActive ? "Disable" : "Enable"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: "center", padding: "32px" }}>
            <p style={{ color: "var(--text-muted)" }}>No sittings configured. Add your first time slot above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
