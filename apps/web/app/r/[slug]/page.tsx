import { notFound } from "next/navigation";

async function getRestaurant(slug: string) {
  const api = process.env.NEXT_PUBLIC_API_URL!;
  const res = await fetch(`${api}/restaurants/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function RestaurantPage({ params }: { params: { slug: string } }) {
  const data = await getRestaurant(params.slug);
  if (!data?.restaurant) return notFound();
  const r = data.restaurant;

  return (
    <div className="page">
      <div className="container">
        <a href="/" className="back-link">← All restaurants</a>

        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h1 style={{ fontSize: "2rem", marginBottom: 8 }}>{r.name}</h1>
              <p style={{ color: "var(--text-muted)" }}>📍 {r.timezone}</p>
            </div>
            <a href={`/r/${params.slug}/book`} className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>
              Book a Table
            </a>
          </div>
        </div>

        <div className="card-grid">
          <a href={`/r/${params.slug}/menu`} style={{ textDecoration: "none", color: "inherit" }}>
            <div className="card" style={{ cursor: "pointer" }}>
              <h3 style={{ marginBottom: 8 }}>📋 Menu</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>View our dishes and drinks</p>
            </div>
          </a>
          <a href={`/r/${params.slug}/book`} style={{ textDecoration: "none", color: "inherit" }}>
            <div className="card" style={{ cursor: "pointer" }}>
              <h3 style={{ marginBottom: 8 }}>🗓️ Reservations</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Check availability and book your table</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
