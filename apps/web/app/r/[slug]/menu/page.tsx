import { notFound } from "next/navigation";

type Props = { params: { slug: string } };

async function getMenu(slug: string) {
  const api = process.env.NEXT_PUBLIC_API_URL!;
  const res = await fetch(`${api}/restaurants/${slug}/menus/MAIN`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function MenuPage({ params }: Props) {
  const data = await getMenu(params.slug);
  if (!data?.menu) return notFound();

  return (
    <main>
      <h1>Menu</h1>
      <pre style={{ whiteSpace: "pre-wrap" }}>{data.menu.content}</pre>
      {data.pdfDownloadUrl ? (
        <p><a href={data.pdfDownloadUrl}>Download PDF</a> (signed)</p>
      ) : (
        <p>No PDF available.</p>
      )}
    </main>
  );
}
