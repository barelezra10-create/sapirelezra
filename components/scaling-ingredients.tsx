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
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => setServings(Math.max(1, servings - 1))}
          className="bg-cream-dark w-8 h-8 rounded"
          aria-label="הפחת מנה"
        >
          −
        </button>
        <span className="font-medium">{servings} מנות</span>
        <button
          type="button"
          onClick={() => setServings(servings + 1)}
          className="bg-cream-dark w-8 h-8 rounded"
          aria-label="הוסף מנה"
        >
          +
        </button>
      </div>
      {groups.map((g, i) => (
        <div key={i} className="mb-4">
          {g.groupName && <h4 className="font-medium text-burgundy mb-2">{g.groupName}</h4>}
          <ul className="space-y-2">
            {g.items.map((item, j) => (
              <li key={j} className="text-sm">
                {item.quantity && <span className="font-medium">{scaleQuantity(item.quantity, factor)} </span>}
                {item.unit && <span>{item.unit} </span>}
                <span>{item.name}</span>
                {item.note && <span className="text-ink-muted"> ({item.note})</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
