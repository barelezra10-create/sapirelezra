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
