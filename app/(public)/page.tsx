import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { RecipeCard, RecipeCardLarge } from "@/components/recipe-card";
import { CategoryPill, colorForCategory } from "@/components/category-pill";

export const dynamic = "force-dynamic";

const CATEGORY_TONE: Record<string, string> = {
  "for-kids": "bg-section-marigold",
  baking: "bg-section-saffron",
  "grandma-cuisines": "bg-section-tomato",
  "world-cuisines": "bg-section-olive",
  "israeli-everyday": "bg-section-marigold",
  "by-diet": "bg-section-pistachio",
};

export default async function Home() {
  const [allPublished, topCategoriesRaw, totalCount] = await Promise.all([
    db.recipe.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 24,
    }),
    db.category.findMany({
      where: { parentId: null },
      orderBy: { order: "asc" },
      include: { _count: { select: { recipes: true, children: true } } },
    }),
    db.recipe.count({ where: { status: "PUBLISHED" } }),
  ]);

  const weekFeature = allPublished[0];
  const recentSlice = allPublished.slice(1, 13);

  // Compute total recipe count + 4 sample recipes per top category
  const categoriesWithCounts = await Promise.all(
    topCategoriesRaw.map(async (c) => {
      const childIds = await db.category.findMany({
        where: { parentId: c.id },
        select: { id: true },
      });
      const allIds = [c.id, ...childIds.map((x) => x.id)];
      const [total, samples] = await Promise.all([
        db.recipe.count({
          where: {
            status: "PUBLISHED",
            categories: { some: { categoryId: { in: allIds } } },
          },
        }),
        db.recipe.findMany({
          where: {
            status: "PUBLISHED",
            categories: { some: { categoryId: { in: allIds } } },
          },
          orderBy: { publishedAt: "desc" },
          take: 4,
        }),
      ]);
      return { ...c, totalRecipes: total, samples };
    })
  );

  return (
    <main>
      {/* HERO · bold modern, image + headline */}
      <section className="relative">
        <div className="container mx-auto px-6 pt-8 md:pt-14 pb-12 md:pb-20">
          <div className="grid grid-cols-12 gap-6 md:gap-10 items-stretch">
            {/* Headline column */}
            <div className="col-span-12 lg:col-span-6 flex flex-col justify-center order-2 lg:order-1 fade-up min-w-0">
              <div className="flex items-center gap-2 mb-5">
                <span className="chip chip-tomato">חדש כל שבוע</span>
                <span className="chip chip-cream">{totalCount}+ מתכונים</span>
              </div>
              <h1 className="h-display text-ink">
                המטבח שלי,
                <br />
                <span className="voice-sapir not-italic" style={{ fontStyle: "italic" }}>פתוח בשבילך.</span>
              </h1>
              <p className="voice-sapir text-xl md:text-2xl leading-snug mt-7 max-w-lg">
                בשלנית בנשמה. אמא בפועל. תלמידה של סבתא מזל.
              </p>
              <p className="text-base md:text-lg text-ink/80 leading-relaxed mt-4 max-w-lg">
                כאן את מוצאת מתכונים שעובדים בבית. עם נטייה לטרי, גרסאות קלילות יותר כשאפשר,
                ובלי להסתבך.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-8">
                <Link href="/search" className="btn-primary">
                  גלי מתכון
                  <span aria-hidden>←</span>
                </Link>
                <Link href="/about" className="btn-ghost">
                  הסיפור של ספיר
                </Link>
              </div>
            </div>

            {/* Feature recipe card */}
            <div className="col-span-12 lg:col-span-6 order-1 lg:order-2 fade-up min-w-0" style={{ animationDelay: "120ms" }}>
              {weekFeature ? (
                <RecipeCardLarge recipe={weekFeature} />
              ) : (
                <div className="aspect-[16/10] rounded-2xl bg-cream-dark" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CHAPTERS · colored chip cards */}
      <section className="bg-cream-warm">
        <div className="container mx-auto px-6 pb-12 md:pb-16">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
            <div>
              <span className="eyebrow eyebrow-burgundy mb-2">פרקים</span>
              <h2 className="h-section text-ink mt-1">מה בא לך לבשל היום?</h2>
            </div>
            <p className="text-ink-muted max-w-md text-sm">
              שש קטגוריות, מאות מתכונים. דפדפי או חפשי משהו ספציפי.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoriesWithCounts.map((c) => {
              const color = colorForCategory(c.slug);
              const tone = CATEGORY_TONE[c.slug] ?? "bg-section-ink";
              return (
                <Link
                  key={c.id}
                  href={`/categories/${encodeURIComponent(c.slug)}`}
                  className={`group block rounded-2xl p-7 md:p-8 ${tone} transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-body font-black text-2xl md:text-3xl leading-tight tracking-tight">
                      {c.name}
                    </h3>
                    <span className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity">
                      ←
                    </span>
                  </div>
                  <div className="mt-6 flex items-center justify-between text-sm font-semibold opacity-90">
                    <span>{c.totalRecipes} מתכונים</span>
                    <span className="text-xs uppercase tracking-widest opacity-70">
                      {color}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* SAPIR INTRO · secondary, smaller */}
      <section className="bg-section-ink">
        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-12 gap-10 items-center max-w-6xl mx-auto">
            <div className="md:col-span-4">
              <div className="aspect-square overflow-hidden rounded-2xl bg-ink/60 max-w-xs mx-auto">
                <Image
                  src="/sapir/sapir-thinking.png"
                  alt="ספיר רושמת מתכון"
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="md:col-span-8 text-center md:text-right">
              <span className="chip chip-cream mb-5">מילה אישית</span>
              <p className="voice-sapir text-2xl md:text-4xl leading-tight text-cream-warm" style={{ color: "var(--color-cream-warm)" }}>
                &ldquo;סבתא מזל לימדה אותי שאוכל זה לא טכניקה. אוכל זה יחס.&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-6 justify-center md:justify-start">
                <span className="text-cream-warm/60 text-xs tracking-[0.22em] uppercase">ספיר אלעזרא</span>
                <Link href="/about" className="pill pill-tomato">
                  קראי את הסיפור
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECENT · dense pinterest grid */}
      {recentSlice.length > 0 && (
        <section className="bg-cream-warm">
          <div className="container mx-auto px-6 py-16 md:py-24">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
              <div>
                <span className="eyebrow eyebrow-burgundy">מהמטבח</span>
                <h2 className="h-section mt-1">הכי טריים אצלי</h2>
              </div>
              <Link href="/search" className="pill">
                כל המתכונים <span aria-hidden>←</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
              {recentSlice.map((r) => (
                <RecipeCard key={r.id} recipe={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BY CHAPTER · bigger images, less text */}
      <section className="bg-cream">
        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
            <div>
              <span className="eyebrow eyebrow-burgundy">לפי פרק</span>
              <h2 className="h-section mt-1">דוגמאות מכל פינה</h2>
            </div>
          </div>
          <div className="space-y-14 md:space-y-20">
            {categoriesWithCounts.map((cat) => (
              cat.samples.length > 0 && (
                <div key={cat.id}>
                  <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
                    <div className="flex items-center gap-3">
                      <CategoryPill
                        href={`/categories/${encodeURIComponent(cat.slug)}`}
                        label={cat.name}
                        color={colorForCategory(cat.slug)}
                        size="pill"
                      />
                      <span className="text-ink-muted text-sm">
                        {cat.totalRecipes} מתכונים
                      </span>
                    </div>
                    <Link
                      href={`/categories/${encodeURIComponent(cat.slug)}`}
                      className="text-burgundy text-sm font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      לכל הפרק <span aria-hidden>←</span>
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
                    {cat.samples.map((r) => (
                      <RecipeCard key={r.id} recipe={r} />
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </section>

      {/* CTA · bold colored block */}
      <section className="bg-section-tomato">
        <div className="container mx-auto px-6 py-20 md:py-28 text-center">
          <span className="eyebrow eyebrow-cream mb-4">להצטרף למטבח</span>
          <h2 className="h-section text-cream-warm mt-3" style={{ color: "var(--color-cream-warm)" }}>
            כל יום שני, מתכון אחד טרי.
          </h2>
          <p className="text-cream-warm/85 mt-5 max-w-md mx-auto text-base">
            ניוזלטר שבועי קצר, בטעם טוב. נרשמים פעם אחת ומקבלים את המתכון הכי חדש.
          </p>
          <form className="mt-8 max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="כתובת מייל"
              aria-label="כתובת מייל"
              className="search-input bg-cream-warm/95 flex-1 min-w-0"
            />
            <button type="submit" className="btn-primary bg-ink border-ink hover:bg-ink-deep shrink-0">
              הירשמי
            </button>
          </form>
          <p className="text-cream-warm/55 text-xs mt-4">
            (טופס דמו · נחבר לרשימת תפוצה בקרוב)
          </p>
        </div>
      </section>
    </main>
  );
}
