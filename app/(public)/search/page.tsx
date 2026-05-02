import Link from "next/link";
import { searchRecipes } from "@/lib/search";
import { db } from "@/lib/db";
import { RecipeCard } from "@/components/recipe-card";
import { CategoryPill, colorForCategory } from "@/components/category-pill";

export const metadata = {
  title: "חיפוש מתכון | ספיר אלעזרא",
  description: "חפשו מתכון מתוך כל המתכונים של ספיר.",
};

const SEARCH_HINTS = ["שקשוקה", "חלה", "ילדים", "פסטה", "סבתא", "טבעוני", "ללא גלוטן", "אפייה"];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const [results, topCategories] = await Promise.all([
    q ? searchRecipes(q) : Promise.resolve([]),
    db.category.findMany({ where: { parentId: null }, orderBy: { order: "asc" } }),
  ]);

  return (
    <main>
      {/* SEARCH HERO */}
      <section className="bg-section-cream">
        <div className="container mx-auto px-6 pt-14 pb-10 md:pt-20 md:pb-14">
          <div className="max-w-3xl mx-auto text-center fade-up">
            <span className="chip chip-tomato mb-5">חיפוש</span>
            <h1 className="h-display text-ink mt-4">מה מתחשק היום?</h1>
            <p className="voice-sapir text-xl md:text-2xl mt-5">
              חפשי לפי שם, מצרך או רעיון.
            </p>
          </div>

          <form action="/search" method="GET" className="max-w-3xl mx-auto mt-10">
            <label className="sr-only" htmlFor="search-input">חיפוש</label>
            <div className="relative">
              <input
                id="search-input"
                type="search"
                name="q"
                defaultValue={q}
                placeholder="שקשוקה, חלה, מנה לילדים..."
                autoFocus
                className="search-input search-input-large pe-16"
              />
              <button
                type="submit"
                className="absolute end-2 top-1/2 -translate-y-1/2 btn-primary !py-3 !px-5"
                aria-label="חפש"
              >
                חפשי
              </button>
            </div>
          </form>

          {/* Hints */}
          <div className="max-w-3xl mx-auto mt-7 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-ink-muted me-2 font-semibold tracking-wider uppercase">נסי</span>
            {SEARCH_HINTS.map((h) => (
              <Link
                key={h}
                href={`/search?q=${encodeURIComponent(h)}`}
                className="chip chip-cream hover:chip-tomato transition-colors"
              >
                {h}
              </Link>
            ))}
          </div>

          {/* Top categories */}
          <div className="max-w-3xl mx-auto mt-10 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-ink-muted me-2 font-semibold tracking-wider uppercase">פרקים</span>
            {topCategories.map((c) => (
              <CategoryPill
                key={c.id}
                href={`/categories/${encodeURIComponent(c.slug)}`}
                label={c.name}
                color={colorForCategory(c.slug)}
                size="pill"
              />
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="bg-cream-warm">
        <div className="container mx-auto px-6 py-14 md:py-20">
          {q ? (
            results.length > 0 ? (
              <>
                <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
                  <div>
                    <span className="eyebrow eyebrow-burgundy">תוצאות עבור</span>
                    <h2 className="h-section mt-1">&ldquo;{q}&rdquo;</h2>
                  </div>
                  <span className="chip chip-tomato">{results.length} מתכונים</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
                  {results.map((r) => (
                    <RecipeCard key={r.id} recipe={r} />
                  ))}
                </div>
              </>
            ) : (
              <div className="max-w-xl mx-auto text-center py-12">
                <span className="chip chip-cream mb-6">אין תוצאות</span>
                <p className="h-bold text-2xl md:text-3xl mt-3">
                  לא מצאתי מתכון עבור &ldquo;{q}&rdquo;.
                </p>
                <p className="text-ink-muted mt-4 leading-relaxed">
                  נסי משהו אחר או דפדפי בקטגוריות. אני כל הזמן מוסיפה.
                </p>
                <Link href="/" className="btn-primary mt-8">חזרי לעמוד הבית</Link>
              </div>
            )
          ) : (
            <div className="max-w-xl mx-auto text-center py-10">
              <p className="voice-sapir text-2xl md:text-3xl">
                הקלידי משהו למעלה ואני אמצא לך.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
