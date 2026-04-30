import Link from "next/link";
import { db } from "@/lib/db";
import { RecipeTable } from "./_components/recipe-table";

export const dynamic = "force-dynamic";

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q, status } = await searchParams;
  const recipes = await db.recipe.findMany({
    where: {
      ...(q && { title: { contains: q, mode: "insensitive" } }),
      ...(status && { status: status as any }),
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: { categories: { include: { category: true } } },
  });
  const counts = await db.recipe.groupBy({
    by: ["status"],
    _count: true,
  });
  return (
    <main className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-4xl text-burgundy">מתכונים</h1>
        <div className="flex gap-3">
          <Link href="/admin/recipes/new" className="bg-burgundy text-cream px-4 py-2 rounded">
            מתכון חדש
          </Link>
          <form action="/admin/logout" method="POST">
            <button className="text-ink-muted">יציאה</button>
          </form>
        </div>
      </div>
      <div className="flex gap-4 mb-4 text-sm text-ink-muted">
        {counts.map((c) => (
          <span key={c.status}>
            {statusLabel(c.status)}: {c._count}
          </span>
        ))}
      </div>
      <form className="mb-6 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="חיפוש כותרת"
          className="border border-cream-dark rounded px-3 py-2 flex-1 bg-white"
        />
        <select name="status" defaultValue={status} className="border border-cream-dark rounded px-3 py-2 bg-white">
          <option value="">כל הסטטוסים</option>
          <option value="DRAFT">טיוטה</option>
          <option value="PUBLISHED">פורסם</option>
          <option value="ARCHIVED">ארכיון</option>
        </select>
        <button className="bg-cream-dark px-4 rounded">חפש</button>
      </form>
      <RecipeTable recipes={recipes} />
    </main>
  );
}

function statusLabel(s: string) {
  return { DRAFT: "טיוטה", PUBLISHED: "פורסם", ARCHIVED: "ארכיון" }[s] ?? s;
}
