import "dotenv/config";
import { db } from "../lib/db";

async function main() {
  const c = await db.recipe.count();
  const j = await db.generationJob.count({ where: { status: "succeeded" } });
  const f = await db.generationJob.count({ where: { status: "failed" } });
  const r = await db.generationJob.count({ where: { status: "running" } });
  console.log(`recipes: ${c} | jobs succeeded: ${j} | failed: ${f} | running: ${r}`);
  await db.$disconnect();
}

main().catch(console.error);
