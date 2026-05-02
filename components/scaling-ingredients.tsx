"use client";

import { useState } from "react";

export type IngredientItem = { name: string; quantity?: string; unit?: string; note?: string };
export type IngredientGroup = { groupName?: string; items: IngredientItem[] };

export function scaleQuantity(q: string | undefined, factor: number): string | undefined {
  if (!q) return q;
  const n = parseFloat(q.replace(",", "."));
  if (isNaN(n)) return q;
  const scaled = n * factor;
  if (scaled % 1 === 0) return scaled.toString();
  return scaled.toFixed(2).replace(/\.?0+$/, "");
}

export function ScalingIngredients({
  groups,
  defaultServings,
}: {
  groups: IngredientGroup[];
  defaultServings: number;
}) {
  const [servings, setServings] = useState(defaultServings);
  const factor = servings / defaultServings;
  return (
    <div>
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-ink/10">
        <button
          type="button"
          onClick={() => setServings(Math.max(1, servings - 1))}
          className="w-8 h-8 rounded-full bg-ink/5 hover:bg-burgundy hover:text-cream-warm transition-colors text-lg font-bold leading-none flex items-center justify-center"
          aria-label="הפחת מנה"
        >
          −
        </button>
        <span className="font-body font-bold text-base">{servings} מנות</span>
        <button
          type="button"
          onClick={() => setServings(servings + 1)}
          className="w-8 h-8 rounded-full bg-ink/5 hover:bg-burgundy hover:text-cream-warm transition-colors text-lg font-bold leading-none flex items-center justify-center"
          aria-label="הוסף מנה"
        >
          +
        </button>
      </div>
      {groups.map((g, i) => (
        <div key={i} className="mb-5 last:mb-0">
          {g.groupName && (
            <h4 className="font-body font-bold text-burgundy text-sm mb-2 tracking-wide uppercase">
              {g.groupName}
            </h4>
          )}
          <ul className="space-y-2">
            {g.items.map((item, j) => (
              <li key={j} className="text-sm text-ink leading-relaxed flex items-baseline gap-2">
                <span className="text-burgundy mt-1.5 w-1 h-1 rounded-full bg-burgundy shrink-0" />
                <span>
                  {item.quantity && (
                    <span className="font-bold">{scaleQuantity(item.quantity, factor)} </span>
                  )}
                  {item.unit && <span className="font-medium">{item.unit} </span>}
                  <span>{item.name}</span>
                  {item.note && <span className="text-ink-muted"> ({item.note})</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
