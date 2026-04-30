import Link from "next/link";
import Image from "next/image";

type Recipe = {
  slug: string;
  title: string;
  heroImage: string;
  subtitle?: string | null;
  totalTimeMin: number;
};

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link href={`/recipes/${encodeURIComponent(recipe.slug)}`} className="group block">
      <div className="aspect-[4/5] overflow-hidden rounded-lg bg-cream-dark">
        <Image
          src={recipe.heroImage}
          alt={recipe.title}
          width={600}
          height={750}
          className="w-full h-full object-cover transition group-hover:scale-105"
        />
      </div>
      <h3 className="font-display text-xl mt-3 group-hover:text-burgundy">{recipe.title}</h3>
      {recipe.subtitle && <p className="text-sm text-ink-muted mt-1">{recipe.subtitle}</p>}
      <p className="text-xs text-ink-muted mt-2">{recipe.totalTimeMin} דקות</p>
    </Link>
  );
}
