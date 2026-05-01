"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function publishAllDrafts() {
  await db.recipe.updateMany({
    where: { status: "DRAFT" },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });
  revalidatePath("/admin/generation");
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function archiveRecipe(id: string) {
  await db.recipe.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });
  revalidatePath("/admin/generation");
  revalidatePath("/admin");
}
