import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ScalingIngredients, type IngredientGroup } from "@/components/scaling-ingredients";
import { RecipeJsonLd } from "@/components/recipe-jsonld";
import { RecipeCard } from "@/components/recipe-card";
import { CategoryPill, colorForCategory } from "@/components/category-pill";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const recipe = await db.recipe.findUnique({ where: { slug: decoded } });
  if (!recipe) return {};
  return {
    title: recipe.seoTitle,
    description: recipe.seoDescription,
    openGraph: {
      title: recipe.seoTitle,
      description: recipe.seoDescription,
      images: [recipe.heroImage],
    },
  };
}

type Step = { order: number; text: string; image?: string };

export default async function RecipePage({ params }: { params: Params }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const recipe = await db.recipe.findUnique({
    where: { slug: decoded, status: "PUBLISHED" },
    include: { categories: { include: { category: true } } },
  });
  if (!recipe) notFound();

  const related = await db.recipe.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: recipe.id },
      categories: {
        some: { categoryId: { in: recipe.categories.map((c) => c.categoryId) } },
      },
    },
    take: 4,
  });

  const ingredients = recipe.ingredients as unknown as IngredientGroup[];
  const steps = recipe.steps as unknown as Step[];
  type Variation = { title: string; description: string };
  const variations = (recipe.variations as unknown as Variation[] | null) ?? [];

  const primaryCategory = recipe.categories[0]?.category;

  return (
    <main>
      <RecipeJsonLd recipe={recipe} />

      {/* HERO · full-bleed photo with overlaid title */}
      <section className="relative">
        <div className="relative h-[70vh] min-h-[480px] md:h-[80vh] md:min-h-[600px] overflow-hidden img-vignette">
          <Image
            src={recipe.heroImage}
            alt={recipe.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 z-10 flex items-end">
            <div className="container mx-auto px-6 pb-10 md:pb-16">
              <div className="max-w-4xl fade-up">
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  {recipe.categories.slice(0, 3).map((cc) => (
                    <CategoryPill
                      key={cc.categoryId}
                      href={`/categories/${encodeURIComponent(cc.category.slug)}`}
                      label={cc.category.name}
                      color={colorForCategory(cc.category.slug)}
                      size="chip"
                    />
                  ))}
                </div>
                <h1 className="font-body font-black text-cream-warm text-4xl md:text-7xl leading-[0.95] tracking-tight">
                  {recipe.title}
                </h1>
                {recipe.subtitle && (
                  <p className="voice-sapir text-xl md:text-2xl mt-5 max-w-2xl text-cream-warm" style={{ color: "var(--color-cream-warm)", opacity: 0.92 }}>
                    {recipe.subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick info bar · colored chips */}
        <div className="bg-cream-warm border-b border-ink/10">
          <div className="container mx-auto px-6 py-5 flex flex-wrap items-center gap-2">
            <span className="chip chip-tomato">⏱ {recipe.totalTimeMin} דק׳ סך הכל</span>
            <span className="chip chip-marigold">{recipe.servings} מנות</span>
            <span className="chip chip-olive">רמה: {diffLabel(recipe.difficulty)}</span>
            <span className="chip chip-pistachio">{kosherLabel(recipe.kosher)}</span>
            <span className="chip chip-cream">הכנה {recipe.prepTimeMin} דק׳</span>
            <span className="chip chip-cream">בישול {recipe.cookTimeMin} דק׳</span>
          </div>
        </div>
      </section>

      {/* SAPIR INTRO · short personal note */}
      {recipe.sapirIntro && (
        <section className="bg-cream">
          <div className="container mx-auto px-6 py-12 md:py-16 max-w-4xl">
            <p className="voice-sapir text-2xl md:text-3xl leading-snug text-center">
              &ldquo;{recipe.sapirIntro}&rdquo;
            </p>
            <div className="text-center mt-4">
              <span className="text-ink-muted text-xs tracking-[0.22em] uppercase">ספיר</span>
            </div>
          </div>
        </section>
      )}

      {/* INGREDIENTS + STEPS · two columns, sticky sidebar */}
      <section className="bg-cream-warm border-y border-ink/10">
        <div className="container mx-auto px-6 py-14 md:py-20">
          <div className="grid grid-cols-12 gap-8 lg:gap-12">
            {/* Steps · main column */}
            <div className="col-span-12 lg:col-span-8 order-2 lg:order-1">
              <div className="flex items-center gap-3 mb-8">
                <h2 className="h-section text-ink">הכנה</h2>
                <span className="chip chip-cream">{steps.length} שלבים</span>
              </div>
              <ol className="space-y-10 md:space-y-14">
                {steps.map((s) => (
                  <li key={s.order} className="flex gap-5 md:gap-6 items-start">
                    <span className="step-num">{s.order}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-lg md:text-xl leading-relaxed text-ink">
                        {s.text}
                      </p>
                      {s.image && (
                        <figure className="mt-5">
                          <div className="aspect-[16/10] relative overflow-hidden bg-cream-dark rounded-xl">
                            <Image
                              src={s.image}
                              alt={`שלב ${s.order}`}
                              fill
                              sizes="(max-width: 1024px) 100vw, 800px"
                              className="object-cover"
                            />
                          </div>
                        </figure>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Sticky ingredients sidebar */}
            <aside className="col-span-12 lg:col-span-4 order-1 lg:order-2">
              <div className="sidebar-sticky bg-paper rounded-2xl border border-ink/10 p-6 md:p-7 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <h2 className="font-body font-black text-2xl text-ink leading-none">מצרכים</h2>
                  <span className="chip chip-tomato">{recipe.servings} מנות</span>
                </div>
                <ScalingIngredients groups={ingredients} defaultServings={recipe.servings} />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* TIPS · colored chip cards */}
      {recipe.sapirTips.length > 0 && (
        <section className="bg-section-marigold">
          <div className="container mx-auto px-6 py-14 md:py-20">
            <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
              <div>
                <span className="eyebrow">הטיפים שלי</span>
                <h2 className="h-section text-ink mt-1">מה שלמדתי בדרך הקשה</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recipe.sapirTips.map((tip, i) => (
                <div
                  key={i}
                  className="bg-cream-warm rounded-2xl p-6 border border-ink/10"
                >
                  <div className="font-body font-black text-2xl text-burgundy mb-3 leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className="text-ink/85 leading-relaxed text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* VARIATIONS · horizontal scroll */}
      {variations.length > 0 && (
        <section className="bg-cream">
          <div className="container mx-auto px-6 py-14 md:py-20">
            <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
              <div>
                <span className="eyebrow eyebrow-burgundy">וריאציות</span>
                <h2 className="h-section mt-1">לשחק עם המתכון</h2>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
              {variations.map((v, i) => (
                <div
                  key={i}
                  className="snap-start shrink-0 w-[85%] sm:w-[55%] md:w-[40%] lg:w-[28%] bg-cream-warm rounded-2xl p-6 border border-ink/10"
                >
                  <span className="chip chip-saffron mb-3">וריאציה {String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-body font-bold text-xl mb-2 leading-tight mt-3">{v.title}</h3>
                  <p className="text-ink/80 leading-relaxed text-sm">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RELATED · pinterest grid */}
      {related.length > 0 && (
        <section className="bg-cream-warm border-t border-ink/10">
          <div className="container mx-auto px-6 py-14 md:py-20">
            <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
              <div>
                <span className="eyebrow eyebrow-burgundy">עוד מהמטבח</span>
                <h2 className="h-section mt-1">מתכונים שיתחברו לזה</h2>
              </div>
              <Link href="/search" className="pill">
                כל המתכונים <span aria-hidden>←</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
              {related.map((r) => (
                <RecipeCard key={r.id} recipe={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CLOSING CTA */}
      <section className="bg-section-tomato">
        <div className="container mx-auto px-6 py-16 md:py-24 text-center">
          <p className="voice-sapir text-2xl md:text-4xl text-cream-warm leading-tight max-w-3xl mx-auto" style={{ color: "var(--color-cream-warm)" }}>
            עכשיו לכי לבשל. אני כאן אם תזדקקי לי.
          </p>
          <div className="mt-7 flex items-center justify-center gap-3 flex-wrap">
            <Link href="/search" className="btn-primary bg-cream-warm text-ink border-cream-warm hover:bg-cream">
              עוד מתכונים <span aria-hidden>←</span>
            </Link>
            {primaryCategory && (
              <Link
                href={`/categories/${encodeURIComponent(primaryCategory.slug)}`}
                className="btn-ghost text-cream-warm border-cream-warm hover:bg-cream-warm hover:text-ink"
              >
                עוד מ{primaryCategory.name}
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function diffLabel(d: string) {
  return ({ EASY: "קל", MEDIUM: "בינוני", HARD: "מתקדם" } as Record<string, string>)[d] ?? d;
}
function kosherLabel(k: string) {
  return ({ DAIRY: "חלבי", MEAT: "בשרי", PAREVE: "פרווה", NOT_KOSHER: "לא כשר" } as Record<string, string>)[k] ?? k;
}
