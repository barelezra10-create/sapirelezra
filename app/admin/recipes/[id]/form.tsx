"use client";

import { useState, useTransition } from "react";

export function RecipeForm({
  recipeId,
  initialJson,
  action,
}: {
  recipeId: string;
  initialJson: string;
  action: (id: string, jsonStr: string) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [json, setJson] = useState(initialJson);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadStatus("מעלה...");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "upload failed");
      await navigator.clipboard.writeText(body.url);
      setUploadStatus(`הועתק ללוח: ${body.url}`);
    } catch (err: any) {
      setUploadStatus(`שגיאה: ${err.message}`);
    } finally {
      e.target.value = "";
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          try {
            await action(recipeId, json);
          } catch (err: any) {
            setError(err.message ?? "שמירה נכשלה");
          }
        });
      }}
      className="space-y-4"
    >
      <p className="text-sm text-ink-muted">
        עריכת JSON ישירה (גרסת MVP). שדות מובנים יבואו אחרי בדיקת זרימה.
      </p>

      <label className="block bg-white border border-cream-dark rounded p-4">
        <span className="text-sm font-medium block mb-2">העלאת תמונה</span>
        <span className="text-xs text-ink-muted block mb-2">
          ה-URL ייקופי אוטומטית ללוח הקופי-פייסט. הדבק במקום הרצוי בתוך ה-JSON.
        </span>
        <input type="file" accept="image/*" onChange={handleUpload} className="block" />
        {uploadStatus && <p className="text-xs mt-2 text-ink-muted break-all">{uploadStatus}</p>}
      </label>

      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        className="w-full font-mono text-xs h-[600px] border border-cream-dark rounded p-3 bg-white"
        spellCheck={false}
      />
      {error && <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>}
      <button
        disabled={isPending}
        className="bg-burgundy text-cream px-6 py-2 rounded disabled:opacity-50"
      >
        {isPending ? "שומר..." : "שמירה"}
      </button>
    </form>
  );
}
