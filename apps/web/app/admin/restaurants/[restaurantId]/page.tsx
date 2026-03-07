import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function apiFetch(path: string) {
  const api = process.env.NEXT_PUBLIC_API_URL!;
  const cookie = cookies().toString();
  return fetch(`${api}${path}`, { cache: "no-store", headers: { cookie } });
}

export default async function RestaurantAdmin({ params }: { params: { restaurantId: string } }) {
  const meRes = await apiFetch("/auth/me");
  if (!meRes.ok) redirect("/admin/login");

  const menuRes = await apiFetch(`/admin/restaurants/${params.restaurantId}/menus/MAIN`);
  const sittingsRes = await apiFetch(`/admin/restaurants/${params.restaurantId}/sittings`);

  const menuData = menuRes.ok ? await menuRes.json() : null;
  const sittingsData = sittingsRes.ok ? await sittingsRes.json() : null;
  const sittings = sittingsData?.sittings ?? [];

  return (
    <div className="page">
      <div className="container">
        <a href="/admin" className="back-link">← Dashboard</a>

        <h1 style={{ marginBottom: 32 }}>Restaurant Management</h1>

        <div className="card-grid">
          {/* Menu card */}
          <div className="card">
            <h3 style={{ marginBottom: 12 }}>📋 Menu</h3>
            {menuData?.menu ? (
              <>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <span className={`tag ${menuData.menu.isPublished ? "tag-green" : "tag-yellow"}`}>
                    {menuData.menu.isPublished ? "Published" : "Draft"}
                  </span>
                  <span className="tag" style={{ background: "var(--sand-dark)", color: "var(--text-muted)" }}>
                    v{menuData.menu.version}
                  </span>
                </div>
                <a href={`/admin/restaurants/${params.restaurantId}/menu`} className="btn btn-secondary btn-sm" style={{ width: "100%" }}>
                  Edit Menu
                </a>
              </>
            ) : (
              <a href={`/admin/restaurants/${params.restaurantId}/menu`} className="btn btn-primary btn-sm" style={{ width: "100%" }}>
                Create Menu
              </a>
            )}
          </div>

          {/* Sittings card */}
          <div className="card">
            <h3 style={{ marginBottom: 12 }}>🕐 Sittings</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 12 }}>
              {sittings.length} sitting{sittings.length !== 1 ? "s" : ""} configured
            </p>
            {sittings.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                {sittings.slice(0, 4).map((s: any) => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: "0.85rem" }}>
                    <span>{s.label}</span>
                    <span style={{ color: "var(--text-muted)" }}>{s.startTime}–{s.endTime} ({s.maxCapacity} cap)</span>
                  </div>
                ))}
              </div>
            )}
            <a href={`/admin/restaurants/${params.restaurantId}/sittings`} className="btn btn-secondary btn-sm" style={{ width: "100%" }}>
              Manage Sittings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
