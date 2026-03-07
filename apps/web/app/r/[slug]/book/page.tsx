"use client";
import { useState, useEffect } from "react";

type Slot = {
  sittingId: string;
  label: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  bookedCount: number;
  availableCapacity: number;
};

export default function Book({ params }: { params: { slug: string } }) {
  const api = process.env.NEXT_PUBLIC_API_URL!;

  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [partySize, setPartySize] = useState(2);
  const [guestName, setGuestName] = useState("");
  const [guestContact, setGuestContact] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error" | "info">("info");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState<any>(null);
  const [noSittings, setNoSittings] = useState(false);

  // Default to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().slice(0, 10));
  }, []);

  // Fetch availability when date changes
  useEffect(() => {
    if (!date) return;
    setSlots([]);
    setSelectedSlot(null);
    setNoSittings(false);

    fetch(`${api}/restaurants/${params.slug}/availability?date=${date}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.slots?.length > 0) {
          setSlots(data.slots);
        } else {
          setNoSittings(true);
        }
      })
      .catch(() => setNoSittings(true));
  }, [date]);

  async function submit() {
    if (!guestName || !guestContact) {
      setMsg("Please fill in your name and contact.");
      setMsgType("error");
      return;
    }

    setLoading(true);
    setMsg("");

    let time: string;
    if (selectedSlot) {
      time = `${date}T${selectedSlot.startTime}:00Z`;
    } else {
      setMsg("Please select a time slot.");
      setMsgType("error");
      setLoading(false);
      return;
    }

    const idempotencyKey = crypto.randomUUID();

    const res = await fetch(`${api}/restaurants/${params.slug}/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ time, partySize, guestName, guestContact, idempotencyKey }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      if (data.error === "capacity_exceeded") {
        setMsg("Sorry, this time slot is fully booked. Please choose another.");
      } else {
        setMsg(data.message || data.error || "Booking failed. Please try again.");
      }
      setMsgType("error");
      return;
    }

    setConfirmed(data.reservation);
  }

  if (confirmed) {
    return (
      <div className="page">
        <div className="container">
          <div className="card confirmation">
            <div className="check">✓</div>
            <h1 style={{ marginBottom: 8 }}>Booking Confirmed</h1>
            <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
              Your table has been reserved.
            </p>
            <div className="card" style={{ textAlign: "left", maxWidth: 400, margin: "0 auto" }}>
              <p><strong>Name:</strong> {confirmed.guestName}</p>
              <p><strong>Date:</strong> {new Date(confirmed.time).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {new Date(confirmed.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
              <p><strong>Party size:</strong> {confirmed.partySize}</p>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 12 }}>
                Ref: {confirmed.id}
              </p>
            </div>
            <div style={{ marginTop: 24 }}>
              <a href={`/r/${params.slug}`} className="btn btn-secondary">Back to restaurant</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <a href={`/r/${params.slug}`} className="back-link">← Back</a>

        <h1 style={{ marginBottom: 24 }}>Book a Table</h1>

        <div style={{ display: "grid", gap: 24, maxWidth: 560 }}>
          {/* Date picker */}
          <div className="card">
            <div className="form-group">
              <label>Select Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)} />
            </div>
          </div>

          {/* Time slots */}
          {date && (
            <div className="card">
              <h3 style={{ marginBottom: 12 }}>Available Times</h3>
              {slots.length > 0 ? (
                <div className="slot-grid">
                  {slots.map((slot) => {
                    const isFull = slot.availableCapacity <= 0;
                    const isSelected = selectedSlot?.sittingId === slot.sittingId;
                    return (
                      <button
                        key={slot.sittingId}
                        className={`slot-btn ${isSelected ? "selected" : ""} ${isFull ? "full" : ""}`}
                        onClick={() => !isFull && setSelectedSlot(slot)}
                        disabled={isFull}
                      >
                        {slot.startTime}
                        <div className="slot-cap">
                          {isFull ? "Full" : `${slot.availableCapacity} left`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : noSittings ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  No time slots configured for this date. Contact the restaurant directly.
                </p>
              ) : (
                <p style={{ color: "var(--text-muted)" }}>Loading...</p>
              )}
            </div>
          )}

          {/* Guest details */}
          {selectedSlot && (
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Your Details</h3>
              <div style={{ display: "grid", gap: 16 }}>
                <div className="form-group">
                  <label>Party Size</label>
                  <select value={partySize} onChange={(e) => setPartySize(Number(e.target.value))}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Full Name</label>
                  <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="John Smith" />
                </div>
                <div className="form-group">
                  <label>Email or Phone</label>
                  <input value={guestContact} onChange={(e) => setGuestContact(e.target.value)} placeholder="john@example.com" />
                </div>
              </div>
            </div>
          )}

          {/* Summary & confirm */}
          {selectedSlot && guestName && guestContact && (
            <div className="card" style={{ background: "var(--ocean-light)", borderColor: "var(--ocean)" }}>
              <h3 style={{ marginBottom: 8 }}>Booking Summary</h3>
              <p>{date} at {selectedSlot.startTime} — {selectedSlot.label}</p>
              <p>{partySize} {partySize === 1 ? "guest" : "guests"}, {guestName}</p>
              <button className="btn btn-primary" onClick={submit} disabled={loading}
                style={{ marginTop: 16, width: "100%" }}>
                {loading ? "Confirming..." : "Confirm Booking"}
              </button>
            </div>
          )}

          {msg && <div className={`msg msg-${msgType}`}>{msg}</div>}
        </div>
      </div>
    </div>
  );
}
