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

  const res = await apiFetch(`/admin/restaurants/${params.restaurantId}/menus/MAIN`);
  if (!res.ok) {
    return (
      <main>
        <h1>Restaurant admin</h1>
        <p>Could not load menu (access?)</p>
        <p><a href="/admin">Back</a></p>
      </main>
    );
  }
  const data = await res.json();

  return (
    <main>
      <h1>Restaurant admin</h1>
      <p><a href="/admin">← Back</a></p>

      <section style={{ marginTop: 16 }}>
        <h2>Main menu</h2>
        <p>Published: <b>{String(data.menu.isPublished)}</b> • Version: {data.menu.version}</p>
        <p><a href={`/admin/restaurants/${params.restaurantId}/menu`}>Edit menu</a></p>
      </section>
    </main>
  );
}
