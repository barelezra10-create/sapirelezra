import Link from "next/link";
import Image from "next/image";

type Recipe = {
  slug: string;
  title: string;
  heroImage: string;
  subtitle?: string | null;
  totalTimeMin: number;
};

export function RecipeCard({ recipe, index }: { recipe: Recipe; index?: number }) {
  return (
    <Link href={`/recipes/${encodeURIComponent(recipe.slug)}`} className="group block">
      <div className="aspect-[4/5] overflow-hidden bg-cream-dark relative">
        <Image
          src={recipe.heroImage}
          alt={recipe.title}
          width={600}
          height={750}
          className="img-hover w-full h-full object-cover"
        />
        {typeof index === "number" && (
          <span className="absolute top-3 right-3 text-cream-warm font-display italic text-xs tracking-wider bg-burgundy/90 backdrop-blur px-2 py-0.5">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
      </div>
      <div className="mt-4 space-y-1.5">
        <div className="flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-ink-muted">
          <span>{recipe.totalTimeMin} דק׳</span>
        </div>
        <h3 className="card-title font-display text-2xl leading-tight">{recipe.title}</h3>
        {recipe.subtitle && (
          <p className="text-sm text-ink-muted leading-snug pt-0.5 line-clamp-2">{recipe.subtitle}</p>
        )}
      </div>
    </Link>
  );
}

export function RecipeCardLarge({ recipe }: { recipe: Recipe }) {
  return (
    <Link href={`/recipes/${encodeURIComponent(recipe.slug)}`} className="group block">
      <div className="aspect-[3/4] md:aspect-[4/5] overflow-hidden bg-cream-dark relative">
        <Image
          src={recipe.heroImage}
          alt={recipe.title}
          width={1200}
          height={1500}
          className="img-hover w-full h-full object-cover"
          priority
        />
      </div>
      <div className="mt-5 space-y-2">
        <div className="text-[11px] tracking-[0.2em] uppercase text-ink-muted">
          {recipe.totalTimeMin} דקות הכנה
        </div>
        <h3 className="card-title font-display text-3xl md:text-4xl leading-tight">{recipe.title}</h3>
        {recipe.subtitle && <p className="text-base text-ink-muted">{recipe.subtitle}</p>}
      </div>
    </Link>
  );
}
