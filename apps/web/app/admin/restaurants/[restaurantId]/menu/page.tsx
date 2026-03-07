"use client";
import { useEffect, useState } from "react";

type Props = { params: { restaurantId: string } };

export default function MenuEditor({ params }: Props) {
  const api = process.env.NEXT_PUBLIC_API_URL!;
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [objectKey, setObjectKey] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`${api}/admin/restaurants/${params.restaurantId}/menus/MAIN`, { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setContent(data.menu.content ?? "");
      setIsPublished(Boolean(data.menu.isPublished));
    }
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
    if (!res.ok) { setMsg("Save failed."); setMsgType("error"); return; }
    setMsg("Menu saved!"); setMsgType("success");
  }

  async function initPdfUpload() {
    setMsg("");
    const res = await fetch(`${api}/admin/restaurants/${params.restaurantId}/menus/MAIN/pdf/init`, {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setMsg("Failed to generate upload URL."); setMsgType("error"); return; }
    setUploadUrl(data.upload.uploadUrl);
    setObjectKey(data.upload.objectKey);
    setMsg("Upload URL ready. Choose your PDF."); setMsgType("success");
  }

  async function uploadPdf(file: File) {
    if (!uploadUrl) return;
    setMsg("");
    const put = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": "application/pdf" }, body: file });
    if (!put.ok) { setMsg("Upload failed."); setMsgType("error"); return; }

    const fin = await fetch(`${api}/admin/restaurants/${params.restaurantId}/menus/MAIN/pdf/finalize`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ objectKey }),
    });
    if (!fin.ok) { setMsg("Finalize failed."); setMsgType("error"); return; }
    setMsg("PDF uploaded successfully!"); setMsgType("success");
    setUploadUrl(null);
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        <a href={`/admin/restaurants/${params.restaurantId}`} className="back-link">← Back</a>

        <h1 style={{ marginBottom: 24 }}>Edit Menu</h1>

        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3>Content</h3>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.9rem" }}>
              <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
              Published
            </label>
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={14}
              placeholder="Enter your menu content here..." style={{ width: "100%", fontFamily: "inherit" }} />
          </div>

          <button className="btn btn-primary" onClick={save} style={{ width: "100%" }}>
            Save Menu
          </button>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 12 }}>PDF Menu</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 16 }}>
            Upload a PDF version of your menu for guests to download.
          </p>

          {!uploadUrl ? (
            <button className="btn btn-secondary" onClick={initPdfUpload}>
              Generate Upload URL
            </button>
          ) : (
            <div className="form-group">
              <label>Choose PDF File</label>
              <input type="file" accept="application/pdf"
                onChange={(e) => e.target.files?.[0] && uploadPdf(e.target.files[0])} />
            </div>
          )}
        </div>

        {msg && <div className={`msg msg-${msgType}`} style={{ marginTop: 16 }}>{msg}</div>}
      </div>
    </div>
  );
}
