import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { RecipeCard, RecipeCardLarge } from "@/components/recipe-card";

export const dynamic = "force-dynamic";

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
                  בשלנית בנשמה. אמא בפועל. תלמידה של סבתא מזל.
                </p>
                <p className="text-base md:text-lg text-ink/80 leading-relaxed">
                  למדתי לבשל אצל סבתא מזל. בלי תעודות, בלי בתי ספר. ידיים, עיניים וטעם.
                  כאן אני אורזת לך את כל מה שלמדתי ממנה, עם נטייה למצרכים טריים וגרסאות
                  קלות יותר כשאפשר. בלי להטיף, פשוט להציע.
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

            {/* Sapir illustration — establishes the persona visually */}
            <div className="col-span-12 lg:col-span-4 fade-up" style={{ animationDelay: "300ms" }}>
              <figure>
                <div className="relative">
                  <span className="absolute -top-3 right-4 z-10 bg-burgundy text-cream-warm text-[10px] tracking-[0.25em] uppercase px-3 py-1.5">
                    הכירי את ספיר
                  </span>
                  <div className="aspect-[3/4] overflow-hidden bg-cream-dark">
                    <Image
                      src="/sapir/sapir-hero-portrait.png"
                      alt="ספיר אלעזרא במטבח שלה"
                      width={800}
                      height={1066}
                      className="w-full h-full object-cover"
                      priority
                    />
                  </div>
                </div>
                <figcaption className="mt-4 text-[11px] tracking-[0.2em] uppercase text-ink-muted text-center">
                  ספיר במטבח הביתי שלה
                </figcaption>
              </figure>
            </div>
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

      {/* PULL QUOTE — Sapir at her desk */}
      <section className="bg-ink text-cream-warm">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="grid md:grid-cols-12 gap-12 items-center max-w-6xl mx-auto">
            <div className="md:col-span-5">
              <div className="aspect-square overflow-hidden bg-ink/60 max-w-md mx-auto">
                <Image
                  src="/sapir/sapir-thinking.png"
                  alt="ספיר רושמת מתכון"
                  width={800}
                  height={800}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="md:col-span-7 text-center md:text-right">
              <div className="ornament mb-8 md:justify-start" />
              <p className="font-display italic text-3xl md:text-5xl leading-[1.15]">
                &ldquo;סבתא מזל לימדה אותי שאוכל זה לא טכניקה.
                <br />
                אוכל זה יחס.&rdquo;
              </p>
              <cite className="block text-cream-warm/60 text-xs tracking-[0.25em] uppercase mt-8 not-italic">
                ספיר אלעזרא
              </cite>
              <Link
                href="/about"
                className="inline-flex items-center gap-3 text-cream-warm text-sm tracking-[0.18em] uppercase border-b border-cream-warm/40 pb-1 mt-8 hover:border-cream-warm transition-colors"
              >
                קראי את הסיפור המלא
                <span className="text-lg">←</span>
              </Link>
            </div>
          </div>
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
              שש קטגוריות, מאות מתכונים. מאוכל ראשון לתינוק ועד פסטה איטלקית. הכל עם דגש
              על מצרכים טריים ואופציות קלילות יותר כשאפשר.
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

      {/* CHAPTER 03 — RECENT RECIPES (12-up grid) */}
      {recentSlice.length > 0 && (
        <section className="border-b border-ink/10 bg-cream">
          <div className="container mx-auto px-6 py-24 md:py-32">
            <div className="flex items-baseline justify-between flex-wrap gap-6 mb-16">
              <div>
                <div className="section-num mb-3">פרק 03</div>
                <h2 className="section-title">הכי טריים אצלי</h2>
                <p className="text-ink-muted mt-4 max-w-md">
                  {totalCount} מתכונים בארכיון, וזה רק ההתחלה.
                </p>
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
              {recentSlice.map((r, i) => (
                <RecipeCard key={r.id} recipe={r} index={i + 2} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CHAPTER 04 — BY CHAPTER (3-4 recipes per category, alternating bg) */}
      <section className="border-b border-ink/10">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="flex items-baseline justify-between flex-wrap gap-6 mb-16">
            <div>
              <div className="section-num mb-3">פרק 04</div>
              <h2 className="section-title">לפי הפרק</h2>
              <p className="text-ink-muted mt-4 max-w-md">
                דוגמאות מכל פרק. תרצי עוד? לחצי על שם הפרק.
              </p>
            </div>
          </div>
          <div className="space-y-20 md:space-y-28">
            {categoriesWithCounts.map((cat, cIdx) => (
              cat.samples.length > 0 && (
                <div key={cat.id} className="border-t border-ink/10 pt-10 md:pt-14">
                  <div className="flex items-baseline justify-between flex-wrap gap-4 mb-10">
                    <div className="flex items-baseline gap-5">
                      <span className="font-display italic text-4xl md:text-5xl text-burgundy">
                        {String(cIdx + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-display text-3xl md:text-4xl">
                        <Link href={`/categories/${encodeURIComponent(cat.slug)}`} className="hover:text-burgundy transition-colors">
                          {cat.name}
                        </Link>
                      </h3>
                    </div>
                    <Link
                      href={`/categories/${encodeURIComponent(cat.slug)}`}
                      className="text-burgundy text-xs tracking-[0.2em] uppercase border-b border-burgundy pb-1 inline-flex items-center gap-2"
                    >
                      {cat.totalRecipes} בפרק
                      <span>←</span>
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
                    {cat.samples.map((r, i) => (
                      <RecipeCard key={r.id} recipe={r} index={i} />
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </section>

      {/* CHAPTER 05 — KITCHEN PHILOSOPHY (always visible, on cream) */}
      <section className="border-b border-ink/10 bg-cream">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="grid grid-cols-12 gap-8 md:gap-16">
            <div className="col-span-12 md:col-span-4">
              <div className="section-num mb-3">פרק 05</div>
              <h2 className="section-title">פילוסופיית המטבח שלי</h2>
            </div>
            <div className="col-span-12 md:col-span-8 grid md:grid-cols-3 gap-10 md:gap-12">
              <Pillar
                num="01"
                title="טרי מנצח מעובד"
                body="הכי טוב מתחיל בעגבנייה בעונה, שמן זית טוב, ולחם ביתי. אני לא נלהבת מקופסאות שימורים. כשאפשר, מתחילים מאפס. זה גם בריא יותר וגם טעים יותר."
              />
              <Pillar
                num="02"
                title="גרסה קלה כשאפשר"
                body="כל מתכון אצלי מקבל וריאציה קלילה יותר. יוגורט במקום שמנת, חיטה מלאה במקום לבנה, פחות סוכר. בלי לפגוע בטעם, רק לתת אופציה."
              />
              <Pillar
                num="03"
                title="טכניקה שעובדת"
                body="לקרמל את הבצל לוקח עשר דקות, לא שלוש. הסבלנות הזו היא ההבדל בין מתכון ביתי למתכון של מסעדה. ככה למדתי מסבתא מזל."
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
