import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function NewRecipe() {
  const recipe = await db.recipe.create({
    data: {
      slug: `draft-${Date.now()}`,
      title: "מתכון חדש",
      heroImage: "https://placehold.co/1200x800?text=Hero",
      sapirIntro: "פסקה אישית של ספיר. החליפי לפני פרסום (לפחות 20 תווים).",
      prepTimeMin: 0,
      cookTimeMin: 0,
      totalTimeMin: 0,
      servings: 4,
      difficulty: "EASY",
      ingredients: [],
      steps: [],
      sapirTips: [],
      kosher: "PAREVE",
      seoTitle: "מתכון חדש | ספיר אלעזרא",
      seoDescription: "תיאור SEO זמני.",
      status: "DRAFT",
    },
  });
  redirect(`/admin/recipes/${recipe.id}`);
}
