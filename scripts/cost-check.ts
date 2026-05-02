import "dotenv/config";
import { db } from "../lib/db";

async function main() {
  const sum = await db.generationJob.aggregate({
    _sum: { costUsd: true },
    where: { status: "succeeded" },
  });
  const ok = await db.generationJob.count({ where: { status: "succeeded" } });
  const fail = await db.generationJob.count({ where: { status: "failed" } });
  console.log("These are SCRIPT ESTIMATES, not actual Google billing:");
  console.log(`  jobs succeeded: ${ok}`);
  console.log(`  jobs failed: ${fail}`);
  console.log(`  estimated cost (sum of costUsd): $${Number(sum._sum.costUsd ?? 0).toFixed(2)}`);
  console.log("");
  console.log("Real cost will be visible in your Google Cloud billing.");
  await db.$disconnect();
}

main().catch(console.error);
