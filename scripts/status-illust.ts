import "dotenv/config";
import { db } from "../lib/db";

async function main() {
  const illust = await db.recipe.count({
    where: { heroImage: { startsWith: "/recipe-illustrations/" } },
  });
  const unsplash = await db.recipe.count({
    where: { heroImage: { startsWith: "https://images.unsplash" } },
  });
  const placeholder = await db.recipe.count({
    where: { heroImage: "/sapir/sapir-wide-kitchen.png" },
  });
  console.log(`illustrations: ${illust} | unsplash: ${unsplash} | placeholder: ${placeholder}`);
  await db.$disconnect();
}

main().catch(console.error);
