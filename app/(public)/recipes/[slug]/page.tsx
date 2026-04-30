import Image from "next/image";
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

  return (
    <main>
      <RecipeJsonLd recipe={recipe} />

      <section className="relative">
        <div className="aspect-[16/7] relative">
          <Image
            src={recipe.heroImage}
            alt={recipe.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
        <div className="container mx-auto px-6 -mt-16 relative">
          <div className="bg-cream rounded-t-lg p-8 md:p-12">
            <h1 className="font-display text-5xl md:text-6xl text-burgundy">{recipe.title}</h1>
            {recipe.subtitle && <p className="text-xl text-ink-muted mt-2">{recipe.subtitle}</p>}

            <dl className="flex flex-wrap gap-x-8 gap-y-4 mt-6 text-sm">
              <Stat label="זמן הכנה" value={`${recipe.prepTimeMin} דק'`} />
              <Stat label="זמן בישול" value={`${recipe.cookTimeMin} דק'`} />
              <Stat label="סה״כ" value={`${recipe.totalTimeMin} דק'`} />
              <Stat label="מנות" value={recipe.servings.toString()} />
              <Stat label="רמה" value={diffLabel(recipe.difficulty)} />
              <Stat label="כשרות" value={kosherLabel(recipe.kosher)} />
            </dl>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 my-12">
        <blockquote className="border-r-4 border-burgundy pr-6 py-4 bg-white rounded-lg">
          <p className="prose-sapir text-2xl leading-relaxed">{recipe.sapirIntro}</p>
          <cite className="text-sm text-ink-muted block mt-2 not-italic">— ספיר</cite>
        </blockquote>
      </section>

      <section className="container mx-auto px-6 grid md:grid-cols-3 gap-12 mb-16">
        <aside className="md:col-span-1">
          <h2 className="font-display text-3xl mb-4">מצרכים</h2>
          <ScalingIngredients groups={ingredients} defaultServings={recipe.servings} />
        </aside>

        <article className="md:col-span-2">
          <h2 className="font-display text-3xl mb-4">הוראות הכנה</h2>
          <ol className="space-y-6">
            {steps.map((s) => (
              <li key={s.order} className="flex gap-4">
                <span className="font-display text-3xl text-burgundy shrink-0 leading-none">{s.order}</span>
                <div className="flex-1">
                  <p className="text-lg leading-relaxed">{s.text}</p>
                  {s.image && (
                    <Image
                      src={s.image}
                      alt={`שלב ${s.order}`}
                      width={800}
                      height={500}
                      className="mt-3 rounded"
                    />
                  )}
                </div>
              </li>
            ))}
          </ol>
        </article>
      </section>

      {recipe.sapirTips.length > 0 && (
        <section className="bg-burgundy text-cream py-12 my-16">
          <div className="container mx-auto px-6">
            <h2 className="font-display text-3xl mb-6">הטיפים שלי</h2>
            <ul className="space-y-3">
              {recipe.sapirTips.map((tip, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-display text-2xl shrink-0">·</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="container mx-auto px-6 mb-24">
          <h2 className="font-display text-3xl mb-6">מתכונים נוספים שאהבתי</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((r) => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        </section>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function diffLabel(d: string) {
  return ({ EASY: "קל", MEDIUM: "בינוני", HARD: "מתקדם" } as Record<string, string>)[d] ?? d;
}
function kosherLabel(k: string) {
  return ({ DAIRY: "חלבי", MEAT: "בשרי", PAREVE: "פרווה", NOT_KOSHER: "לא כשר" } as Record<string, string>)[k] ?? k;
}
