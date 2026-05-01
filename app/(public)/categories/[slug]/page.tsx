import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { RecipeCard } from "@/components/recipe-card";

type Params = Promise<{ slug: string }>;

const CATEGORY_INTROS: Record<string, string> = {
  "for-kids":
    "המטבח שלי לילדים מתחיל בטעמים אמיתיים. ממחיות ראשונות לתינוקות עד מנות שילדי גן יבקשו להפוך לטקס.",
  baking:
    "אפייה היא חצי כימיה חצי אהבה. לחמים, עוגות ומאפים שלמדתי בפריז ובמטבח של סבתא.",
  "grandma-cuisines":
    "המטבחים שגדלתי עליהם ושעדיין מחממים אצלי את הבית. ממסבחה במרוקאית עד קובה עיראקית.",
  "world-cuisines":
    "מה שלמדתי כשעבדתי במסעדות בחו״ל. צרפתי קלאסי, יפני אותנטי, איטלקי כפי שהם באמת מבשלים.",
  "israeli-everyday":
    "המטבח הישראלי היומיומי. מה שאני מכינה לילדים לארוחת ערב ביום שלישי, ומה שעולה אצלי על שולחן שישי.",
  "by-diet":
    "מתכונים מותאמים לאורח חיים: טבעוני, ללא גלוטן, פליאו, קטו. כל אחד נטעם מצוין בלי פשרות.",
};

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

  const intro = CATEGORY_INTROS[category.slug];

  return (
    <main>
      {/* HEADER — magazine-style, eyebrow + huge title + intro */}
      <section className="border-b border-ink/10">
        <div className="container mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-20">
          <div className="flex items-center gap-3 mb-10 fade-up">
            <span className="eyebrow eyebrow-burgundy">
              קטגוריה · {recipes.length} מתכונים
            </span>
            <span className="flex-1 h-px bg-ink/15 draw-line" />
          </div>
          <div className="grid grid-cols-12 gap-8 md:gap-16 items-end">
            <div className="col-span-12 lg:col-span-7 fade-up" style={{ animationDelay: "120ms" }}>
              <h1 className="section-title text-ink">{category.name}</h1>
            </div>
            {intro && (
              <div className="col-span-12 lg:col-span-5 fade-up" style={{ animationDelay: "240ms" }}>
                <p className="prose-sapir text-2xl leading-snug">{intro}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SUB-CATEGORIES — numbered chapter list */}
      {category.children.length > 0 && (
        <section className="border-b border-ink/10 bg-cream">
          <div className="container mx-auto px-6 py-16 md:py-20">
            <div className="section-num mb-10">תתי-קטגוריות</div>
            <nav className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/10">
              {category.children.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/categories/${encodeURIComponent(c.slug)}`}
                  className="group bg-cream-warm hover:bg-cream transition-colors p-8 md:p-10 flex items-baseline gap-6"
                >
                  <span className="font-display italic text-3xl text-burgundy/50 group-hover:text-burgundy transition-colors shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-2xl md:text-3xl leading-tight group-hover:text-burgundy transition-colors">
                    {c.name}
                  </span>
                  <span className="ms-auto text-burgundy opacity-0 group-hover:opacity-100 transition-opacity text-xl">
                    ←
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </section>
      )}

      {/* RECIPES GRID */}
      <section className="border-b border-ink/10">
        <div className="container mx-auto px-6 py-24 md:py-32">
          {recipes.length > 0 ? (
            <>
              <div className="flex items-baseline justify-between flex-wrap gap-6 mb-16">
                <div>
                  <div className="section-num mb-3">פרק · המתכונים</div>
                  <h2 className="section-title">מה יש בפנים</h2>
                </div>
                <p className="text-ink-muted text-sm tracking-[0.18em] uppercase">
                  {recipes.length} מתכונים
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                {recipes.map((r, i) => (
                  <RecipeCard key={r.id} recipe={r} index={i} />
                ))}
              </div>
            </>
          ) : (
            <div className="max-w-2xl mx-auto text-center py-16">
              <div className="ornament mb-10" />
              <p className="font-display italic text-3xl md:text-4xl leading-snug text-ink">
                עוד אין כאן מתכונים, אבל הם בדרך.
              </p>
              <p className="text-ink-muted mt-6 leading-relaxed">
                אני כותבת את הקטגוריה הזו עכשיו. חזרי בקרוב או חפשי משהו אחר בינתיים.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-3 text-burgundy text-sm tracking-[0.18em] uppercase border-b border-burgundy pb-1 mt-10 hover:gap-5 transition-all"
              >
                גלי את שאר המטבח
                <span className="text-lg">←</span>
              </Link>
              <div className="ornament mt-10" />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
