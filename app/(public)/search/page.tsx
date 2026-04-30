import { searchRecipes } from "@/lib/search";
import { RecipeCard } from "@/components/recipe-card";

export const metadata = {
  title: "חיפוש מתכון | ספיר אלעזרא",
  description: "חפשו מתכון מתוך כל המתכונים שלי.",
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const results = q ? await searchRecipes(q) : [];
  return (
    <main className="container mx-auto px-6 py-12">
      <h1 className="font-display text-5xl text-burgundy mb-6">חיפוש</h1>
      <form className="mb-12">
        <input
          name="q"
          defaultValue={q}
          placeholder="מה מתחשק לך לבשל?"
          autoFocus
          className="w-full text-xl border-b-2 border-burgundy bg-transparent py-3 focus:outline-none"
        />
      </form>
      {q && (
        <p className="text-ink-muted mb-6">
          {results.length === 0
            ? `לא מצאתי מתכון עבור "${q}"`
            : `${results.length} תוצאות עבור "${q}"`}
        </p>
      )}
      {results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {results.map((r) => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      )}
    </main>
  );
}
