import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function apiFetch(path: string) {
  const api = process.env.NEXT_PUBLIC_API_URL!;
  const cookie = cookies().toString();
  return fetch(`${api}${path}`, { cache: "no-store", headers: { cookie } });
}

export default async function AdminPage() {
  const meRes = await apiFetch("/auth/me");
  if (!meRes.ok) redirect("/admin/login");
  const me = await meRes.json();

  const restaurantsRes = await apiFetch("/admin/my/restaurants");
  const restaurants = restaurantsRes.ok ? (await restaurantsRes.json()).restaurants : [];

  const isSuper = me.roles?.includes("SUPERADMIN");

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1>Dashboard</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              {me.user.email} — <span className={`tag ${isSuper ? "tag-green" : "tag-yellow"}`}>
                {me.roles?.join(", ")}
              </span>
            </p>
          </div>
          <a href="/auth/logout" className="btn btn-secondary btn-sm">Sign out</a>
        </div>

        <div className="section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2>Restaurants</h2>
            {isSuper && (
              <a href="/admin/super/restaurants/new" className="btn btn-primary btn-sm">+ New Restaurant</a>
            )}
          </div>

          {restaurants.length > 0 ? (
            <div className="card-grid">
              {restaurants.map((r: any) => (
                <a key={r.id} href={`/admin/restaurants/${r.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="card" style={{ cursor: "pointer" }}>
                    <h3 style={{ marginBottom: 4 }}>{r.name}</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      /{r.slug} — {r.timezone}
                    </p>
                    <div style={{ marginTop: 12 }}>
                      <span className="tag tag-green">Active</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: "center", padding: "32px" }}>
              <p style={{ color: "var(--text-muted)" }}>No restaurants yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
