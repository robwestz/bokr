"use client";

import { useEffect, useState } from "react";

type Props = { params: { restaurantId: string } };

export default function MenuEditor({ params }: Props) {
  const api = process.env.NEXT_PUBLIC_API_URL!;
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [msg, setMsg] = useState("");
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [objectKey, setObjectKey] = useState<string | null>(null);

  async function load() {
    setMsg("");
    const res = await fetch(`${api}/admin/restaurants/${params.restaurantId}/menus/MAIN`, { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setMsg(`Load failed: ${JSON.stringify(data)}`);
    setContent(data.menu.content ?? "");
    setIsPublished(Boolean(data.menu.isPublished));
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setMsg("");
    const res = await fetch(`${api}/admin/restaurants/${params.restaurantId}/menus/MAIN`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content, isPublished }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setMsg(`Save failed: ${JSON.stringify(data)}`);
    setMsg("Saved!");
  }

  async function initPdfUpload() {
    setMsg("");
    const res = await fetch(`${api}/admin/restaurants/${params.restaurantId}/menus/MAIN/pdf/init`, {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setMsg(`Init failed: ${JSON.stringify(data)}`);

    setUploadUrl(data.upload.uploadUrl);
    setObjectKey(data.upload.objectKey);
    setMsg("Upload URL generated. Choose a PDF to upload.");
  }

  async function uploadPdf(file: File) {
    if (!uploadUrl) return;
    setMsg("");
    const put = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/pdf" },
      body: file,
    });
    if (!put.ok) return setMsg("Upload failed (PUT).");

    const fin = await fetch(`${api}/admin/restaurants/${params.restaurantId}/menus/MAIN/pdf/finalize`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ objectKey }),
    });
    const finData = await fin.json().catch(() => ({}));
    if (!fin.ok) return setMsg(`Finalize failed: ${JSON.stringify(finData)}`);
    setMsg("PDF uploaded and finalized (scan placeholder).");
  }

  return (
    <main>
      <h1>Edit menu</h1>
      <p><a href={`/admin/restaurants/${params.restaurantId}`}>← Back</a></p>

      <div style={{ display: "grid", gap: 10, maxWidth: 760 }}>
        <label>
          Published
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} style={{ marginLeft: 8 }} />
        </label>

        <label>
          Content
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} style={{ width: "100%" }} />
        </label>

        <button onClick={save}>Save</button>

        <hr />

        <h2>Menu PDF</h2>
        <button onClick={initPdfUpload}>Generate upload URL</button>
        {uploadUrl ? (
          <input type="file" accept="application/pdf" onChange={(e) => e.target.files?.[0] && uploadPdf(e.target.files[0])} />
        ) : null}

        {msg ? <p style={{ marginTop: 8 }}>{msg}</p> : null}
      </div>
    </main>
  );
}
