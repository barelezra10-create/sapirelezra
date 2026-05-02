import "dotenv/config";
import { db } from "../lib/db";

async function main() {
  const recipes = await db.recipe.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, title: true },
    orderBy: { title: "asc" },
  });
  for (const r of recipes) {
    console.log(`${r.title}\t${r.slug}`);
  }
  console.log(`\n=== TOTAL: ${recipes.length} ===`);
  await db.$disconnect();
}

main().catch(console.error);
