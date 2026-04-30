"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { recipeInputSchema } from "@/lib/recipe-schema";

export async function saveRecipe(id: string, jsonStr: string) {
  const raw = JSON.parse(jsonStr);
  const parsed = recipeInputSchema.parse(raw);
  const { categoryIds, tagIds, ...recipeData } = parsed;
  await db.$transaction([
    db.categoryOnRecipe.deleteMany({ where: { recipeId: id } }),
    db.tagOnRecipe.deleteMany({ where: { recipeId: id } }),
    db.recipe.update({
      where: { id },
      data: {
        ...recipeData,
        categories: { create: categoryIds.map((cid) => ({ categoryId: cid })) },
        tags: { create: tagIds.map((tid) => ({ tagId: tid })) },
      },
    }),
  ]);
  revalidatePath("/admin");
  revalidatePath(`/recipes/${parsed.slug}`);
}
