import Link from "next/link";
import { searchRecipes } from "@/lib/search";
import { RecipeCard } from "@/components/recipe-card";

export const metadata = {
  title: "חיפוש מתכון | ספיר אלעזרא",
  description: "חפשו מתכון מתוך כל המתכונים שלי.",
};

const SEARCH_HINTS = ["שקשוקה", "חלה", "ילדים", "טאז'ין", "פסטה", "סבתא"];

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const results = q ? await searchRecipes(q) : [];

  return (
    <main>
      {/* HEADER — eyebrow + huge title + sapir prompt */}
      <section className="border-b border-ink/10">
        <div className="container mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-20">
          <div className="flex items-center gap-3 mb-10 fade-up">
            <span className="eyebrow eyebrow-burgundy">מחפשי השראה</span>
            <span className="flex-1 h-px bg-ink/15 draw-line" />
          </div>
          <div className="grid grid-cols-12 gap-8 md:gap-12 items-end">
            <div className="col-span-12 lg:col-span-7 fade-up" style={{ animationDelay: "120ms" }}>
              <h1 className="section-title text-ink">חפשי משהו</h1>
            </div>
            <div className="col-span-12 lg:col-span-5 fade-up" style={{ animationDelay: "240ms" }}>
              <p className="prose-sapir text-2xl md:text-3xl leading-snug">
                מה את רוצה לבשל היום?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH FORM — large serif input with thick burgundy underline */}
      <section className="border-b border-ink/10 bg-cream">
        <div className="container mx-auto px-6 py-16 md:py-20">
          <form className="max-w-3xl mx-auto">
            <label className="block">
              <span className="eyebrow eyebrow-burgundy block mb-4">מילת חיפוש</span>
              <input
                name="q"
                defaultValue={q}
                placeholder="שקשוקה, חלה, מנה לילדים..."
                autoFocus
                className="font-display w-full text-3xl md:text-5xl bg-transparent border-b-2 border-burgundy py-4 focus:outline-none focus:border-burgundy-deep placeholder:text-ink-muted/50 placeholder:font-display"
              />
            </label>
          </form>

          {/* Hints */}
          <div className="max-w-3xl mx-auto mt-10 flex flex-wrap items-center gap-3">
            <span className="text-xs tracking-[0.22em] uppercase text-ink-muted me-2">
              נסי
            </span>
            {SEARCH_HINTS.map((h) => (
              <Link
                key={h}
                href={`/search?q=${encodeURIComponent(h)}`}
                className="font-display italic text-burgundy text-lg border-b border-burgundy/40 hover:border-burgundy transition-colors"
              >
                {h}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="border-b border-ink/10">
        <div className="container mx-auto px-6 py-24 md:py-32">
          {q ? (
            results.length > 0 ? (
              <>
                <div className="flex items-baseline justify-between flex-wrap gap-6 mb-16">
                  <div>
                    <div className="section-num mb-3">תוצאות</div>
                    <h2 className="section-title">
                      &ldquo;{q}&rdquo;
                    </h2>
                  </div>
                  <p className="text-ink-muted text-sm tracking-[0.18em] uppercase">
                    {results.length} מתכונים
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                  {results.map((r, i) => (
                    <RecipeCard key={r.id} recipe={r} index={i} />
                  ))}
                </div>
              </>
            ) : (
              <div className="max-w-2xl mx-auto text-center py-16">
                <div className="ornament mb-10" />
                <p className="font-display italic text-3xl md:text-4xl leading-snug text-ink">
                  לא מצאתי מתכון עבור &ldquo;{q}&rdquo;.
                </p>
                <p className="text-ink-muted mt-6 leading-relaxed">
                  נסי משהו אחר, או דפדפי בקטגוריות. אני כל הזמן מוסיפה.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-3 text-burgundy text-sm tracking-[0.18em] uppercase border-b border-burgundy pb-1 mt-10 hover:gap-5 transition-all"
                >
                  חזרי לעמוד הבית
                  <span className="text-lg">←</span>
                </Link>
                <div className="ornament mt-10" />
              </div>
            )
          ) : (
            <div className="max-w-2xl mx-auto text-center py-12">
              <div className="ornament mb-10" />
              <p className="font-display italic text-2xl md:text-3xl leading-snug text-ink-muted">
                הקלידי משהו למעלה ואני אמצא לך.
              </p>
              <div className="ornament mt-10" />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
