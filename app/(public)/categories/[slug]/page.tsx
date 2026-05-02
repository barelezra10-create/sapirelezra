import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { RecipeCard } from "@/components/recipe-card";
import { CategoryPill, colorForCategory } from "@/components/category-pill";

type Params = Promise<{ slug: string }>;
type Search = Promise<{ time?: string; difficulty?: string; kosher?: string; sort?: string }>;

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

const CATEGORY_TONE: Record<string, string> = {
  "for-kids": "bg-section-marigold",
  baking: "bg-section-saffron",
  "grandma-cuisines": "bg-section-tomato",
  "world-cuisines": "bg-section-olive",
  "israeli-everyday": "bg-section-marigold",
  "by-diet": "bg-section-pistachio",
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

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const decoded = decodeURIComponent(slug);
  const category = await db.category.findUnique({
    where: { slug: decoded },
    include: { children: { orderBy: { order: "asc" } } },
  });
  if (!category) notFound();

  const subIds = category.children.map((c) => c.id);

  // Build dynamic time filter
  const timeFilter =
    sp.time === "fast"
      ? { lte: 30 }
      : sp.time === "medium"
      ? { gt: 30, lte: 60 }
      : sp.time === "long"
      ? { gt: 60 }
      : undefined;

  const difficultyFilter =
    sp.difficulty && ["EASY", "MEDIUM", "HARD"].includes(sp.difficulty)
      ? (sp.difficulty as "EASY" | "MEDIUM" | "HARD")
      : undefined;

  const kosherFilter =
    sp.kosher && ["DAIRY", "MEAT", "PAREVE", "NOT_KOSHER"].includes(sp.kosher)
      ? (sp.kosher as "DAIRY" | "MEAT" | "PAREVE" | "NOT_KOSHER")
      : undefined;

  const orderBy =
    sp.sort === "fast"
      ? { totalTimeMin: "asc" as const }
      : sp.sort === "name"
      ? { title: "asc" as const }
      : { publishedAt: "desc" as const };

  const recipes = await db.recipe.findMany({
    where: {
      status: "PUBLISHED",
      categories: { some: { categoryId: { in: [category.id, ...subIds] } } },
      ...(timeFilter ? { totalTimeMin: timeFilter } : {}),
      ...(difficultyFilter ? { difficulty: difficultyFilter } : {}),
      ...(kosherFilter ? { kosher: kosherFilter } : {}),
    },
    orderBy,
    take: 60,
  });

  const intro = CATEGORY_INTROS[category.slug];
  const tone = CATEGORY_TONE[category.slug] ?? "bg-section-ink";
  const color = colorForCategory(category.slug);

  // Build URL helper for filter chips
  const buildHref = (key: string, value?: string) => {
    const params = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => {
      if (v && k !== key) params.set(k, v);
    });
    if (value) params.set(key, value);
    const q = params.toString();
    return `/categories/${encodeURIComponent(category.slug)}${q ? "?" + q : ""}`;
  };

  return (
    <main>
      {/* HEADER · colored block with name + intro + sub-category chips */}
      <section className={`${tone}`}>
        <div className="container mx-auto px-6 pt-12 pb-10 md:pt-16 md:pb-14">
          <div className="flex items-center gap-2 mb-4">
            <span className="chip chip-cream">פרק</span>
            <span className="chip chip-cream">{recipes.length} מתכונים</span>
          </div>
          <h1 className="h-display leading-[0.9] max-w-3xl">{category.name}</h1>
          {intro && (
            <p className="voice-sapir text-xl md:text-2xl leading-snug mt-6 max-w-2xl" style={{ color: "inherit", opacity: 0.92 }}>
              {intro}
            </p>
          )}
          {category.children.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {category.children.map((c) => (
                <CategoryPill
                  key={c.id}
                  href={`/categories/${encodeURIComponent(c.slug)}`}
                  label={c.name}
                  color="cream"
                  size="pill"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FILTERS · sticky pill nav row */}
      <div className="sticky top-[6.5rem] z-30 bg-cream-warm/95 backdrop-blur-md border-b border-ink/10">
        <div className="container mx-auto px-6 py-3 flex gap-3 overflow-x-auto no-scrollbar items-center">
          <FilterGroup label="זמן">
            <FilterPill href={buildHref("time")} active={!sp.time} label="הכל" />
            <FilterPill href={buildHref("time", "fast")} active={sp.time === "fast"} label="עד 30 דק׳" color="marigold" />
            <FilterPill href={buildHref("time", "medium")} active={sp.time === "medium"} label="30-60" color="saffron" />
            <FilterPill href={buildHref("time", "long")} active={sp.time === "long"} label="60+" color="tomato" />
          </FilterGroup>

          <span className="w-px h-6 bg-ink/15 shrink-0" />

          <FilterGroup label="רמה">
            <FilterPill href={buildHref("difficulty")} active={!sp.difficulty} label="הכל" />
            <FilterPill href={buildHref("difficulty", "EASY")} active={sp.difficulty === "EASY"} label="קל" color="pistachio" />
            <FilterPill href={buildHref("difficulty", "MEDIUM")} active={sp.difficulty === "MEDIUM"} label="בינוני" color="marigold" />
            <FilterPill href={buildHref("difficulty", "HARD")} active={sp.difficulty === "HARD"} label="מתקדם" color="tomato" />
          </FilterGroup>

          <span className="w-px h-6 bg-ink/15 shrink-0" />

          <FilterGroup label="כשרות">
            <FilterPill href={buildHref("kosher")} active={!sp.kosher} label="הכל" />
            <FilterPill href={buildHref("kosher", "PAREVE")} active={sp.kosher === "PAREVE"} label="פרווה" color="olive" />
            <FilterPill href={buildHref("kosher", "DAIRY")} active={sp.kosher === "DAIRY"} label="חלבי" color="cream" />
            <FilterPill href={buildHref("kosher", "MEAT")} active={sp.kosher === "MEAT"} label="בשרי" color="tomato" />
          </FilterGroup>
        </div>
      </div>

      {/* RECIPES GRID */}
      <section className="bg-cream-warm">
        <div className="container mx-auto px-6 py-12 md:py-16">
          {recipes.length > 0 ? (
            <>
              <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
                <h2 className="h-bold text-2xl md:text-3xl">
                  {recipes.length} מתכונים{sp.time || sp.difficulty || sp.kosher ? " מתאימים" : ""}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-muted">סדר:</span>
                  <Link
                    href={buildHref("sort")}
                    className={`chip ${!sp.sort ? "chip-ink" : ""}`}
                  >
                    הכי חדשים
                  </Link>
                  <Link
                    href={buildHref("sort", "fast")}
                    className={`chip ${sp.sort === "fast" ? "chip-ink" : ""}`}
                  >
                    הכי מהירים
                  </Link>
                  <Link
                    href={buildHref("sort", "name")}
                    className={`chip ${sp.sort === "name" ? "chip-ink" : ""}`}
                  >
                    א-ב
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
                {recipes.map((r) => (
                  <RecipeCard key={r.id} recipe={r} />
                ))}
              </div>
            </>
          ) : (
            <div className="max-w-xl mx-auto text-center py-16">
              <span className="chip chip-cream mb-6">אין תוצאות</span>
              <p className="h-bold text-2xl md:text-3xl mt-3">
                לא מצאנו מתכונים בפילטר הזה.
              </p>
              <p className="text-ink-muted mt-4 leading-relaxed">
                נסי להסיר את הפילטרים או לעבור לקטגוריה אחרת.
              </p>
              <div className="mt-7 flex items-center justify-center gap-3 flex-wrap">
                <Link href={`/categories/${encodeURIComponent(category.slug)}`} className="btn-primary">
                  נקי פילטרים
                </Link>
                <Link href="/search" className="btn-ghost">
                  גלי מתכון אחר
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider me-1">
        {label}
      </span>
      {children}
    </div>
  );
}

function FilterPill({
  href,
  label,
  active,
  color,
}: {
  href: string;
  label: string;
  active?: boolean;
  color?: "tomato" | "marigold" | "saffron" | "olive" | "pistachio" | "cream";
}) {
  if (active) {
    const cls = color ? `chip chip-${color}` : "chip chip-ink";
    return <Link href={href} className={cls}>{label}</Link>;
  }
  return (
    <Link href={href} className="chip hover:chip-ink">
      {label}
    </Link>
  );
}
