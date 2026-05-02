import "dotenv/config";
import { db } from "../lib/db";

async function main() {
  const r = await db.recipe.updateMany({
    where: { status: "DRAFT" },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });
  console.log(`Published ${r.count} drafts.`);
  await db.$disconnect();
}

main().catch(console.error);
