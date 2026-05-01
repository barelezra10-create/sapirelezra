import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "https://sapirelezra.com";
  const [recipes, categories] = await Promise.all([
    db.recipe.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    db.category.findMany({ select: { slug: true } }),
  ]);

  return [
    { url: baseUrl, lastModified: new Date(), priority: 1, changeFrequency: "daily" },
    { url: `${baseUrl}/about`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${baseUrl}/search`, priority: 0.5, changeFrequency: "monthly" },
    ...categories.map((c) => ({
      url: `${baseUrl}/categories/${encodeURIComponent(c.slug)}`,
      priority: 0.7,
      changeFrequency: "weekly" as const,
    })),
    ...recipes.map((r) => ({
      url: `${baseUrl}/recipes/${encodeURIComponent(r.slug)}`,
      lastModified: r.updatedAt,
      priority: 0.9,
      changeFrequency: "monthly" as const,
    })),
  ];
}
