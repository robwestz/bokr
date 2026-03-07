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
    <div className="page">
      <div className="container">
        <a href={`/r/${params.slug}`} className="back-link">← Back</a>

        <div className="card" style={{ maxWidth: 720 }}>
          <h1 style={{ marginBottom: 4 }}>Menu</h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: "0.9rem" }}>
            Version {data.menu.version}
          </p>

          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, fontSize: "1rem" }}>
            {data.menu.content || <span style={{ color: "var(--text-muted)" }}>No menu content yet.</span>}
          </div>

          {data.pdfDownloadUrl && (
            <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
              <a href={data.pdfDownloadUrl} className="btn btn-secondary" target="_blank" rel="noopener">
                📄 Download PDF Menu
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
