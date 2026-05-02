import Link from "next/link";
import Image from "next/image";

type Recipe = {
  slug: string;
  title: string;
  heroImage: string;
  subtitle?: string | null;
  totalTimeMin: number;
  difficulty?: string;
};

function diffLabel(d?: string) {
  if (!d) return null;
  return ({ EASY: "קל", MEDIUM: "בינוני", HARD: "מתקדם" } as Record<string, string>)[d] ?? d;
}

export function RecipeCard({ recipe }: { recipe: Recipe; index?: number }) {
  return (
    <Link
      href={`/recipes/${encodeURIComponent(recipe.slug)}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy rounded-xl"
    >
      <div className="aspect-[4/3] overflow-hidden bg-cream-dark relative rounded-xl">
        <Image
          src={recipe.heroImage}
          alt={recipe.title}
          width={600}
          height={450}
          className="img-hover w-full h-full object-cover"
        />
        {/* Time badge · top corner */}
        <span className="absolute top-2 start-2 chip chip-cream backdrop-blur-sm bg-cream-warm/90">
          {recipe.totalTimeMin} דק׳
        </span>
        {/* Hover dark overlay reveals subtitle */}
        <div className="card-overlay rounded-xl" />
        {recipe.subtitle && (
          <div className="card-subtitle-slide line-clamp-3">{recipe.subtitle}</div>
        )}
      </div>
      <div className="mt-3 space-y-1.5">
        <h3 className="card-title font-body font-bold text-base md:text-lg leading-snug text-ink">
          {recipe.title}
        </h3>
        <div className="flex items-center gap-2 text-[11px] text-ink-muted">
          {diffLabel(recipe.difficulty) && (
            <>
              <span>{diffLabel(recipe.difficulty)}</span>
              <span className="opacity-40">·</span>
            </>
          )}
          <span>{recipe.totalTimeMin} דקות</span>
        </div>
      </div>
    </Link>
  );
}

export function RecipeCardLarge({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      href={`/recipes/${encodeURIComponent(recipe.slug)}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy rounded-2xl"
    >
      <div className="aspect-[16/10] overflow-hidden bg-cream-dark relative rounded-2xl img-vignette">
        <Image
          src={recipe.heroImage}
          alt={recipe.title}
          width={1400}
          height={875}
          className="img-hover w-full h-full object-cover"
          priority
        />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="chip chip-tomato">מתכון השבוע</span>
            <span className="chip chip-cream">{recipe.totalTimeMin} דק׳</span>
          </div>
          <h3 className="font-body font-black text-cream-warm text-3xl md:text-5xl leading-tight tracking-tight">
            {recipe.title}
          </h3>
          {recipe.subtitle && (
            <p className="text-cream-warm/85 mt-2 text-sm md:text-base max-w-xl">
              {recipe.subtitle}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
