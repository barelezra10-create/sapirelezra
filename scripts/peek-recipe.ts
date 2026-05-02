import "dotenv/config";
import { db } from "../lib/db";

async function main() {
  const term = process.argv[2] ?? "גרטן";
  const recipes = await db.recipe.findMany({
    where: { title: { contains: term } },
    select: { slug: true, title: true, heroImage: true },
    take: 5,
  });
  for (const r of recipes) {
    console.log(`${r.title}\n  ${r.heroImage}\n`);
  }
  await db.$disconnect();
}

main().catch(console.error);
