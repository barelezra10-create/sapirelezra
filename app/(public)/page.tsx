import Link from "next/link";
import { db } from "@/lib/db";
import { RecipeCard } from "@/components/recipe-card";
import { CategoryGrid } from "@/components/category-grid";

export default async function Home() {
  const [featured, topCategories] = await Promise.all([
    db.recipe.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 8,
    }),
    db.category.findMany({
      where: { parentId: null },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <main>
      <section className="container mx-auto px-6 pt-16 pb-24 text-center">
        <h1 className="font-display text-6xl md:text-8xl text-burgundy leading-tight">
          המטבח שלי,<br />פתוח בשבילך.
        </h1>
        <p className="prose-sapir text-2xl mt-6 max-w-2xl mx-auto">
          שפית מקצועית. ממטבחי הסבתות שלי ועד צרפת ויפן. כל מה שלמדתי, אצלך.
        </p>
        <Link href="/about" className="inline-block mt-8 text-burgundy underline hover:no-underline">
          הסיפור שלי
        </Link>
      </section>

      {featured.length > 0 && (
        <section className="container mx-auto px-6 mb-24">
          <h2 className="font-display text-4xl mb-8">הכי טריים אצלי</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map((r) => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        </section>
      )}

      <section className="container mx-auto px-6 mb-24">
        <h2 className="font-display text-4xl mb-8">לאיזה מטבח בא לך?</h2>
        <CategoryGrid categories={topCategories} />
      </section>
    </main>
  );
}
