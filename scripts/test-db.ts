import "dotenv/config";
import { db } from "../lib/db";

async function main() {
  const count = await db.recipe.count();
  console.log(`Recipes in DB: ${count}`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
