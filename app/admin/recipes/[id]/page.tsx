import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { RecipeForm } from "./form";
import { saveRecipe } from "./actions";

export const dynamic = "force-dynamic";

export default async function EditRecipe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = await db.recipe.findUnique({
    where: { id },
    include: { categories: true, tags: true },
  });
  if (!recipe) notFound();
  const categories = await db.category.findMany({ orderBy: [{ parentId: "asc" }, { order: "asc" }] });

  // Serialize for client component (Date and Decimal won't serialize through 'use client' directly without help)
  const serializable = {
    ...recipe,
    createdAt: recipe.createdAt.toISOString(),
    updatedAt: recipe.updatedAt.toISOString(),
    publishedAt: recipe.publishedAt?.toISOString() ?? null,
    categoryIds: recipe.categories.map((c) => c.categoryId),
    tagIds: recipe.tags.map((t) => t.tagId),
  };

  return (
    <main className="container mx-auto px-6 py-8">
      <h1 className="font-display text-4xl text-burgundy mb-6">{recipe.title}</h1>
      <RecipeForm recipeId={recipe.id} initialJson={JSON.stringify(serializable, null, 2)} action={saveRecipe} />
    </main>
  );
}
