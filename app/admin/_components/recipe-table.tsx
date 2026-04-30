import Link from "next/link";

type RecipeRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  updatedAt: Date;
  categories: { category: { name: string } }[];
};

export function RecipeTable({ recipes }: { recipes: RecipeRow[] }) {
  if (recipes.length === 0) {
    return <p className="text-ink-muted">אין מתכונים עדיין.</p>;
  }
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-cream-dark">
          <th className="text-right py-2 font-medium">כותרת</th>
          <th className="text-right py-2 font-medium">קטגוריות</th>
          <th className="text-right py-2 font-medium">סטטוס</th>
          <th className="text-right py-2 font-medium">עודכן</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {recipes.map((r) => (
          <tr key={r.id} className="border-b border-cream-dark">
            <td className="py-3">{r.title}</td>
            <td className="py-3 text-ink-muted">
              {r.categories.map((c) => c.category.name).join(", ")}
            </td>
            <td className="py-3">{statusLabel(r.status)}</td>
            <td className="py-3 text-ink-muted">{r.updatedAt.toLocaleDateString("he-IL")}</td>
            <td className="py-3">
              <Link href={`/admin/recipes/${r.id}`} className="text-burgundy">ערוך</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function statusLabel(s: string) {
  return { DRAFT: "טיוטה", PUBLISHED: "פורסם", ARCHIVED: "ארכיון" }[s] ?? s;
}
