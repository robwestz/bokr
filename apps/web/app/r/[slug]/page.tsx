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

  return (
    <main>
      <h1>{data.restaurant.name}</h1>
      <p>Timezone: {data.restaurant.timezone}</p>
      <p><a href={`/r/${params.slug}/menu`}>View menu</a></p>
      <p><a href={`/r/${params.slug}/book`}>Book a table</a></p>
    </main>
  );
}
