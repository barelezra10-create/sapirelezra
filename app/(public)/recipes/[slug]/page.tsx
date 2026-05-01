import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ScalingIngredients, type IngredientGroup } from "@/components/scaling-ingredients";
import { RecipeJsonLd } from "@/components/recipe-jsonld";
import { RecipeCard } from "@/components/recipe-card";

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

  // Pick a primary category to show in the eyebrow + a recipe number based on createdAt order.
  const primaryCategory = recipe.categories[0]?.category;
  const recipeIndex = await db.recipe.count({
    where: {
      status: "PUBLISHED",
      createdAt: { lte: recipe.createdAt },
    },
  });
  const recipeNumber = String(Math.max(1, recipeIndex)).padStart(2, "0");

  return (
    <main>
      <RecipeJsonLd recipe={recipe} />

      {/* TITLE BLOCK — magazine cover style, title BEFORE image */}
      <section className="border-b border-ink/10">
        <div className="container mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-16">
          <div className="flex items-center gap-3 mb-10 fade-up">
            <span className="eyebrow eyebrow-burgundy">
              מתכון מס׳ {recipeNumber}
              {primaryCategory ? ` · ${primaryCategory.name}` : ""}
            </span>
            <span className="flex-1 h-px bg-ink/15 draw-line" />
          </div>
          <div className="grid grid-cols-12 gap-8 md:gap-12 items-end">
            <div className="col-span-12 lg:col-span-8 fade-up" style={{ animationDelay: "120ms" }}>
              <h1 className="section-title text-ink">
                {recipe.title}
              </h1>
              {recipe.subtitle && (
                <p className="prose-sapir text-2xl md:text-3xl leading-snug mt-8 max-w-2xl">
                  {recipe.subtitle}
                </p>
              )}
            </div>
            <div className="col-span-12 lg:col-span-4 fade-up" style={{ animationDelay: "260ms" }}>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-6 border-t border-ink/15 pt-6">
                <Stat label="הכנה" value={`${recipe.prepTimeMin} דק׳`} />
                <Stat label="בישול" value={`${recipe.cookTimeMin} דק׳`} />
                <Stat label="סה״כ" value={`${recipe.totalTimeMin} דק׳`} />
                <Stat label="מנות" value={recipe.servings.toString()} />
                <Stat label="רמה" value={diffLabel(recipe.difficulty)} />
                <Stat label="כשרות" value={kosherLabel(recipe.kosher)} />
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* HERO IMAGE — appears below title, dramatic full-width photograph */}
      <section className="bg-cream">
        <div className="container mx-auto px-6 py-12 md:py-16">
          <figure className="fade-up" style={{ animationDelay: "200ms" }}>
            <div className="aspect-[16/9] relative overflow-hidden bg-cream-dark img-vignette">
              <Image
                src={recipe.heroImage}
                alt={recipe.title}
                fill
                sizes="(max-width: 1024px) 100vw, 1280px"
                className="object-cover"
                priority
              />
            </div>
            {primaryCategory && (
              <figcaption className="mt-4 text-xs tracking-[0.22em] uppercase text-ink-muted text-center">
                צילום מתוך {primaryCategory.name}
              </figcaption>
            )}
          </figure>
        </div>
      </section>

      {/* PULL-QUOTE: SAPIR'S WORDS */}
      {recipe.sapirIntro && (
        <section className="border-b border-ink/10">
          <div className="container mx-auto px-6 py-24 md:py-32 max-w-4xl text-center">
            <div className="ornament mb-10" />
            <p className="eyebrow eyebrow-burgundy mb-8">מילה מספיר</p>
            <blockquote className="prose-sapir text-3xl md:text-5xl leading-snug">
              &ldquo;{recipe.sapirIntro}&rdquo;
            </blockquote>
            <cite className="block text-ink-muted text-xs tracking-[0.25em] uppercase mt-10 not-italic">
              ספיר אלעזרא
            </cite>
            <div className="ornament mt-10" />
          </div>
        </section>
      )}

      {/* CHAPTER 01 — INGREDIENTS */}
      <section className="border-b border-ink/10 bg-cream">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="grid grid-cols-12 gap-8 md:gap-16">
            <div className="col-span-12 md:col-span-5">
              <div className="section-num mb-3">פרק 01 · המצרכים</div>
              <h2 className="section-title">מה צריך</h2>
              <p className="text-ink/75 leading-relaxed mt-6 max-w-md">
                כל המצרכים מוכנים לפניך. שני את מספר המנות והכמויות יסתדרו לבד.
              </p>
            </div>
            <div className="col-span-12 md:col-span-7">
              <div className="border-t border-ink/15 pt-8">
                <ScalingIngredients groups={ingredients} defaultServings={recipe.servings} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHAPTER 02 — STEPS */}
      <section className="border-b border-ink/10">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="grid grid-cols-12 gap-8 md:gap-16 mb-16">
            <div className="col-span-12 md:col-span-5">
              <div className="section-num mb-3">פרק 02 · הכנה</div>
              <h2 className="section-title">צעד אחרי צעד</h2>
            </div>
            <div className="col-span-12 md:col-span-7">
              <p className="text-ink/75 leading-relaxed text-lg max-w-xl">
                {steps.length} שלבים. קראי את כולם פעם אחת לפני שמתחילים.
              </p>
            </div>
          </div>

          <ol className="max-w-4xl mx-auto space-y-16 md:space-y-24">
            {steps.map((s) => (
              <li key={s.order} className="grid grid-cols-12 gap-6 md:gap-10 items-start">
                <div className="col-span-12 md:col-span-2">
                  <span className="drop-num block text-left md:text-right">
                    {String(s.order).padStart(2, "0")}
                  </span>
                </div>
                <div className="col-span-12 md:col-span-10">
                  <p className="font-display text-xl md:text-2xl leading-relaxed text-ink">
                    {s.text}
                  </p>
                  {s.image && (
                    <figure className="mt-6">
                      <div className="aspect-[16/10] relative overflow-hidden bg-cream-dark">
                        <Image
                          src={s.image}
                          alt={`שלב ${s.order}`}
                          fill
                          sizes="(max-width: 1024px) 100vw, 800px"
                          className="object-cover"
                        />
                      </div>
                      <figcaption className="mt-2 text-xs tracking-[0.22em] uppercase text-ink-muted">
                        שלב {String(s.order).padStart(2, "0")}
                      </figcaption>
                    </figure>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CHAPTER 03 — TIPS (pillar grid) */}
      {recipe.sapirTips.length > 0 && (
        <section className="border-b border-ink/10 bg-cream">
          <div className="container mx-auto px-6 py-24 md:py-32">
            <div className="grid grid-cols-12 gap-8 md:gap-16 mb-16">
              <div className="col-span-12 md:col-span-4">
                <div className="section-num mb-3">פרק 03 · הטיפים שלי</div>
                <h2 className="section-title">מה שלמדתי בדרך הקשה</h2>
              </div>
              <div className="col-span-12 md:col-span-8 grid md:grid-cols-3 gap-10 md:gap-12">
                {recipe.sapirTips.map((tip, i) => (
                  <Pillar key={i} num={String(i + 1).padStart(2, "0")} body={tip} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CHAPTER 04 — VARIATIONS */}
      {variations.length > 0 && (
        <section className="border-b border-ink/10">
          <div className="container mx-auto px-6 py-24 md:py-32">
            <div className="flex items-baseline justify-between flex-wrap gap-6 mb-16">
              <div>
                <div className="section-num mb-3">פרק 04 · וריאציות</div>
                <h2 className="section-title">לשחק עם המתכון</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ink/10">
              {variations.map((v, i) => (
                <div key={i} className="bg-cream-warm p-10">
                  <div className="font-display italic text-2xl text-burgundy mb-4">
                    №{String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="font-display text-2xl mb-3 leading-tight">{v.title}</h3>
                  <p className="text-ink/85 leading-relaxed">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CLOSING PULL QUOTE — ink */}
      <section className="bg-ink text-cream-warm">
        <div className="container mx-auto px-6 py-24 md:py-32 text-center">
          <div className="ornament mb-10" />
          <p className="font-display italic text-3xl md:text-5xl leading-tight max-w-3xl mx-auto">
            עכשיו לכי לבשל. אני כאן אם תזדקקי לי.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-3 text-cream-warm text-sm tracking-[0.18em] uppercase border-b border-cream-warm/40 pb-1 mt-10 hover:border-cream-warm transition-colors"
          >
            עוד מהמטבח שלי
            <span className="text-lg">←</span>
          </Link>
        </div>
      </section>

      {/* RELATED — 4-up grid with index badges */}
      {related.length > 0 && (
        <section className="border-b border-ink/10">
          <div className="container mx-auto px-6 py-24 md:py-32">
            <div className="flex items-baseline justify-between flex-wrap gap-6 mb-16">
              <div>
                <div className="section-num mb-3">פרק 05</div>
                <h2 className="section-title">מתכונים נוספים שאהבתי</h2>
              </div>
              <Link
                href="/search"
                className="text-burgundy text-sm tracking-[0.18em] uppercase border-b border-burgundy pb-1 inline-flex items-center gap-2"
              >
                כל המתכונים
                <span>←</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
              {related.map((r, i) => (
                <RecipeCard key={r.id} recipe={r} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] tracking-[0.22em] uppercase text-ink-muted">{label}</dt>
      <dd className="font-display text-xl mt-1">{value}</dd>
    </div>
  );
}

function Pillar({ num, body }: { num: string; body: string }) {
  return (
    <div>
      <div className="font-display italic text-2xl text-burgundy mb-4">№{num}</div>
      <p className="text-ink/85 leading-relaxed">{body}</p>
    </div>
  );
}

function diffLabel(d: string) {
  return ({ EASY: "קל", MEDIUM: "בינוני", HARD: "מתקדם" } as Record<string, string>)[d] ?? d;
}
function kosherLabel(k: string) {
  return ({ DAIRY: "חלבי", MEAT: "בשרי", PAREVE: "פרווה", NOT_KOSHER: "לא כשר" } as Record<string, string>)[k] ?? k;
}
