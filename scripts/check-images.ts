import "dotenv/config";
import { db } from "../lib/db";

async function main() {
  const ph = await db.recipe.count({
    where: { heroImage: "/sapir/sapir-wide-kitchen.png" },
  });
  const real = await db.recipe.count({
    where: { heroImage: { not: "/sapir/sapir-wide-kitchen.png" } },
  });
  const total = await db.recipe.count();
  console.log(`total: ${total} | placeholder: ${ph} | real: ${real}`);
  await db.$disconnect();
}

main().catch(console.error);
