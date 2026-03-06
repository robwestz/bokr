"use client";
import { useState } from "react";

export default function Book({ params }: { params: { slug: string } }) {
  const [time, setTime] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [guestName, setGuestName] = useState("");
  const [guestContact, setGuestContact] = useState("");
  const [msg, setMsg] = useState("");

  async function submit() {
    setMsg("");
    const api = process.env.NEXT_PUBLIC_API_URL!;
    const res = await fetch(`${api}/restaurants/${params.slug}/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ time, partySize, guestName, guestContact }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setMsg(`Error: ${JSON.stringify(data)}`);
    setMsg(`Booked: ${data.reservation.id}`);
  }

  return (
    <main>
      <h1>Book a table</h1>
      <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
        <label>Time (ISO)<input value={time} onChange={e => setTime(e.target.value)} placeholder="2026-03-05T19:00:00.000Z" /></label>
        <label>Party size<input type="number" value={partySize} onChange={e => setPartySize(Number(e.target.value))} /></label>
        <label>Name<input value={guestName} onChange={e => setGuestName(e.target.value)} /></label>
        <label>Contact<input value={guestContact} onChange={e => setGuestContact(e.target.value)} /></label>
        <button onClick={submit}>Confirm</button>
      </div>
      {msg ? <p style={{ marginTop: 12 }}>{msg}</p> : null}
      <p style={{ fontSize: 12, opacity: 0.7 }}>Availability enforcement will be added in Phase 2.</p>
    </main>
  );
}
