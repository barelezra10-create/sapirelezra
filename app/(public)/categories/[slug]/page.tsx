import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { RecipeCard } from "@/components/recipe-card";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const cat = await db.category.findUnique({ where: { slug: decoded } });
  if (!cat) return {};
  return {
    title: `${cat.name} | ספיר אלעזרא`,
    description: `מתכונים בקטגוריה ${cat.name} מהמטבח של ספיר.`,
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const category = await db.category.findUnique({
    where: { slug: decoded },
    include: { children: { orderBy: { order: "asc" } } },
  });
  if (!category) notFound();

  const subIds = category.children.map((c) => c.id);
  const recipes = await db.recipe.findMany({
    where: {
      status: "PUBLISHED",
      categories: {
        some: { categoryId: { in: [category.id, ...subIds] } },
      },
    },
    orderBy: { publishedAt: "desc" },
    take: 60,
  });

  return (
    <main className="container mx-auto px-6 py-12">
      <h1 className="font-display text-5xl text-burgundy">{category.name}</h1>
      <p className="text-ink-muted mt-2">
        {recipes.length === 0 ? "עוד אין מתכונים פה. בקרוב." : `${recipes.length} מתכונים`}
      </p>

      {category.children.length > 0 && (
        <nav className="flex flex-wrap gap-2 mt-6">
          {category.children.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${encodeURIComponent(c.slug)}`}
              className="bg-cream-dark px-4 py-1.5 rounded-full text-sm transition hover:bg-burgundy hover:text-cream"
            >
              {c.name}
            </Link>
          ))}
        </nav>
      )}

      {recipes.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          {recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      ) : null}
    </main>
  );
}
