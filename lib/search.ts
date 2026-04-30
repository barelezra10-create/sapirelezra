import { db } from "./db";
import { Prisma } from "@prisma/client";

export type SearchHit = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  heroImage: string;
  totalTimeMin: number;
};

export async function searchRecipes(query: string, limit = 40): Promise<SearchHit[]> {
  const q = query.trim();
  if (!q) return [];
  return db.$queryRaw<SearchHit[]>(Prisma.sql`
    SELECT id, slug, title, subtitle, "heroImage", "totalTimeMin"
    FROM "Recipe"
    WHERE status = 'PUBLISHED'
      AND (title ILIKE ${`%${q}%`} OR "sapirIntro" ILIKE ${`%${q}%`})
    ORDER BY "publishedAt" DESC NULLS LAST
    LIMIT ${limit};
  `);
}
