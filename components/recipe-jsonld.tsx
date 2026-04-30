type Recipe = {
  title: string;
  seoDescription: string;
  heroImage: string;
  galleryImages: string[];
  prepTimeMin: number;
  cookTimeMin: number;
  totalTimeMin: number;
  servings: number;
  ingredients: unknown;
  steps: unknown;
};

type IngredientItem = { name: string; quantity?: string; unit?: string };
type IngredientGroup = { items: IngredientItem[] };
type Step = { order: number; text: string; image?: string };

export function RecipeJsonLd({ recipe }: { recipe: Recipe }) {
  const ingredients = recipe.ingredients as IngredientGroup[];
  const steps = recipe.steps as Step[];
  const json = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.seoDescription,
    image: [recipe.heroImage, ...(recipe.galleryImages ?? [])],
    author: { "@type": "Person", name: "ספיר אלעזרא" },
    prepTime: `PT${recipe.prepTimeMin}M`,
    cookTime: `PT${recipe.cookTimeMin}M`,
    totalTime: `PT${recipe.totalTimeMin}M`,
    recipeYield: `${recipe.servings} מנות`,
    recipeIngredient: ingredients.flatMap((g) =>
      g.items.map((i) => `${i.quantity ?? ""} ${i.unit ?? ""} ${i.name}`.trim())
    ),
    recipeInstructions: steps.map((s) => ({
      "@type": "HowToStep",
      text: s.text,
      ...(s.image ? { image: s.image } : {}),
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
