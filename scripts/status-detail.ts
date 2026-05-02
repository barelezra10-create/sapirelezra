import "dotenv/config";
import { db } from "../lib/db";

async function main() {
  const total = await db.recipe.count();
  const pub = await db.recipe.count({ where: { status: "PUBLISHED" } });
  const draft = await db.recipe.count({ where: { status: "DRAFT" } });
  const placeholder = await db.recipe.count({
    where: { heroImage: "/sapir/sapir-wide-kitchen.png" },
  });
  const noImage = await db.recipe.count({
    where: { OR: [{ heroImage: "" }, { heroImage: { startsWith: "/sapir/" } }] },
  });
  console.log(`total: ${total}`);
  console.log(`  PUBLISHED: ${pub}`);
  console.log(`  DRAFT: ${draft}`);
  console.log(`  with placeholder image: ${placeholder}`);
  console.log(`  with non-Unsplash hero: ${noImage}`);
  await db.$disconnect();
}

main().catch(console.error);
