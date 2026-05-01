import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { RecipeCard, RecipeCardLarge } from "@/components/recipe-card";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [allPublished, topCategoriesRaw] = await Promise.all([
    db.recipe.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 12,
    }),
    db.category.findMany({
      where: { parentId: null },
      orderBy: { order: "asc" },
      include: { _count: { select: { recipes: true, children: true } } },
    }),
  ]);

  const featuredHero = allPublished[0];
  const weekFeature = allPublished[1] ?? allPublished[0];
  const remainingRecent = allPublished.slice(2, 8);

  // Compute total recipe count per top category, including children's recipes
  const categoriesWithCounts = await Promise.all(
    topCategoriesRaw.map(async (c) => {
      const childIds = await db.category.findMany({
        where: { parentId: c.id },
        select: { id: true },
      });
      const total = await db.recipe.count({
        where: {
          status: "PUBLISHED",
          categories: {
            some: { categoryId: { in: [c.id, ...childIds.map((x) => x.id)] } },
          },
        },
      });
      return { ...c, totalRecipes: total };
    })
  );

  return (
    <main>
      {/* HERO — asymmetric magazine spread */}
      <section className="border-b border-ink/10">
        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center gap-3 mb-12 fade-up" style={{ animationDelay: "0ms" }}>
            <span className="eyebrow eyebrow-burgundy">פתח גיליון · אביב 2026</span>
            <span className="flex-1 h-px bg-ink/15 draw-line" />
          </div>
          <div className="grid grid-cols-12 gap-8 md:gap-12 items-end">
            <div className="col-span-12 lg:col-span-8 fade-up" style={{ animationDelay: "120ms" }}>
              <h1 className="hero-title text-ink">
                המטבח שלי,
                <br />
                <em className="text-burgundy not-italic font-display" style={{ fontStyle: "italic" }}>
                  פתוח בשבילך.
                </em>
              </h1>
              <div className="mt-12 max-w-xl space-y-6">
                <p className="prose-sapir text-2xl md:text-3xl leading-snug">
                  שפית. אמא. בלנית-עולמית.
                </p>
                <p className="text-base md:text-lg text-ink/80 leading-relaxed">
                  בוגרת לה קורדון בלו בפריז ושוליה במסעדת סושי בטוקיו. גדלתי על הריחות של סבתא ציפורה
                  ממרוקו וסבתא רבקה מטריפולי. כאן אני אורזת את הכל ביחד, בשבילך.
                </p>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-3 text-burgundy text-sm tracking-[0.18em] uppercase border-b border-burgundy pb-1 hover:gap-5 transition-all"
                >
                  קראי את הסיפור שלי
                  <span className="text-lg">←</span>
                </Link>
              </div>
            </div>

            {/* Feature card — asymmetric, hangs into next section */}
            {featuredHero && (
              <div className="col-span-12 lg:col-span-4 fade-up" style={{ animationDelay: "300ms" }}>
                <Link href={`/recipes/${encodeURIComponent(featuredHero.slug)}`} className="group block">
                  <div className="relative">
                    <span className="absolute -top-3 right-4 z-10 bg-burgundy text-cream-warm text-[10px] tracking-[0.25em] uppercase px-3 py-1.5">
                      בחירת ספיר
                    </span>
                    <div className="aspect-[3/4] overflow-hidden bg-cream-dark img-vignette">
                      <Image
                        src={featuredHero.heroImage}
                        alt={featuredHero.title}
                        width={800}
                        height={1066}
                        className="img-hover w-full h-full object-cover"
                        priority
                      />
                    </div>
                  </div>
                  <div className="mt-5 space-y-2">
                    <div className="text-[11px] tracking-[0.2em] uppercase text-ink-muted">
                      {featuredHero.totalTimeMin} דק׳ · {diffLabel(featuredHero.difficulty)}
                    </div>
                    <h2 className="card-title font-display text-3xl md:text-[2.6rem] leading-[1.05]">
                      {featuredHero.title}
                    </h2>
                    {featuredHero.subtitle && (
                      <p className="text-ink-muted text-base leading-snug">{featuredHero.subtitle}</p>
                    )}
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CHAPTER 01 — RECIPE OF THE WEEK */}
      {weekFeature && (
        <section className="border-b border-ink/10 bg-cream">
          <div className="container mx-auto px-6 py-24 md:py-32">
            <div className="grid grid-cols-12 gap-8 md:gap-16 items-center">
              <div className="col-span-12 md:col-span-7">
                <Link href={`/recipes/${encodeURIComponent(weekFeature.slug)}`} className="group block">
                  <div className="aspect-[5/4] overflow-hidden bg-cream-dark">
                    <Image
                      src={weekFeature.heroImage}
                      alt={weekFeature.title}
                      width={1400}
                      height={1120}
                      className="img-hover w-full h-full object-cover"
                    />
                  </div>
                </Link>
              </div>
              <div className="col-span-12 md:col-span-5 space-y-6">
                <div className="section-num">פרק 01 · מתכון השבוע</div>
                <h2 className="section-title text-ink">
                  <Link
                    href={`/recipes/${encodeURIComponent(weekFeature.slug)}`}
                    className="hover:text-burgundy transition-colors"
                  >
                    {weekFeature.title}
                  </Link>
                </h2>
                {weekFeature.subtitle && (
                  <p className="prose-sapir text-xl leading-snug">{weekFeature.subtitle}</p>
                )}
                <p className="text-ink/75 leading-relaxed">{weekFeature.sapirIntro}</p>
                <dl className="grid grid-cols-3 gap-6 pt-6 border-t border-ink/10 text-sm">
                  <Stat label="הכנה" value={`${weekFeature.prepTimeMin} דק׳`} />
                  <Stat label="בישול" value={`${weekFeature.cookTimeMin} דק׳`} />
                  <Stat label="רמה" value={diffLabel(weekFeature.difficulty)} />
                </dl>
                <Link
                  href={`/recipes/${encodeURIComponent(weekFeature.slug)}`}
                  className="inline-flex items-center gap-3 text-burgundy text-sm tracking-[0.18em] uppercase border-b border-burgundy pb-1 hover:gap-5 transition-all"
                >
                  קראי את המתכון
                  <span className="text-lg">←</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* PULL QUOTE */}
      <section className="bg-ink text-cream-warm">
        <div className="container mx-auto px-6 py-32 md:py-40 text-center">
          <div className="ornament mb-10" />
          <p className="font-display italic text-4xl md:text-7xl leading-tight max-w-4xl mx-auto">
            &ldquo;נולדתי במטבח. מאז לא יצאתי משם.&rdquo;
          </p>
          <cite className="block text-cream-warm/60 text-sm tracking-[0.25em] uppercase mt-10 not-italic">
            — ספיר אלעזרא
          </cite>
          <Link
            href="/about"
            className="inline-flex items-center gap-3 text-cream-warm text-sm tracking-[0.18em] uppercase border-b border-cream-warm/40 pb-1 mt-10 hover:border-cream-warm transition-colors"
          >
            קראי את הסיפור המלא
            <span className="text-lg">←</span>
          </Link>
        </div>
      </section>

      {/* CHAPTER 02 — CHAPTERS / CATEGORIES */}
      <section className="border-b border-ink/10">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="flex items-baseline justify-between flex-wrap gap-6 mb-16">
            <div>
              <div className="section-num mb-3">פרק 02</div>
              <h2 className="section-title">בחרי את הפרק שלך</h2>
            </div>
            <p className="text-ink-muted max-w-md">
              שש קטגוריות, מאות מתכונים. מאוכל ראשון לתינוק ועד פסטה איטלקית של חמישה כוכבים.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/10">
            {categoriesWithCounts.map((c, i) => (
              <Link
                key={c.id}
                href={`/categories/${encodeURIComponent(c.slug)}`}
                className="group bg-cream-warm hover:bg-cream transition-colors p-10 md:p-12 relative"
              >
                <div className="flex items-baseline justify-between">
                  <span className="drop-num opacity-30 group-hover:opacity-100 transition-opacity">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xs tracking-[0.2em] uppercase text-ink-muted">
                    {c.totalRecipes} מתכונים
                  </span>
                </div>
                <h3 className="font-display text-3xl md:text-5xl mt-8 leading-none group-hover:text-burgundy transition-colors">
                  {c.name}
                </h3>
                <span className="absolute bottom-6 left-10 md:left-12 text-burgundy opacity-0 group-hover:opacity-100 transition-opacity text-2xl">
                  ←
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CHAPTER 03 — RECENT RECIPES */}
      {remainingRecent.length > 0 && (
        <section className="border-b border-ink/10 bg-cream">
          <div className="container mx-auto px-6 py-24 md:py-32">
            <div className="flex items-baseline justify-between flex-wrap gap-6 mb-16">
              <div>
                <div className="section-num mb-3">פרק 03</div>
                <h2 className="section-title">מהמטבח השבוע</h2>
              </div>
              <Link
                href="/search"
                className="text-burgundy text-sm tracking-[0.18em] uppercase border-b border-burgundy pb-1 hover:gap-2 transition-all inline-flex items-center gap-1"
              >
                כל המתכונים
                <span>←</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {remainingRecent.map((r, i) => (
                <RecipeCard key={r.id} recipe={r} index={i + 2} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CHAPTER 04 — KITCHEN PHILOSOPHY (always visible) */}
      <section className="border-b border-ink/10">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="grid grid-cols-12 gap-8 md:gap-16">
            <div className="col-span-12 md:col-span-4">
              <div className="section-num mb-3">פרק 04</div>
              <h2 className="section-title">פילוסופיית המטבח שלי</h2>
            </div>
            <div className="col-span-12 md:col-span-8 grid md:grid-cols-3 gap-10 md:gap-12">
              <Pillar
                num="01"
                title="פשטות חכמה"
                body="הכי טוב מתחיל בשמן זית טוב, מלח, ועגבנייה בעונה. אני לא נלהבת ממוצרים יקרים. אני נלהבת ממרכיבים אמיתיים."
              />
              <Pillar
                num="02"
                title="טכניקה לא מתפשרת"
                body="לקרמל את הבצל לוקח עשר דקות, לא שלוש. הסבלנות הזו היא ההבדל בין מתכון ביתי למתכון של מסעדה."
              />
              <Pillar
                num="03"
                title="סיפור בכל צלחת"
                body="כל מנה כאן באה ממקום. מטוקיו, מקזבלנקה, ממטבח של חברה שלי. אוכל זה זיכרון, ואני אוהבת לשתף."
              />
            </div>
          </div>
        </div>
      </section>

      {/* COLOPHON-STYLE CTA */}
      <section className="bg-burgundy text-cream-warm">
        <div className="container mx-auto px-6 py-24 text-center">
          <p className="eyebrow eyebrow-cream mb-6">להצטרף למטבח</p>
          <p className="font-display text-4xl md:text-5xl max-w-2xl mx-auto leading-tight">
            כל יום שני, מתכון אחד חדש.
            <br />
            <em>ישר אצלך.</em>
          </p>
          <p className="text-cream-warm/70 mt-6 max-w-md mx-auto text-sm">
            ניוזלטר שבועי, קצר, בטעם טוב. הירשמי כאן (בקרוב).
          </p>
        </div>
      </section>
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

function Pillar({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div>
      <div className="font-display italic text-2xl text-burgundy mb-4">№{num}</div>
      <h3 className="font-display text-2xl mb-3 leading-tight">{title}</h3>
      <p className="text-ink/75 leading-relaxed text-sm">{body}</p>
    </div>
  );
}

function diffLabel(d: string) {
  return ({ EASY: "קל", MEDIUM: "בינוני", HARD: "מתקדם" } as Record<string, string>)[d] ?? d;
}
