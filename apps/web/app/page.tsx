async function getRestaurants() {
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!api) return [];
  try {
    const res = await fetch(`${api}/admin/my/restaurants`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.restaurants ?? [];
  } catch { return []; }
}

export default async function Home() {
  const restaurants = await getRestaurants();

  return (
    <div className="page">
      <div className="container">
        <div className="hero">
          <h1>Bokr</h1>
          <p>Premium table booking for resort restaurants. Find your perfect dining experience.</p>
        </div>

        <div className="section">
          <h2>Restaurants</h2>
          {restaurants.length > 0 ? (
            <div className="card-grid">
              {restaurants.map((r: any) => (
                <a key={r.id} href={`/r/${r.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="card" style={{ cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s" }}>
                    <div style={{ fontSize: "2rem", marginBottom: 12 }}>🍽️</div>
                    <h3 style={{ fontSize: "1.2rem", marginBottom: 4 }}>{r.name}</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{r.timezone}</p>
                    <div style={{ marginTop: 16 }}>
                      <span className="btn btn-primary btn-sm" style={{ width: "100%", display: "flex" }}>View & Book</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
              <p style={{ color: "var(--text-muted)", marginBottom: 12 }}>No restaurants available yet.</p>
              <a href="/admin/login" className="btn btn-secondary btn-sm">Admin login to create one</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
