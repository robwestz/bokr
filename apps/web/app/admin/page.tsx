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

  return (
    <main>
      <h1>Admin</h1>
      <p>{me.user.email}</p>
      <p>Roles: {me.roles?.join(", ")}</p>

      <section style={{ marginTop: 24 }}>
        <h2>Restaurants</h2>
        <ul>
          {restaurants.map((r: any) => (
            <li key={r.id}>
              <a href={`/admin/restaurants/${r.id}`}>{r.name}</a>
              {" "}(<code>{r.slug}</code>)
            </li>
          ))}
        </ul>

        {me.roles?.includes("SUPERADMIN") ? (
          <p><a href="/admin/super/restaurants/new">+ Create restaurant</a></p>
        ) : null}
      </section>
    </main>
  );
}
